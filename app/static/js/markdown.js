
app = angular.module('campui')

app.provider('markdownConverter', function () {
    var opts = {
        simpleLineBreaks : true,
        headerLevelStart : 2,
        simplifiedAutoLink: true,
        extensions : ['c2c_folies'],
        };

    var c2c_folies = function () {
        var italic = {
            type: 'lang',
            regex: /\[i\](.*)\[\/i\]/g,
            replace: function (match, text) {
                return '<i>'+ text + '</i>';
            }
        };

        var bold = {
            type: 'lang',
            regex: /\[b\](.*)\[\/b\]/g,
            replace: function (match, text) {
                return '<strong>'+ text + '</strong>';
            }
        };

        var img = {
            type: 'lang',
            regex: /\[img=([\d]+)( right| center| big| inline)*\/\]/g,
            replace: function (match, imgId, position, size) {
                return '<img src="https://api.camptocamp.org/images/proxy/' + imgId + '?size=MI" />';
            }
        };

        var imgLegend = {
            type: 'lang',
            regex: /\[img=([\d]+)( right| center| big| inline)*\]([^\[]*)\[\/img\]/g,
            replace: function (match, imgId, position, legend) {
                console.log(match,imgId,position,legend)
                return '<img src="https://api.camptocamp.org/images/proxy/' + imgId + '?size=MI" />';
            }
        };

        var url = {
            type: 'lang',
            regex: /\[url\]([^\[]*)\[\/url\]/g,
            replace: function (match, url) {
                return '<a href="' + url + '">' + url + '</a>';
            }
        };

        var url2 = {
            type: 'lang',
            regex: /\[url=([^\]]+)\]([^\[]*)\[\/url\]/g,
            replace: function (match, url, text) {
                return '<a href="' + url + '">' + text + '</a>';
            }
        };

        var c2cItem = {
            type: 'lang',
            regex: /\[\[(waypoint|route)s\/([\d]+)(\/fr)?\|([^\]]*)\]\]/g,
            replace: function (match, item, id, lang, text) {
                return '<a href="' + item + '/' + id + '">' + text + '</a>';
            }
        };

        line_count = 4

        content_pattern = "(?:[^](?!\\nL#|\\n\\n|\\|))*."
        first_cellPattern = "(L#" + content_pattern + ")"
        cell_pattern = "(\\|" + content_pattern + ")?"

        row_pattern = "(?:" + first_cellPattern + cell_pattern + cell_pattern + cell_pattern + cell_pattern + cell_pattern + "\\n)"
        pattern = row_pattern + row_pattern + "?" + row_pattern + "?" + row_pattern + "?" + row_pattern

        var ltag = {
            type: 'lang',
            regex: RegExp(pattern, 'gm'),
            replace: function () {
                result = ["<table>"]
                pos = 1
                n = 1
                for(l=0;l<line_count;l++){
                    result.push("<tr>")
                    if(!arguments[pos])
                        break

                    cell1 = (arguments[pos] || "").trim()
                    cotation = (arguments[pos+1] || "").trim()
                    length = (arguments[pos+2] || "").trim()
                    gears = (arguments[pos+3] || "").trim()
                    description = (arguments[pos+4] || "").trim()
                    belay = (arguments[pos+5] || "").trim()


                    if(cell1.substring(0,3)=="L#~"){
                        cell1 = cell1.replace("L#~", "")
                    }
                    else if(cell1=="L#"){
                        cell1 = cell1.replace("L#", "L" + n)
                        n++
                    }

                    if(!cotation && !length && !gears && !belay)
                        result.push("<td colspan='5'>" + cell1.replace("|","") + "</td>")
                    else{
                        result.push("<td>" + cell1 + "</td>")
                        result.push("<td>" + cotation.replace("|","") + "</td>")
                        result.push("<td>" + length.replace("|","") + "</td>")
                        result.push("<td>" + gears.replace("|","") + "</td>")
                        result.push("<td>" + description.replace("|","") + "</td>")
                        result.push("<td>" + belay.replace("|","") + "</td>")
                    }
                    pos +=6

                    result.push("</tr>")
                }
                result.push("</table>")
                return result.join("");
            }
        };

        return [ltag, italic, bold, img, imgLegend, url, url2, c2cItem];
    }

    showdown.extension('c2c_folies', c2c_folies);

    return {
        $get: function () {

            return new showdown.Converter(opts);
        }
    };
})

app.directive('markdown', ['$sanitize', 'markdownConverter', function ($sanitize, markdownConverter) {
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
            if (attrs.markdown) {
                scope.$watch(attrs.markdown, function (newVal) {
                    var html = newVal ? $sanitize(markdownConverter.makeHtml(newVal)) : '';
                    element.html(html);
                });
            } else {
                var html = $sanitize(markdownConverter.makeHtml(element.text()));
                element.html(html);
            }
        }
    };
}])
