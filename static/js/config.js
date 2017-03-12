/**
 * INSPINIA - Responsive Admin Theme
 * Copyright 2015 Webapplayers.com
 *
 * Inspinia theme use AngularUI Router to manage routing and views
 * Each view are defined as state.
 * Initial there are written state for all view in theme.
 *
 */
function config($stateProvider, $urlRouterProvider, $ocLazyLoadProvider) {
    $urlRouterProvider.otherwise("/");

    $ocLazyLoadProvider.config({
        // Set to true if you want to see what and when is dynamically loaded
        debug: true
    });

    $stateProvider
        .state('home', {
            url: "/",
            templateUrl: "static/views/home.html",
        })

        .state('routes', {
            url: "/routes",
            templateUrl: "static/views/c2c_items.html",
            controller: routesController,
        })

        .state('outings', {
            url: "/outings",
            templateUrl: "static/views/c2c_items.html",
            controller: outingsController,
        })

        .state('xreports', {
            url: "/xreports",
            templateUrl: "static/views/c2c_items.html",
            controller: xreportsController,
        })

        .state('credits', {
            url: "/credits",
            templateUrl: "static/views/credits.html",
        })

        .state('user', {
            url: "/user/{username}",
            templateUrl: 'static/views/user.html',
            controller: function ($scope, $stateParams, api, c2c) {
                $scope.save = function(){
                    console.log($scope.user);
                    api.user.save({username:$stateParams.username}, $scope.user).
                        $promise.
                            then(function(data){
                                console.log("saved");
                            }).
                            catch(function(data){
                                console.log(data.data.detail);
                            });

                };

                api.user.get({username:$stateParams.username}).
                    $promise.
                        then(function(data){
                            $scope.user = data;
                            $scope.user.profile._parameters = JSON.stringify($scope.user.profile.parameters, null, 4);
                            c2c.getOutings($scope, {"u":286726});

                        }).
                        catch(function(data){
                            alert(data.data.detail);
                        });
            }
        })
}

angular.module('campui')

    .config(config)

    .config(["$locationProvider", function($locationProvider) {
        $locationProvider.html5Mode(true);
        }])

    .config(['$httpProvider', function($httpProvider){
        $httpProvider.defaults.xsrfHeaderName = 'X-CSRFToken';
        $httpProvider.defaults.xsrfCookieName = 'csrftoken';
    }])

    .factory('api', function($resource, $http){
        return {
            auth: $resource('/api/auth\\/', {}, {
                login:  {method: 'POST'},
                logout: {method: 'DELETE'},
            }),
            users: $resource('/api/users\\/', {}, {
                create: {method: 'POST'},
            }),
            user: $resource('/api/user/:username', {}, {
                get: {method: 'GET'},
                save: {method: 'PUT'},
            }),
        };
    })

    .factory('c2c', function($http){

        function c2c_query(base_url){
            return function($scope, query){

                query = (typeof query === 'undefined') ? {} : query;
                url_query = jQuery.param(query)

                $http.get(base_url + '?' + url_query)
                    .success(function(data, status, headers, config) {
                        $scope.data = data;
                    })
                    .error(function(data, status, headers, config) {
                        // log error
                    });
            }
        }

        return {
            getOutings : c2c_query('https://api.camptocamp.org/outings'),
            getImages : c2c_query('https://api.camptocamp.org/images'),
            getXreports : c2c_query('https://api.camptocamp.org/xreports'),
            getRoutes : c2c_query('https://api.camptocamp.org/routes'),
            getArticles : c2c_query('https://api.camptocamp.org/articles'),
        }
    })

    .factory('queries', function(){
        return {
            outings : {
                skitouring : {act : "skitouring"},
                snow_ice_mixed : {act : "snow_ice_mixed"},
                mountain_climbing : {act : "mountain_climbing"},
                rock_climbing : {act : "rock_climbing"},
                ice_climbing : {act : "ice_climbing"},
                hiking : {act : "hiking"},
                snowshoeing : {act : "snowshoeing"},
                paragliding : {act : "paragliding"},
                mountain_biking : {act : "mountain_biking"},
                via_ferrata : {act : "via_ferrata"},
                mine : {u : "286726"}
            },
            images : {
                skitouring : {act : "skitouring"},
                snow_ice_mixed : {act : "snow_ice_mixed"},
                mountain_climbing : {act : "mountain_climbing"},
                rock_climbing : {act : "rock_climbing"},
                ice_climbing : {act : "ice_climbing"},
                hiking : {act : "hiking"},
                snowshoeing : {act : "snowshoeing"},
                paragliding : {act : "paragliding"},
                mountain_biking : {act : "mountain_biking"},
                via_ferrata : {act : "via_ferrata"},
            },
            xreports : {},
        }
    })

    .run(function($rootScope, $state) {
        $rootScope.$state = $state;
    });
