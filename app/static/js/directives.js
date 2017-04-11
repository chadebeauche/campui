


/**
 *
 * Pass all functions into module
 */

app = angular.module('campui')

app.directive('pageTitle', ['$rootScope','$timeout',function ($rootScope, $timeout) {
    return {
        link: function(scope, element) {
            var listener = function(event, toState, toParams, fromState, fromParams) {
                // Default title - load on Dashboard 1
                var title = 'CampUI';
                // Create your own title pattern
                if (toState.data && toState.data.pageTitle) title = 'CampUI | ' + toState.data.pageTitle;
                $timeout(function() {
                    element.text(title);
                });
            };
            $rootScope.$on('$stateChangeStart', listener);
        }
    }
}])


app.directive('iboxTools', ['$timeout', function ($timeout) {
    return {
        restrict: 'EA',
        scope: false,
        templateUrl: 'static/views/common/ibox_tools.html',
    };
}])



angular.module('campui')


    .directive('activities', function(){
        return {
            restrict: 'E',
            replace: true,
            scope: {
                activities: '=',
            },
            template: '<img ng-repeat="activity in activities" alt="{{activity}}" ng-src="static/img/{{activity}}-16x16.png"></img>',
        };
    })

    .directive('rating', function(){
        return {
            restrict: 'E',
            scope: {
                route: '=',
            },
            templateUrl: '/static/views/components/rating.html',
        };
    })


/////////////////////////////////////////////////////////////////////


    .directive('loadingInfo', function(){
        return {
            restrict: 'E',
            replace: true,
            scope: true,
            templateUrl: '/static/views/components/loading_info.html',
        };
    })


    .directive('gallery', function(){
        return {
            restrict: 'EA',
            replace: false,
            scope: {
                images: '=',
            },
            templateUrl: '/static/views/components/image_gallery.html',
            controller:["$scope","locale", function($scope, locale){
                // https://github.com/dimsemenov/PhotoSwipe/issues/580
                // history is important, see comment of mutac
                $scope.photoswipe = {opts:{index:0,history:false}}
                ps = $scope.photoswipe

                ps.showGallery = function (i) {
                    ps.opts.index = i;
                    ps.slides = []
                    $scope.images.forEach(function (image) {
                        ps.slides.push({
                            src:"https://media.camptocamp.org/c2corg_active/" + image.filename.replace('.', 'BI.').replace('.svg', '.jpg'),
                            w:0,h:0,
                            title:locale.get(image).title
                        })
                    })
                    ps.open = true;
                };

                ps.closeGallery = function () {
                    ps.open = false;
                };
            }]
        };
    })

    .directive('outingIbox', function(){
        return {
            restrict: 'E',
            replace: true,
            scope: {
                outings: '=',
            },
            templateUrl: '/static/views/components/outing_ibox.html',
        };
    })

    .directive('authorLink', function(){
        return {
            restrict: 'E',
            scope: {author:"="},
            template: '<a ui-sref="user({id:author.user_id})">{{author.name}}</a>',
        };
    })

    .directive('qualityIcon', function(){
        return {
            restrict: 'E',
            scope: {quality:"="},
            replace: true,
            template: '<i class="fa fa-star quality-{{quality}}"></i>',
        };
    })

    .directive('conditionIcon', function(){
        tooltip = "{{'Conditions : ' | translate }}{{condition | translate}}"

        return {
            restrict: 'E',
            scope: {condition:"="},
            replace: true,
            template: '<i ng-show="condition" class="fa fa-circle condition-{{condition}}" uib-tooltip="' + tooltip + '"></i>',
        };
    })

    .directive('areas', function(){

        return {
            restrict: 'EA',
            scope: {areas:"="},
            template: '<span ng-repeat="area in areas"><area-link area="area"></area-link>{{$last ? "" : ", "}}</span>',
        };
    })

    .directive('queryEditor', function(){
        return {
            restrict: 'E',
            scope: true,
            templateUrl: 'static/views/components/query_editor.html',
        };
    })
    ;


c2cItems = {
    user:{
        label:"name",
        detailled_controller: ['$scope','$stateParams','api','c2c',function($scope, $stateParams, api, c2c){
            $scope.user = c2c.user.get($stateParams);
            $scope.outings = c2c.outings.get({query:"u=" + $stateParams.id});
        }]
    },
    outing:{},
    route:{
        label_prefix:"title_prefix",
    },
    article:{},
    waypoint:{},
    xreport:{},
    image:{},
    area:{},
}

$.each(c2cItems, function(item, params){

    var controller = ['$scope','locale', function($scope, locale){
        $scope.getLocale = function(item){return locale.get(item)}
    }]

    params.label = params.label ? item + '.' + params.label : 'getLocale(' + item + ').title'

    var label = '{{' + params.label + '}}';

    if(params.label_prefix){
        prefixModel = 'getLocale(' + item + ').' + params.label_prefix
        label = '<span ng-if="' + prefixModel + '">{{' + prefixModel + '}} : </span>' + label
    }

    angular.module('campui').directive(item + 'LinkC2c', function(){

        result = {
            restrict: 'E',
            scope: {},
            template: '<a class="c2c" target="_blank" href="https://www.camptocamp.org/' + item + 's/{{' + item + '.document_id}}">' + label + '</a>',
            controller: controller
        };

        result.scope[item] = "=";

        return result;
    })

    angular.module('campui').directive(item + 'Link', function(){
        result =  {
            restrict: 'E',
            scope: {},
            template: '<a ui-sref="' + item + '({id:' + item + '.document_id})">' + label + '</a>',
            controller: controller
        };

        result.scope[item] = "=";

        return result;
    })

    angular.module('campui').directive(item + 'List', function(){
        result =   {
            restrict: 'E',
            replace: true,
            scope: {},
            templateUrl: '/static/views/components/' + item + '_list.html',
        };

        result.scope[item + "s"] = "=";

        return result;
    })

})
