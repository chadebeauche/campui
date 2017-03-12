from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.core.exceptions import ValidationError

import json


def _is_json(s):
    try:
        json.loads(s)
    except Exception as e:
        raise ValidationError("Invalid JSON format : {}".format(e)) from e


class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    parameters = models.TextField(blank=True, validators=[_is_json])
    c2c_id = models.IntegerField(blank=True, null=True)
    outing_queries = models.TextField(validators=[_is_json], default='{"français":{"l":"fr"}}')
    image_queries = models.TextField(validators=[_is_json], default='{"français":{"l":"fr"}}')
    route_queries = models.TextField(validators=[_is_json], default='{"français":{"l":"fr"}}')
    xreport_queries = models.TextField(validators=[_is_json], default='{}')


@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        Profile.objects.create(user=instance)


@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    instance.profile.save()
