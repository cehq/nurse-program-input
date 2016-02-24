var cehqApp = angular.module('cehqApp',['ui.router', 'cehq.constants','cehq.controllers', 'app.factories', 'cehq.services']);

cehqApp.run(function ($rootScope, $state, AuthService) {
    $rootScope.$on("$stateChangeStart", function(event, toState, toParams, fromState, fromParams){
        if (toState.authenticate && !AuthService.isAuthenticated()){
            // User isn’t authenticated
            $state.transitionTo("login");
            event.preventDefault();
        }
    });
});

cehqApp.config(function($stateProvider, $urlRouterProvider, $httpProvider){

    console.log('config');
    $httpProvider.defaults.cache = false;
    if (!$httpProvider.defaults.headers.get) {
        $httpProvider.defaults.headers.get = {};
    }
    // disable IE ajax request caching
    $httpProvider.defaults.headers.get['If-Modified-Since'] = '0';

    $stateProvider

        .state('home', {
            url: '/home',
            templateUrl: 'views/home.html',
            controller: 'NavBarCtrl',
            cache: false
        })

        .state('programview', {
            url: '/programview',
            templateUrl: 'views/programview.html',
            controller: 'ViewFormCtrl',
            authenticate: true,
            cache: false
        })
        .state('articleSearch', {
            url: '/articleSearch',
            templateUrl: 'views/articleSearch.html',
            controller: 'ArticleSearchCtrl',
            authenticate: true,
            cache: false
        })
        .state('login', {
            url: '/login',
            templateUrl: 'views/login.html',
            controller: 'SignInCtrl',
            cache: false
        })
        .state('logout', {
            url: '/logout',
            controller: 'SignInCtrl'
        })
        .state('programinput', {
            url: '/programinput',
            templateUrl: 'views/programinput.html',
            controller: 'InputFormCtrl',
            authenticate: true,
            cache: false

        })
        .state('programinput.detail', {
            url: '/programinput/:id',
            templateUrl: 'views/programinput.html',
            controller: 'InputFormCtrl',
            authenticate: true,
            cache: false

        })

    ;

    // if none of the above states are matched, use this as the fallback
    $urlRouterProvider.otherwise('/home');

});

