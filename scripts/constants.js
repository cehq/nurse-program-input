var cehqConstants = angular.module('cehq.constants', []);

cehqConstants.constant('mainMenuAnonymous', [
    /* { label: 'Home',            page: 'home' },
     { label: 'Point of Care',   page: 'poc' },
     { label: 'Credit Tracking', page: 'credit' },
     { label: 'Mobile Devices',  page: 'mobile' },
     { label: 'Accreditation',   page: 'accreditation' },
     { label: 'Contact Us',      page: 'contact' },*/
    {
        label: 'Program Management',
        page: 'programview'
    },
    /* { label: 'Program Input',   page: 'programinput' },
     { label: 'Test',            page: 'test' }*/
]);

cehqConstants.constant('rightMenuAnonymous', [{
    label: 'Subscribe',
    page: 'subscribe'
}, {
    label: 'Sign In',
    page: 'signin'
}]);


cehqConstants.constant('mainMenuSignedIn', [{
    label: 'Start Here',
    page: 'start'
}, {
    label: 'Topic Search',
    page: 'topic'
}, {
    label: 'Site Management',
    page: 'site'
}, {
    label: 'Credit Management',
    page: 'credit'
}, {
    label: 'My Profile',
    page: 'profile'
}, {
    label: 'Feedback',
    page: 'feedback'
}]);

cehqConstants.constant('rightMenuSignedIn', [{
    label: 'Sign Out',
    page: 'signout'
}]);

cehqConstants.constant('messages', {

    AUTHENTICATION_FAILURE: 'Authentication Failure',
    SERVICE_ERROR: 'Service Error',


    INVALID_USERNAME_PASSWORD: 'Invalid username or password',
    UNABLE_TO_CONNECT: 'Unable to connect to CEHQ server',
    SERVICE_TIMEOUT: 'Server Timeout',
    INTERNAL_SERVER_ERROR: 'Server Error'

});

cehqConstants.constant('appConstants', {

    REQUEST_TIMEOUT: 5000, // AJAX Request timeout in ms

    REQUEST_COMPLETE: 4,
    REQUEST_SUCCESS: 200,

    //BASE_URL: 'http://localhost:9000/cehq'

    //BASE_URL: 'http://54.68.24.128:80/cehq'

    // LOCAL DEV
    //BASE_URL: 'http://localhost:8080'

    BASE_URL: 'http://localhost:8100'


});
