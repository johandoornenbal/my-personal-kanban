'use strict';

angular.module('mpk').controller('AdminApplicationController',
	function AdminApplicationController($scope, $window, kanbanRepository, $routeParams, $location, $translate) {

	$scope.$on('NewKanbanAdded', function(){

	});

	$scope.kanbanMenu = {};

	function allKanbanNames(kanbanRepository){

	}

	$scope.rename = function(){

	};


    var loadedRepo;

    loadedRepo = kanbanRepository.loadAllKanbans().then(function(data){

        $scope.allKanbans = data;

    });

	var reload = function(data){


    };

});
