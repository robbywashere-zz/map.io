'use strict';

function initCall() {
  console.log('Google maps api initialized.');
  angular.bootstrap(document.getElementsByTagName('html'), ['myApp']);
}

var app = angular.module('myApp', ['ui.map','ui.event']);

app.controller('MapCtrl',[ '$scope', 'socket', '$window', function($scope, socket, $window) {

  $scope.location = $window.location.href;


  $scope.mapOptions = {
    center: new google.maps.LatLng(48.8567, 2.3508),
  zoom: 15,
  mapTypeId: google.maps.MapTypeId.SATELLITE
  };


  $scope.addMarker = function ($event, $params) {
    socket.emit('add:marker', {
      data: [$params[0].latLng.lat().toFixed(5), $params[0].latLng.lng().toFixed(5)],
      room: window.map.room
    });

    $scope.myMarkers.push(new google.maps.Marker({
      map: $scope.myMap,
      position: $params[0].latLng
    }));

  };


 $scope.onMapIdle = function() {
    $scope.myMarkers = window.map.data.map(function(latlng){
      console.log(latlng);
      var mark = new google.maps.Marker({
        map: $scope.myMap,
          position: new google.maps.LatLng(latlng[0],latlng[1])
      });
      return mark;
    });
  }

  socket.on('add:marker', function (message) {
    var latlng = message.data
    $scope.myMarkers.push(new google.maps.Marker({
      map: $scope.myMap,
      position: new google.maps.LatLng(latlng[0],latlng[1])
    }));
  });
}
]);

app.factory('socket', function ($rootScope) {
  var socket = io.connect();

  socket.on('connect', function(){
    socket.emit('room', window.map.room);
  });

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
