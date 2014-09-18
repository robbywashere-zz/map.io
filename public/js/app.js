'use strict';

function initCall() {
  console.log('Google maps api initialized.');
  angular.bootstrap(document.getElementsByTagName('html'), ['myApp']);
}

var app = angular.module('myApp', ['ui.map']);

app.controller('MapCtrl',[ '$scope', 'socket', function($scope,socket) {

    $scope.myMarkers = [];

    $scope.mapOptions = {
      center: new google.maps.LatLng(48.8567, 2.3508),
      zoom: 15,
      mapTypeId: google.maps.MapTypeId.SATELLITE
    };

    $scope.addMarker = function ($event, $params) {
      socket.emit('add:marker', [$params[0].latLng.lat().toFixed(5), $params[0].latLng.lng().toFixed(5)]  )

      $scope.myMarkers.push(new google.maps.Marker({
        map: $scope.myMap,
        position: $params[0].latLng
      }));

    };

    socket.on('add:marker', function (message) {
      $scope.myMarkers.push(new google.maps.Marker({
        map: $scope.myMap,
        position: new google.maps.LatLng(message[0],message[1])
      }));
  });
}
]);


app.factory('socket', function ($rootScope) {
  var socket = io.connect();
  return {
    on: function (eventName, callback) {
      socket.on(eventName, function () {  
        var args = arguments;
        $rootScope.$apply(function () {
          callback.apply(socket, args);
        });
      });
    },
    emit: function (eventName, data, callback) {
      socket.emit(eventName, data, function () {
        var args = arguments;
        $rootScope.$apply(function () {
          if (callback) {
            callback.apply(socket, args);
          }
        });
      })
    }
  };
});
