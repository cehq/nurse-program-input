var masterProgram;

var cehqControllers = angular.module('cehq.controllers',['ui.bootstrap','cehq.constants', 'cehq.services',
                                                         'app.factories','smart-table','angularSpinners', 'ngMessages',
                                                         'ngclipboard']);


cehqControllers.controller('NavBarCtrl', function ($scope,
                                                   $state,
                                                   $modal,
                                                   AuthService,
                                                   $location,
                                                   mainMenuAnonymous,
                                                   rightMenuAnonymous,
                                                   mainMenuSignedIn,
                                                   rightMenuSignedIn) {

    console.log("NavBarCtrl");
  $scope.isCollapsed = true;

  $scope.mainMenuItems = mainMenuAnonymous;

  $scope.rightMenuItems = rightMenuAnonymous;

  $scope.currentPage = "home";

  $scope.checkAuth = function () {
      $scope.isAuthenticated = AuthService.isAuthenticated();
  };
    $scope.isAuth = function () {
        return AuthService.isAuthenticated();
    };

    $scope.logout = function () {
        AuthService.logout();
        $scope.isAuthenticated = false;
        $state.go("home");
    };


  $scope.isCurrentPage = function (page) {
    return page == $scope.currentPage ? 'active' : '';
  }

  $scope.toggleMenu = function (page) {

    if( page ) {
      // only set if page is defined
      $scope.currentPage = page;
    }

    if (window.innerWidth < 767) {
      // only toggle if using small display
      $scope.isCollapsed = !$scope.isCollapsed;
    }
  }

  $scope.openModal = function (path) {

    $scope.toggleMenu();

    var signInModal = $modal.open({

      templateUrl: "modals/" + path + ".html",
      windowClass: 'app-modal-window',
      controller:  'SignInCtrl'

    });

  };

});

cehqControllers.controller('SignInCtrl', function ($scope, $state, server, AuthService, $localstorage, $location) {

  console.log('SignInCtrl');

  $scope.vm = {};
  $scope.vm.username = $localstorage.get("email", "");
  $scope.vm.password = ""; //$localstorage.get("password", "");
  $scope.vm.rememberMe = ($localstorage.get("remember_me", "true") === 'true');

  $scope.login = function () {
    console.log('login');
    server.login($scope.vm.username ,$scope.vm.password).then(function(userLogin) {
      console.log('userLogin: ' + JSON.stringify(userLogin));
      if (userLogin.status === 401) {
        alert("ERROR - Bad username or password");
      } else if (userLogin.status === 200) {
        $localstorage.set("jwt", userLogin.data.jwt);
          if($scope.vm.rememberMe) {
              $localstorage.set("email", $scope.vm.username);
          }
          $scope.isAuthenticated = AuthService.isAuthenticated();
          $state.go('programview');

      } else {
        alert("error: " + userLogin.data + " ; status: " + userLogin.status +
            " ; headers: " + userLogin.headers + " ; config: " + JSON.stringify(userLogin.config));
      }

    });


  };

});

cehqControllers.controller('ArticleSearchCtrl', function ($scope, $state, server, AuthService, $localstorage, $location) {
    //this.toClipboard = ngClipboard.toClipboard;
    console.log('ArticleSearchCtrl');

    $scope.data = {};
    $scope.data.searchTerm = $localstorage.get("last_search", "");
    $scope.didSearch = false;
    $scope.data.includeBMJ = ($localstorage.get("include_bmj", "true") === 'true');
    $scope.data.includeCK = ($localstorage.get("include_clinical_key", "true") === 'true');
    $scope.data.anyTerms = ($localstorage.get("include_any", "true") === 'true');

    $scope.doSearch = function () {
        $scope.didSearch = true;
        console.log('doSearch');
        $localstorage.set("last_search", $scope.data.searchTerm);
        $localstorage.set("include_any", $scope.data.anyTerms);
        server.articleSearch($scope.data.searchTerm).then(function(response) {
            //alert("response: " + JSON.stringify(response.data.response));
            $scope.totalResults = response.data.response.numFound;
            $scope.searchTableItems = response.data.response.docs;
            $scope.displayedSearchCollection = angular.copy($scope.searchTableItems.docs);
            console.log(JSON.stringify($scope.displayedSearchCollection));
        });
    };

    $scope.includeWebsite = function() {
        $localstorage.set("include_bmj", $scope.data.includeBMJ);
        $localstorage.set("include_clinical_key", $scope.data.includeCK);
    };
});

