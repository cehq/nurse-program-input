var cehqApp = angular.module('cehqApp',['ngRoute','cehq.controllers']);

cehqApp.config(['$routeProvider',
  function($routeProvider) {

    $routeProvider.
        when('/home', {
          templateUrl: 'views/home.html',
        }).
        when('/poc', {
          templateUrl: 'views/poc.html',
        }).
        when('/credit', {
          templateUrl: 'views/credit.html',
        }).
        when('/mobile', {
          templateUrl: 'views/mobile.html',
        }).
        when('/accreditation', {
          templateUrl: 'views/accreditation.html',
        }).
        when('/contact', {
          templateUrl: 'views/contact.html',
        }).
        when('/programinput', {
          templateUrl: 'views/programinput.html',
          controller:  'InputFormCtrl',
        }).
        when('/programview', {
          templateUrl: 'views/programview.html',
          controller:  'ViewFormCtrl',
        }).
        when('/test', {
          templateUrl: 'views/test.html',
          controller:  'TestCtrl',
        }).
        otherwise({
          redirectTo: '/home'
        });

  }]);

