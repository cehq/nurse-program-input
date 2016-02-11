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

cehqApp.config(function($stateProvider, $urlRouterProvider){

    console.log('config');
    //$httpProvider.defaults.useXDomain = true;
    //$httpProvider.defaults.withCredentials = true;
    //delete $httpProvider.defaults.headers.common['X-Requested-With'];

    // TODO: this is to allow CORS access this mechanism is not recommended
    //$sceProvider.enabled(false);

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
            authenticate: true

        })
        .state('programinput.detail', {
            url: '/programinput/:id',
            templateUrl: 'views/programinput.html',
            controller: 'InputFormCtrl',
            authenticate: true

        })

    ;

    // if none of the above states are matched, use this as the fallback
    $urlRouterProvider.otherwise('/home');

});