cehqControllers.controller('TestCtrl', function ($scope, $sce) {

  var sites = [
    {name: 'AHRQ - Agency for Healthcare Research and Quality', url: 'http://www.ahrq.gov/'},
    {name: 'CDC (Centers for Disease Control and Prevention)', url: 'http://www.cdc.gov/'},
    {name: 'Center for Scientific Review', url: 'http://public.csr.nih.gov/'},
    {name: 'Clinical Key', url: 'https://www.clinicalkey.com/'},
    {name: 'Cochrane', url: 'http://www.cochrane.org/'},
  ];

  window.recordURL = function(url) {
    console.log("iFrame URL: " + url);
  };

  var index = Math.floor((Math.random()*5));

  $scope.siteURL  = $sce.trustAsResourceUrl(sites[index].url);
  $scope.siteName = sites[index].name;

  $scope.showURL = function () {
    console.log($scope.siteURL.toString());
    console.log(document.getElementById('theIFrame').contentWindow.location.href)
  }

});

cehqControllers.controller('InputFormCtrl', function ($scope, $http, $location, $stateParams, $modal, server, spinnerService) {

    $scope.setLoading = function(loading) {
        if (loading) {
            spinnerService.show('programSpinner');
        } else{
            spinnerService.hide('programSpinner');
        }
    }

    masterProgram = angular.copy($scope.program);

    $scope.doInit = function (  ) {
        var id = $stateParams.id;

      if(id) {
        $scope.setLoading(true);
        $scope.pid = id;
        server.getProgram(id).then(function (program) {
          console.log("InputFormCtrl: " + id);
          $scope.program = program.data;
          //console.log("Program: " + JSON.stringify($scope.program));
          if(!$scope.program.objectives || $scope.program.objectives.length == 0) {
            $scope.program.objectives = [{"objective": " "}, {"objective": " "}, {"objective": " "}];
          }
          if(!$scope.program['learningActivities'] || $scope.program['learningActivities'].length == 0) {
            $scope.program['learningActivities'] = [{"name": "Activity 1"},{"name": "Activity 2"},{"name": "Activity 3"},{"name": "Activity 4"},{"name": "Activity 5"}];
          }
            //console.log("objectives: " + $scope.program.objectives);
            //if ($scope.program.objectives[0])
          // To simplify the cross between the data and the web input, look at the learningActivities

            for (i = 0; i < $scope.program['learningActivities'].length; i++) {
                if ($scope.program['learningActivities'][i]['questions']) {
                    console.log("learningActivities: " + $scope.program['learningActivities'][i].name);
                    if ($scope.program['learningActivities'][i]['questions'][0]['questionType']['type'] == 1) { // Handle Multiple Choice
                        if ($scope.program['learningActivities'][i]['questions'][0] && $scope.program['learningActivities'][i]['questions'][0]['questionChoices']) {
                            //console.log("LA: " + JSON.stringify($scope.program['learningActivities'][i]['questions'][0]));
                            for (j = 0; j < $scope.program['learningActivities'][i]['questions'][0]['questionChoices'].length; j++) {
                                //console.log("questionChoices: " + $scope.program['learningActivities'][i]['questions'][0]['questionChoices'][j].isCorrect);
                                if ($scope.program['learningActivities'][i]['questions'][0]['questionChoices'][j].isCorrect == 1) {
                                    //console.log("Answer: " + $scope.program['learningActivities'][i]['questions'][0]['questionChoices'][j].choice);
                                    console.log("Answer Index: " + j);
                                    $scope.program['learningActivities'][i]['questions'][0].answer = j.toString();
                                    //console.log('Answer: ' + JSON.stringify($scope.program['learningActivities'][i]['questions'][0]));
                                }
                            }
                        }
                    } else { //Not Multiple choice probably True/False
                        if ($scope.program['learningActivities'][i]['questions'][0]['tf'] == 1) {
                            //console.log("Answer: " + $scope.program['learningActivities'][i]['questions'][0]['questionChoices'][j].choice);
                            //$scope.program['learningActivities'][i]['questions'][0].answer = j.toString();
                            //console.log('Answer: ' + JSON.stringify($scope.program['learningActivities'][i]['questions'][0]));
                        }

                    }
                }
            }
        }).finally(function () {
            // no matter what happens, hide the spinner when done
            $scope.setLoading(false);
        });

      } else {// NEW Program, set defaults
        $scope.program = { "id" : "", "name" : ""  };
        $scope.program.goal = "The goal of this activity is to provide information on the pathophysiology, diagnosis, treatment and nursing interventions for patients with ";
        $scope.program['status'] = {"id": 1, "status": "draft"};
        $scope.program.objectives = [{"objective": "Discuss the pathophysiology of ","order": 1},
                                     {"objective": "Describe the signs and symptoms of ","order": 2},
                                     {"objective": "Develop safe and effective care plans for ","order": 3}];
        $scope.program['learningActivities'] = [{"name": "Activity 1","questions": [{"question": "",}]},
                                                {"name": "Activity 2","questions": [{"question": "",}]},
                                                {"name": "Activity 3","questions": [{"question": "",}]},
                                                {"name": "Activity 4","questions": [{"question": "",}]},
                                                {"name": "Activity 5","questions": [{"question": "",}]}];
          //$scope.program['learningActivities'][i]['questions'][0]
        $scope.qType = {};
      }
    };

  $scope.goToProgramView = function (  ) {
    $location.path( '/programview' );
  };

  $scope.clearForm = function () {
    document.getElementById('programNameInputBox').value = "";
  };

    $scope.addObjective = function () {
        new_objective = {"objective": " ","order": $scope.program.objectives.length + 1};
        console.log(JSON.stringify(new_objective));
        $scope.program.objectives.push(new_objective);
    }
    $scope.addLearningActivity = function () {
        new_activity = {"name": "New Activity","questions": [{"question": "",}]};
        console.log(JSON.stringify(new_activity));
        $scope.program['learningActivities'].push(new_activity);
    }

  //Constructs JSON object from the input field values. This gets called just before the object is sent to the server
  $scope.createJSON = function () {
    $scope.program.name = $scope.programName;
  }

  $scope.keywordCount = function (text) {
    var s = text ? text.split(/[^,\s][^\,]*[^,\s]*/) : 0;
    return s ? s.length-1 : 0;
  };

    $scope.checkURLExists = function(item) {
        if (!item.url || item.url.trim().length <= 0) {
            return;
        }
        console.log("Validate URL: " + item.url) ;
        server.checkLAUrl(item.url).then(function (retData) {
            //console.log(JSON.stringify(retData));
            if(retData.status == 200) {
                item.validCSS = "good-url";
            } else {
                item.validCSS = "bad-url";
            }

        });
    };

  $scope.sendPost = function() {
    $scope.createJSON();
    /*$http.post("http://54.191.240.64:8080/CEHQWebServices/programs", $scope.program).success(function(data) {
      console.log("sent data" + $scope.program.name);
      $scope.clearForm();

      // GOTO top of page
      document.body.scrollTop = document.documentElement.scrollTop = 0;
    });*/
  };

  $scope.cehqModal = function(name, formValid) {
      //alert("INSIDE cehqModal: " + formValid);
      if (true) { //formValid) {
          $scope.modalInstance = $modal.open({
              templateUrl: 'modals/' + name + '.html',
              controller: 'ModalCtrl',
              size: 's',
              scope: $scope,
              resolve: {
                  program: function () {
                      return $scope.program;
                  }
              }
          });
      }
  };

});

