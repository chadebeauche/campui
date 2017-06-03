from django.contrib.auth.models import User
from django.http.response import HttpResponse, HttpResponseBadRequest
from django.core.exceptions import ObjectDoesNotExist
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.exceptions import NotFound, PermissionDenied
from .models import Document
from .core import get_document


def get_document_version(name, hid=None, offset=None):
    if not hid:
        doc = get_document(name)
        return doc.history.first()

    doc = Document.history.filter(history_id=hid)[0]

    if not offset:
        return doc

    if offset == "prev":
        return doc.history_object.history.filter(history_id__lt=hid)[0]

    if offset == "next":
        return doc.history_object.history.filter(history_id__gt=hid).order_by("history_id")[0]


def _version_to_json(v):
    result = v.history_object.to_json()

    result["hid"] = v.history_id
    result["date"] = v.history_date
    result["user"] = v.history_user.username if v.history_user else None

    return result


def _versions_to_json(versions):
    return [_version_to_json(v) for v in versions]


class DocumentView(APIView):
    def get(self, request, name):

        view = request.query_params.get('view', None)

        if not view:
            hid = request.query_params.get('hid', None)
            offset = request.query_params.get('offset', None)

            try:
                doc = get_document_version(name, hid, offset)
            except ObjectDoesNotExist:
                raise NotFound()

            return Response(_version_to_json(doc))

        if view == "raw":
            hid = request.query_params.get('hid', None)
            offset = request.query_params.get('offset', None)

            try:
                doc = get_document_version(name, hid, offset)
            except ObjectDoesNotExist:
                return HttpResponse("", content_type="text/plain")

            response = HttpResponse(doc.history_object.content, content_type="text/plain")
            return response

        if view == "history":
            doc = get_document(name)
            limit = request.query_params.get('limit', 30)
            offset = request.query_params.get('offset', 0)
            versions = _versions_to_json(doc.history.all()[offset:offset + limit])

            return Response({"name": name,
                             "versions": versions})

        return HttpResponseBadRequest("Unexpected view mode")

    def post(self, request, name):
        if request.user.is_anonymous():
            raise PermissionDenied()

        doc = get_document(name=name)
        new_doc = request.data["document"]

        doc.content = new_doc.get("content", None)
        doc.metadata = new_doc.get("data", None)
        doc.comment = new_doc["comment"]
        doc.save()

        return Response("ok")

    def put(self, request, name):
        if request.user.is_anonymous():
            raise PermissionDenied()

        data = request.data["document"]
        doc = Document(name=data["name"],
                       content=data.get("content", None),
                       data=data.get("data", None),
                       comment=data.get("comment", "creation"))
        doc.save()

        return Response("ok")


class RecentChangesView(APIView):
    def get(self, request):
        limit = int(request.query_params.get('limit', 30))
        offset = int(request.query_params.get('offset', 0))

        versions = _versions_to_json(Document.history.all()[offset:offset + limit])

        return Response({"versions": versions})


class ContributionsView(APIView):
    def get(self, request, username):
        limit = int(request.query_params.get('limit', 30))
        offset = int(request.query_params.get('offset', 0))

        user = User.objects.get(username=username)
        versions = _versions_to_json(Document.history.filter(history_user=user)[offset:offset + limit])

        return Response({"versions": versions})
