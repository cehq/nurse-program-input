var cehqServices = angular.module('cehq.services', []);
var programData = null;

cehqServices.factory('AuthService', function(messages, appConstants, $http, $q, accountHelpers, $localstorage) {
    return {
        isAuthenticated: function() {
            return accountHelpers.isAuthenticated();
        },
        logout: function() {
            return accountHelpers.doLogout();
        }
    };

});


// all server access is now abstracted in the 'server' object
cehqServices.factory('server', function(messages, appConstants, $http, $q, $localstorage) {

    return {

        login: function(username, password) {
            console.log('login');
            var url = BASE_URL + '/service/login';


            console.log('signIn: ' + url);

            $http.defaults.headers.common.Authorization = 'Basic ' + btoa(username + ':' + password);
            $http.defaults.headers.common["Content-Type"] = "application/json";

            return $http.get(url)
                .then(function successCallback(response) {
                    //alert("success: " + JSON.stringify(response));
                    //alert("success: " + response.data + " ; status: " + response.status +             " ; headers: " + response.headers + " ; config: " + JSON.stringify(response.config));

                    return response;
                }, function errorCallback(response) {
                    alert("error: " + JSON.stringify(response));
                    return response;
                });
        },

        getSiteCatalog: function(success, failure) {

            var requestURL =
                BASE_URL +
                '/siteCatalog?userId=' +
                7; //user.userId;

            var xmlHttp = new XMLHttpRequest();

            xmlHttp.open("GET", requestURL, true);

            var requestTimer = setTimeout(function() {

                // message has timed out
                xmlHttp.abort();

                failure(messages.SERVICE_ERROR, messages.SERVICE_TIMEOUT);

            }, appConstants.REQUEST_TIMEOUT);

            xmlHttp.onreadystatechange = function() {

                if (xmlHttp.readyState == appConstants.REQUEST_COMPLETE) {

                    console.log('getSiteCatalog - request complete');

                    // request is complete so we no longer need the timeout
                    clearTimeout(requestTimer);

                    switch (xmlHttp.status) {

                        case appConstants.REQUEST_SUCCESS:
                            console.log('request success');
                            var responseJSON = JSON.parse(xmlHttp.responseText);
                            success(responseJSON);
                            break;

                        case appConstants.REQUEST_INTERNAL_SERVER_ERROR:
                            console.log('internal server error');
                            failure(messages.SERVICE_ERROR, messages.INTERNAL_SERVER_ERROR);
                            break;

                        default:
                            console.log('default');
                            failure(messages.SERVICE_ERROR, messages.UNABLE_TO_CONNECT);

                    }

                }

            };

            xmlHttp.send(null);

        },

        getPrograms: function(programStatus) {
            console.log('getPrograms: ' + programStatus);
            var url = BASE_URL + '/service/programs/names?status=' + programStatus;
            console.log('getPrograms: ' + url);
            var myJwt = $localstorage.get("jwt", "");

            $http.defaults.headers.common.Authorization = 'Bearer ' + myJwt;
            $http.defaults.headers.common["Content-Type"] = "application/json";

            return $http.get(url)
                .then(function successCallback(response) {
                    //alert("success: " + JSON.stringify(response));
                    return response;
                }, function errorCallback(response) {
                    return response;
                });
        },

        getDraftPrograms: function() {


            // DEV - Get data from MOCK data
            return $http.get('data/programs.json').then(function(data) {
                if (!programData) {
                    programData = data.data;
                }

                var programs = programData;
                var retPrograms = {
                    data: []
                };
                for (i = 0; i < programs.length; i++) {
                    if (programs[i].program_status === "draft") {
                        retPrograms.data.push(programs[i]);
                    }
                }
                return retPrograms;
            });


        },

        getSubmittedPrograms: function() {


            // DEV - Get data from MOCK data
            return $http.get('data/programs.json').then(function(data) {
                if (!programData) {
                    programData = data.data;
                }
                var programs = programData;
                var retPrograms = {
                    data: []
                };
                for (i = 0; i < programs.length; i++) {
                    if (programs[i].program_status === "submitted") {
                        retPrograms.data.push(programs[i]);
                    }
                }
                return retPrograms;
            });
        },

        getReviewedPrograms: function() {


            // DEV - Get data from MOCK data
            return $http.get('data/programs.json').then(function(data) {
                if (!programData) {
                    programData = data.data;
                }
                var programs = programData;
                var retPrograms = {
                    data: []
                };
                for (i = 0; i < programs.length; i++) {
                    if (programs[i].program_status === "reviewed") {
                        retPrograms.data.push(programs[i]);
                    }
                }
                return retPrograms;
            });
        },

        getAcceptedPrograms: function() {


            // DEV - Get data from MOCK data
            return $http.get('data/programs.json').then(function(data) {
                if (!programData) {
                    programData = data.data;
                }
                var programs = programData;
                var retPrograms = {
                    data: []
                };
                for (i = 0; i < programs.length; i++) {

                    if (programs[i].program_status === "accepted") {
                        retPrograms.data.push(programs[i]);
                    }
                }
                return retPrograms;
            });
        },

        getProgram: function(id) {
            console.log('getProgram: ' + id);
            var url = BASE_URL + '/service/programs/' + id;

            var myJwt = $localstorage.get("jwt", "");

            $http.defaults.headers.common.Authorization = 'Bearer ' + myJwt;
            $http.defaults.headers.common["Content-Type"] = "application/json";

            return $http.get(url)
                .then(function successCallback(response) {
                    //alert("success: " + JSON.stringify(response));
                    return response;
                }, function errorCallback(response) {
                    return response;
                });

            return $http.get('data/programs.json').then(function(data) {
                if (!programData) {
                    programData = data.data;
                }
                var programs = programData;
                for (i = 0; i < programs.length; i++) {
                    if (programs[i].id == id) {
                        var retProgram = {
                            data: programs[i]
                        }
                        return retProgram;
                    }
                }
            });
        },
        updateProgram: function(program) {
            console.log('getProgram: ' + program.id);
            var url = BASE_URL + '/service/programs/' + program.id;

            var myJwt = $localstorage.get("jwt", "");

            $http.defaults.headers.common.Authorization = 'Bearer ' + myJwt;
            $http.defaults.headers.common["Content-Type"] = "application/json";

            return $http.put(url, program)
                .then(function successCallback(response) {
                    //alert("success: " + JSON.stringify(response));
                    return response;
                }, function errorCallback(response) {
                    alert("error: " + JSON.stringify(response));
                    return response;
                });
        },

        addProgram: function(program) {
            console.log('getProgram: ' + program.id);
            var url = BASE_URL + '/service/programs/' + program.id;

            var myJwt = $localstorage.get("jwt", "");

            $http.defaults.headers.common.Authorization = 'Bearer ' + myJwt;
            $http.defaults.headers.common["Content-Type"] = "application/json";

            return $http.post(url, program)
                .then(function successCallback(response) {
                    //alert("success: " + JSON.stringify(response));
                    return response;
                }, function errorCallback(response) {
                    alert("error: " + JSON.stringify(response));
                    return response;
                });
        },
        deleteProgram: function(id) {
            var url = BASE_URL + '/service/programs/' + id;
            console.log('url: ' + url);
            var myJwt = $localstorage.get("jwt", "");

            $http.defaults.headers.common.Authorization = 'Bearer ' + myJwt;
            $http.defaults.headers.common["Content-Type"] = "application/json";

            return $http.delete(url)
                .then(function successCallback(response) {
                    //alert("success: " + JSON.stringify(response));
                    return response;
                }, function errorCallback(response) {
                    alert("error: " + JSON.stringify(response));
                    return response;
                });
        },
        checkLAUrl: function(url) {

            var url = BASE_URL + '/service/checkUrl?url=' + url;
            console.log('url: ' + url);
            var myJwt = $localstorage.get("jwt", "");

            $http.defaults.headers.common.Authorization = 'Bearer ' + myJwt;
            $http.defaults.headers.common["Content-Type"] = "application/json";

            return $http.get(url)
                .then(function successCallback(response) {
                    //alert("success: " + JSON.stringify(response));
                    //alert("success: " + response.data + " ; status: " + response.status +             " ; headers: " + response.headers + " ; config: " + JSON.stringify(response.config));

                    return response;
                }, function errorCallback(response) {
                    //alert("error: " + JSON.stringify(response));
                    return response;
                });
        }
    };

});
