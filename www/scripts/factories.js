var appFactories = angular.module('app.factories',[]);


appFactories.factory('$localstorage', ['$window', function($window) {
  return {
    set: function(key, value) {
      $window.localStorage[key] = value;
    },
    get: function(key, defaultValue) {
      //alert(key);
      return $window.localStorage[key] || defaultValue;
    },
    setObject: function(key, value) {
      $window.localStorage[key] = JSON.stringify(value);
    },
    getObject: function(key) {
      return JSON.parse($window.localStorage[key] || '{}');
    },
    delete: function(key) {
      delete $window.localStorage[key];
    }
  }
}]);

appFactories.factory('accountHelpers', ['$localstorage', function($localstorage) {
  return {
    isRemembered: function() {
      return ($localstorage.get("remember_me", "true") === 'true');
    },
    rememberMe: function(rememberMe) {
      $localstorage.set("remember_me", rememberMe);
    },
    setTotalCredits: function(total) {
      $localstorage.set("total_credits", total);
    },
    getTotalCredits: function() {
      return $localstorage.get("total_credits", "0");
    },
    doLogout: function() {
      $localstorage.delete("jwt");
    },
    isAuthenticated: function() {
      return ($localstorage.get("jwt", "").length > 0);
    }

  }
}]);