cehqControllers.controller('ModalCtrl', function ($scope, $state, $location, $modalInstance, server, program, $localstorage) {
  $scope.program = program;
  $scope.id = $scope.program.id;

    var cleanProgram = function(program) {
        //console.log("learningActivities: " + $scope.program['learningActivities'].length);
        for (i = 0; i < program['learningActivities'].length; i++) {

            theActivity = program['learningActivities'][i];
            //console.log("learningActivities: " + JSON.stringify(program['learningActivities'][i]));
            delete theActivity.validCSS;
            if (program['learningActivities'][i]['questions'] && program['learningActivities'][i]['questions'].length > 0) {
                //console.log("learningActivities: " + program['learningActivities'][i]['questions'][0]['questionType']);
                if (typeof theActivity['questions'][0]['questionType'] !== 'undefined' &&
                    theActivity['questions'][0]['questionType'] !== null &&
                    theActivity['questions'][0]['questionType']['type'] == 1) { // Handle Multiple Choice
                    //console.log("Multiple Choice");
                    if (program['learningActivities'][i]['questions'][0] && program['learningActivities'][i]['questions'][0]['questionChoices']) {
                        console.log("Question choices: " + JSON.stringify(program['learningActivities'][i]['questions'][0]['questionChoices']));

                        // When creating a brand new Multiple Choice, our questionChoices is blank and adds choices as objects instead of array items
                        if(typeof program['learningActivities'][i]['questions'][0]['questionChoices'].length === 'undefined'){
                            var temp_array = [];
                            for (q = 0; q < 6; q++) {
                                if (typeof program['learningActivities'][i]['questions'][0]['questionChoices'][q] !== 'undefined') {
                                    the_choice = program['learningActivities'][i]['questions'][0]['questionChoices'][q]['choice'];
                                    console.log("item: " + the_choice);
                                    temp_array[q] = {'choice':the_choice};
                                    delete program['learningActivities'][i]['questions'][0]['questionChoices'][q];
                                }
                            }
                            program['learningActivities'][i]['questions'][0]['questionChoices'] = temp_array;

                        } else {
                            console.log("Question choice length: " + program['learningActivities'][i]['questions'][0]['questionChoices'].length);
                        }

                        console.log("ANSWER: " + program['learningActivities'][i]['questions'][0].answer);
                        if (typeof program['learningActivities'][i]['questions'][0].answer === 'undefined') {
                            program['learningActivities'][i]['questions'][0].answer = "0";
                        }
                        answer_index = parseInt(program['learningActivities'][i]['questions'][0].answer);
                        for (j = 0; j < program['learningActivities'][i]['questions'][0]['questionChoices'].length; j++) {
                            console.log("questionChoice: " + JSON.stringify(program['learningActivities'][i]['questions'][0]['questionChoices']));
                            if (j == answer_index) {
                                console.log("setting isCorrect: " + j);
                                program['learningActivities'][i]['questions'][0]['questionChoices'][j].isCorrect = 1;
                            } else {
                                program['learningActivities'][i]['questions'][0]['questionChoices'][j].isCorrect = 0;
                            }
                        }
                        delete program['learningActivities'][i]['questions'][0].answer;


                    }
                } else { //Not Multiple choice probably True/False
                    if (program['learningActivities'][i]['questions'][0]['tf'] == 1) {

                    }

                }
            }
        }
        return program;
    }

  $scope.saveDraftOk = function (doContinue) {
      var masterData = angular.copy($scope.program);

      cleanedProgram = cleanProgram($scope.program);

      console.log("save draft data: " + JSON.stringify(cleanedProgram));
      if (cleanedProgram.id) {
          console.log("updateProgram");
          $localstorage.set("save_update","true");
          server.updateProgram(cleanedProgram).then(function (retData) {
              //JMS TODO: Problem with Save-Continue - The INITIAL Program (in memory) is modified to be able to
              //  send to web service; Can't use the first version because LA may be messed up (not initialized correctly)
              if (doContinue) { // Save and Continue
                  //angular.copy(masterData, $scope.program);
              }
          });
      } else {
          console.log("addProgram");
          $localstorage.set("save_update","true");
          server.addProgram(cleanedProgram).then(function (retData) {
              console.log(JSON.stringify(retData));
          });
      }

      $modalInstance.close();

      if (doContinue) { // Save and Continue
          //angular.copy(masterData, $scope.program);
      } else {
                  $scope.goToProgramView();
          }

  };

  $scope.submitDraftOk = function () {
    // TODO: Now SAVE and then do something
    $modalInstance.close();
      cleanedProgram = cleanProgram($scope.program);
    if(cleanedProgram.id) { // Editing a previous Draft
        // Clean Program and make sure it is ok for submitting
        cleanedProgram['status'].id = cleanedProgram['status'].nextStatus;

      server.updateProgram(cleanedProgram).then(function (response) {
          console.log(JSON.stringify(response));
          $state.go("programview");
      });
    } else { // Submitting a NEW Draft, not yet saved
      $modalInstance = $modal.open({
        template: 'Not yet implemented for NEW Drafts <button class="btn btn-warning" type="button" ng-click="cancel()">Cancel</button>',
        scope: $scope
      });
    }
  };

    $scope.backDraft = function () {
        // TODO: Now SAVE and then do something
        $modalInstance.close();
        cleanedProgram = cleanProgram($scope.program);
        cleanedProgram['status'].id = 1; // Draft is hardcoded to 1

        server.updateProgram(cleanedProgram).then(function (response) {
            //console.log(JSON.stringify(response));
            $state.go("programview");
        });
    };

    $scope.programNextStatus = function () {
        // TODO: Now SAVE and then do something
        $modalInstance.close();
        cleanedProgram = cleanProgram($scope.program);
        cleanedProgram['status'].id = cleanedProgram['status'].nextStatus;

        server.updateProgram(cleanedProgram).then(function (response) {
            console.log(JSON.stringify(response));
            $state.go("programview");
        });
    };

    $scope.deleteDraftOk = function () {
        // TODO: Now SAVE and then do something
        $modalInstance.close();

        server.deleteProgram($scope.id).then(function (program) {
            //$scope.program.program_status = "submitted";
            console.log("DELETE complete");
            $state.go("programview");
        });

    };

  $scope.cancel = function () {
    // Don't Save
    $modalInstance.dismiss('cancel');
  };
});

