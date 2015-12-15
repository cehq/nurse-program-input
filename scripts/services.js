var cehqServices = angular.module('cehq.services', []);

// all server access is now abstracted in the 'server' object
cehqServices.factory('server', function( messages, appConstants ){

  return {

    getSiteCatalog: function( success, failure ) {

      var requestURL =
          appConstants.BASE_URL +
          '/siteCatalog?userId=' +
          7; //user.userId;

      var xmlHttp = new XMLHttpRequest();

      xmlHttp.open( "GET", requestURL, true );

      var requestTimer = setTimeout(function() {

        // message has timed out
        xmlHttp.abort();

        failure( messages.SERVICE_ERROR, messages.SERVICE_TIMEOUT );

      }, appConstants.REQUEST_TIMEOUT );

      xmlHttp.onreadystatechange = function() {

        if ( xmlHttp.readyState == appConstants.REQUEST_COMPLETE ) {

          console.log('getSiteCatalog - request complete');

          // request is complete so we no longer need the timeout
          clearTimeout( requestTimer );

          switch ( xmlHttp.status ) {

            case appConstants.REQUEST_SUCCESS:
              console.log('request success');
              var responseJSON = JSON.parse( xmlHttp.responseText );
              success( responseJSON );
              break;

            case appConstants.REQUEST_INTERNAL_SERVER_ERROR:
              console.log('internal server error');
              failure( messages.SERVICE_ERROR, messages.INTERNAL_SERVER_ERROR );
              break;

            default:
              console.log('default');
              failure( messages.SERVICE_ERROR, messages.UNABLE_TO_CONNECT );

          }

        }

      };

      xmlHttp.send( null );

    }

  };

});