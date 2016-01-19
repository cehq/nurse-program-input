var cehqControllers = angular.module('cehq.controllers',['ui.bootstrap','cehq.constants','cehq.services', 'app.factories']);


cehqControllers.controller('NavBarCtrl', function ($scope,
                                                   $modal,
                                                   $location,
                                                   mainMenuAnonymous,
                                                   rightMenuAnonymous,
                                                   mainMenuSignedIn,
                                                   rightMenuSignedIn) {


  $scope.isCollapsed = true;

  $scope.mainMenuItems = mainMenuAnonymous;

  $scope.rightMenuItems = rightMenuAnonymous;

  $scope.currentPage = "home";


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

cehqControllers.controller('SignInCtrl', function ($scope, $modalInstance, server, $localstorage, $location) {

  console.log('SignInCtrl');

  $scope.vm = {};
  $scope.vm.username = $localstorage.get("email", "joe-nurse");
  $scope.vm.password = $localstorage.get("password", "joe1234");
  $scope.vm.rememberMe = ($localstorage.get("remember_me", "true") === 'true');

  $scope.login = function () {
    console.log('login');
    server.login($scope.vm.username ,$scope.vm.password).then(function(userLogin) {
      console.log('userLogin: ' + JSON.stringify(userLogin));
      if (userLogin.status === 401) {
        alert("ERROR - Bad username or password");
      } else if (userLogin.status === 200) {
        $localstorage.set("jwt", userLogin.data.jwt);

        $modalInstance.dismiss('login');
        $location.path( '/programview' );

      } else {
        alert("error: " + userLogin.data + " ; status: " + userLogin.status +
            " ; headers: " + userLogin.headers + " ; config: " + JSON.stringify(userLogin.config));
      }

    });


  };

  $scope.cancel = function () {
    console.log('cancel');
    $modalInstance.dismiss('cancel');
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

cehqControllers.controller('InputFormCtrl', function ($scope, $http, $location, $routeParams, $modal, server) {

  var id = $routeParams.id;

  if(id) {
    $scope.pid = id;
    server.getProgram(id).then(function (program) {
      console.log("InputFormCtrl: " + id);
      $scope.program = program.data;
      if(!$scope.program.objectives) {
        $scope.program.objectives = [{"objective": " "}, {"objective": " "}, {"objective": " "}];
      }
      if(!$scope.program['learning-activities']) {
        $scope.program['learning-activities'] = [{"name": "Activity 1"},{"name": "Activity 2"},{"name": "Activity 3"},{"name": "Activity 4"},{"name": "Activity 5"}];
      }
    });
  } else {// NEW Program, set defaults
    $scope.program = { "id" : "", "name" : ""  };
    $scope.program.program_status = "draft";
    $scope.program.objectives = [{"objective": " "}, {"objective": " "}, {"objective": " "}];
    $scope.program['learning-activities'] = [{"name": "Activity 1"},{"name": "Activity 2"},{"name": "Activity 3"},{"name": "Activity 4"},{"name": "Activity 5"}];
    $scope.qType = {};
  }


  $scope.goToProgramView = function (  ) {
    $location.path( '/programview' );
  };

  $scope.clearForm = function () {
    document.getElementById('programNameInputBox').value = "";
  };

  //Constructs JSON object from the input field values. This gets called just before the object is sent to the server
  $scope.createJSON = function () {
    $scope.program.name = $scope.programName;
  }

  $scope.keywordCount = function (text) {
    var s = text ? text.split(/[^,\s][^\,]*[^,\s]*/) : 0;
    return s ? s.length-1 : 0;
  };

  $scope.sendPost = function() {
    $scope.createJSON();
    $http.post("http://52.32.118.8:8080/CEHQWebServices/programs", $scope.program).success(function(data) {
      console.log("sent data" + $scope.program.name);
      $scope.clearForm();

      // GOTO top of page
      document.body.scrollTop = document.documentElement.scrollTop = 0;
    });
  };

  $scope.cehqModal = function(name) {
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
  };

});

cehqControllers.controller('ModalCtrl', function ($scope, $location, $modalInstance, server, program) {
  $scope.program = program;
  $scope.id = $scope.program.id;

  $scope.saveDraftOk = function () {
    // TODO: Now SAVE and then do something
    $modalInstance.close();
    $scope.goToProgramView();
  };

  $scope.submitDraftOk = function () {
    // TODO: Now SAVE and then do something
    $modalInstance.close();

    if($scope.id) { // Editing a previous Draft
      server.submitProgram($scope.id, $scope.program).then(function (program) {
        console.log("submitProgram complete");
        $scope.goToProgramView();
      });
    } else { // Submitting a NEW Draft, not yet saved
      $modalInstance = $modal.open({
        template: 'Not yet implemented for NEW Drafts <button class="btn btn-warning" type="button" ng-click="cancel()">Cancel</button>',
        scope: $scope
      });
    }
  };

  $scope.acceptProgramOk = function () {
    // TODO: Now SAVE and then do something
    $modalInstance.close();

    server.acceptProgram($scope.id, $scope.program).then(function (program) {
      //$scope.program.program_status = "submitted";
      console.log("acceptProgramOk complete");
      $scope.goToProgramView();
    });

  };
  $scope.unpublishProgramOk = function () {
    // TODO: Now SAVE and then do something
    $modalInstance.close();

    server.unpublishProgram($scope.id, $scope.program).then(function (program) {
      //$scope.program.program_status = "submitted";
      console.log("unpublishProgramOk complete");
      $scope.goToProgramView();
    });

  };

  $scope.cancel = function () {
    // Don't Save
    $modalInstance.dismiss('cancel');
  };
});

cehqControllers.controller('ViewFormCtrl', function ($scope, $http, $location, server) {


  $scope.goToProgramInput = function (programType) {
    var selectedProgram =  $scope.draftItems;
    if (programType == 'new') {
      selectedProgram = null;
    } else if (programType == 'submitted') {
      selectedProgram =  $scope.submittedItems;
    } else if (programType == 'accepted') {
      selectedProgram =  $scope.acceptedItems;
    }
    console.log("selectedProgram: " + selectedProgram);
    if (selectedProgram) {
      $location.path("programinput/" + selectedProgram);
    } else {
      $location.path("programinput");
    }
  };

  // on page load, send request for program list
  $scope.$on('$viewContentLoaded', function() {
    // JMS TODO: Not sure about this....retrieve each group draft/submitted/accepted
    // or retrieve all at one time. Either way, programs need to be filtered so they
    // are placed in the correct SELECT list.
    server.getDraftPrograms().then(function(programs) {
      //alert(JSON.stringify(programs));
      $scope.draftPrograms = programs.data; //.reverse();
      $scope.draftItems = $scope.draftPrograms[0].id;
    });
    server.getSubmittedPrograms().then(function(programs) {
      //alert(JSON.stringify(programs));
      $scope.submittedPrograms = programs.data; //.reverse();
      $scope.submittedItems = $scope.submittedPrograms[0].id;
    });
    server.getAcceptedPrograms().then(function(programs) {
      //alert(JSON.stringify(programs));
      $scope.acceptedPrograms = programs.data; //.reverse();
      $scope.acceptedItems = $scope.acceptedPrograms[0].id;
    });
  });

});