cehqControllers.controller('ViewFormCtrl', function ($scope, $http, $location, $state,
                                                     server, AuthService, spinnerService, $localstorage, $timeout) {

    $scope.doInit = function () {
        $scope.isAuthenticated = AuthService.isAuthenticated();
        $scope.setLoading(true);

        // If Save or Update, play with timing of Asynch call so View shows correct data.
        if($localstorage.get("save_update", "false") === "true") {
            $timeout(function() {
                $localstorage.delete("save_update");
                $scope.loadAllPrograms();
            }, 2500);
        } else {
            $scope.loadAllPrograms();
        }

        // Simulating big list
        /*$scope.displayedDraftCollection = [];
        $scope.draftTablesItems = [];
        $scope.loadAllPrograms();
        $scope.loadAllPrograms();
        $scope.loadAllPrograms();
        $scope.loadAllPrograms();
        $scope.loadAllPrograms();
        $scope.loadAllPrograms();
        $scope.loadAllPrograms();
        $scope.loadAllPrograms();
        $scope.loadAllPrograms();
        $scope.loadAllPrograms();
        $scope.loadAllPrograms();
        $scope.loadAllPrograms();
        $scope.loadAllPrograms();
        $scope.loadAllPrograms();
        $scope.loadAllPrograms();*/
    };

  $scope.goToProgramInput = function (row) {
    //alert(row.id);

    if (row && row.id) {
      console.log("selectedProgram: " + row.id);
        var result = { id: row.id };
        $state.go("programinput.detail", result);
    } else {
        $state.go("programinput");
    }
  };

    $scope.showMe = function(id){
        alert(id);
    };

    $scope.setLoading = function(loading) {
       if (loading) {
           spinnerService.show('programsSpinner');
       } else{
           spinnerService.hide('programsSpinner');
       }
    }

    $scope.loadAllPrograms = function() {
        console.log("loadAllPrograms");
        //$scope.setLoading(true);
        server.getPrograms("draft").then(function (programs) {
            //$scope.draftTablesItems = $scope.draftTablesItems.concat(programs.data);
            //$scope.displayedDraftCollection = $scope.displayedDraftCollection.concat(programs.data);
            $scope.draftTablesItems = programs.data;
            $scope.displayedDraftCollection = [].concat($scope.draftTablesItems);

            server.getPrograms("submitted").then(function (programs) {
                $scope.draftTablesItems = $scope.draftTablesItems.concat(programs.data);
                $scope.displayedDraftCollection = $scope.displayedDraftCollection.concat(programs.data);
                server.getPrograms("reviewed").then(function (programs) {
                    $scope.draftTablesItems = $scope.draftTablesItems.concat(programs.data);
                    $scope.displayedDraftCollection = $scope.displayedDraftCollection.concat(programs.data);
                    server.getPrograms("accepted").then(function (programs) {
                        $scope.draftTablesItems = $scope.draftTablesItems.concat(programs.data);
                        $scope.displayedDraftCollection = $scope.displayedDraftCollection.concat(programs.data);
                    }).finally(function () {
                        // no matter what happens, hide the spinner when done
                        $scope.setLoading(false);
                    });
                });
            });
        }).finally(function () {
            // no matter what happens, hide the spinner when done
            //$scope.setLoading(false);
        });
    };

    $scope.getDraftPrograms = function() {
        $scope.setLoading(true);
        server.getPrograms("draft").then(function (programs) {
            $scope.draftTablesItems = programs.data; //.reverse();
            $scope.displayedDraftCollection = [].concat($scope.draftTablesItems);
        }).finally(function () {
            // no matter what happens, hide the spinner when done
            $scope.setLoading(false);
        });
    };

    $scope.getSubmittedPrograms = function() {
        server.getPrograms("submitted").then(function (programs) {
            $scope.submittedTablesItems = programs.data; //.reverse();
            $scope.displayedSubmittedCollection = [].concat($scope.submittedTablesItems);
        });
    };

    $scope.getReviewedPrograms = function() {
        server.getPrograms("reviewed").then(function (programs) {
            $scope.reviewedTablesItems = programs.data; //.reverse();
            $scope.displayedReviewedCollection = [].concat($scope.reviewedTablesItems);
        });
    };

    $scope.getAcceptedPrograms = function() {
        server.getPrograms("accepted").then(function (programs) {
            $scope.acceptedTablesItems = programs.data; //.reverse();
            $scope.displayedAcceptedCollection = [].concat($scope.acceptedTablesItems);
        });
    };

});
