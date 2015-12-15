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

cehqControllers.controller('InputFormCtrl', function ($scope, $http, $location) {

  $scope.hello = { "id" : "", "name" : ""  };

  $scope.goToProgramView = function ( path ) {
    $location.path( path );
  };

  $scope.clearForm = function () {
    document.getElementById('programNameInputBox').value = "";
  };

  $scope.sendPost = function() {
      $scope.hello.name = $scope.programName;
      $http.post("http://52.32.118.8:8080/CEHQWebServices/programs", $scope.hello).success(function(data) {
          console.log("sent data" + $scope.hello);
      });

    document.getElementById('programNameInputBox').value = "";
  }
});

cehqControllers.controller('ViewFormCtrl', function ($scope, $http, $location) {

  $scope.goToProgramInput = function ( path ) {
    $location.path( path );
  };

  // on page load, send request for program list
  $scope.$on('$viewContentLoaded', function() {
    $http.get('http://52.32.118.8:8080/CEHQWebServices/programs/')
        .then(function(result) {
          $scope.draftPrograms = result.data.reverse();
          for (var i=0; i < $scope.draftPrograms.length; i++)
          {
            console.log($scope.draftPrograms[i].name)
          }
        });
  });

});