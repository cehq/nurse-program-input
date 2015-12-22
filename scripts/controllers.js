var cehqControllers = angular.module('cehq.controllers',['ui.bootstrap','cehq.constants','cehq.services']);


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


cehqControllers.controller('SignInCtrl', function ($scope, $modalInstance) {

  console.log('SignInCtrl');

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

cehqControllers.controller('InputFormCtrl', function ($scope, $http, $location, $routeParams, server) {

  var id = $routeParams.id;
  if(id) {
    server.getProgram(id).then(function (program) {
      console.log("InputFormCtrl: " + id);
      $scope.program = program.data;
    });
  } else {
    $scope.program = { "id" : "", "name" : ""  };
    $scope.program.objectives = [{"objective": " "}, {"objective": " "}, {"objective": " "}];
    $scope.program['learning-activities'] = [{"name": "Activity 1"},{"name": "Activity 2"},{"name": "Activity 3"},{"name": "Activity 4"},{"name": "Activity 5"}];
    $scope.qType = {};
  }


  $scope.goToProgramView = function ( path ) {
    $location.path( path );
  };

  $scope.clearForm = function () {
    document.getElementById('programNameInputBox').value = "";
  };

  //Constructs JSON object from the input field values. This gets called just before the object is sent to the server
  $scope.createJSON = function () {
    $scope.program.name = $scope.programName;
  }
  
  $scope.sendPost = function() {
    $scope.createJSON()
    $http.post("http://52.32.118.8:8080/CEHQWebServices/programs", $scope.program).success(function(data) {
      console.log("sent data" + $scope.program.name);
      $scope.clearForm();

      // GOTO top of page
      document.body.scrollTop = document.documentElement.scrollTop = 0;
    });
  }
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
    server.getPrograms("draft").then(function(programs) {
      //alert(JSON.stringify(programs));
      $scope.draftPrograms = programs.data; //.reverse();
      $scope.draftItems = $scope.draftPrograms[0].id;
    });
    server.getPrograms("submitted").then(function(programs) {
      //alert(JSON.stringify(programs));
      $scope.submittedPrograms = programs.data; //.reverse();
      $scope.submittedItems = $scope.submittedPrograms[0].id;
    });
    server.getPrograms("accepted").then(function(programs) {
      //alert(JSON.stringify(programs));
      $scope.acceptedPrograms = programs.data; //.reverse();
      $scope.acceptedItems = $scope.acceptedPrograms[0].id;
    });
  });

});