'use strict';

angular.module('mpk').controller('SingleKanbanApplicationController',
	function ApplicationController($scope, $window, kanbanRepository, pollingService, themesProvider, $routeParams, $location, cloudService, $translate, $timeout) {

	$scope.colorOptions = ['FFFFFF','DBDBDB','FFB5B5', 'FF9E9E', 'FCC7FC', 'FC9AFB', 'CCD0FC', '989FFA', 'CFFAFC', '9EFAFF', '94D6FF','C1F7C2', 'A2FCA3', 'FAFCD2', 'FAFFA1', 'FCE4D4', 'FCC19D'];
    $scope.reloading = false; /* flag to indicate that changes to scope are due to reloading after loading data from backend */
    $scope.reloadNoSave = false; /* flag set by pol() and unset by $scope.$watch to indicate that changes to scope are due to reloading and are not to be saved */

	// <-------- Polling backend for changes ---------------> //
    var poll = function() {
        $timeout(function() {
            if (
                pollingService.getChange()
                && pollingService.getSelfChangeInProgress() !== true
                && pollingService.getPolledTimeStampChange() > $scope.timeStampLastSave + 100 // allow 100 for back-end save
            ) {
                console.log('lastchange: ' + $scope.timeStampLastSave + ' serverTimeStamp: ' + pollingService.getPolledTimeStampChange());
                kanbanRepository.singleRestApiLoad($routeParams.kanbanId).then(function(data){
                    $scope.reloading = true;
                    $scope.reloadNoSave = true;
                    reload(data);
                    pollingService.setNoChange();
                });
            }
            console.log('checking pollingService connectionLost=' + pollingService.getConnectionLost() + ' change=' + pollingService.getChange() + " selfChange=" + pollingService.getSelfChangeInProgress());
            poll();
        }, 200);
    };
    poll();

	$scope.$on('ColumnsChanged', function(){
		$scope.columnWidth = calculateColumnWidth($scope.kanban.columns.length);
	});

	function calculateColumnWidth(numberOfColumns){
		return Math.floor((100 / numberOfColumns) * 100) / 100;
	}

	$scope.kanbanMenu = {};

	$scope.kanbanMenu.openSwitchTheme = function(){
		$scope.$broadcast('OpenSwitchTheme', kanbanRepository.getTheme());
	};
	$scope.kanbanMenu.openArchive = function (kanban){
		$scope.$broadcast('OpenArchive', kanban);
	};
	$scope.kanbanMenu.openUsers = function (kanban){
    	$scope.$broadcast('openUsers', kanban);
    };

	$scope.openKanbanShortcut = function($event){
		$scope.$broadcast('TriggerOpen');
	};

	$scope.openHelpShortcut = function($event){
 		$scope.$broadcast('TriggerHelp');
 	};
	
	// <-------- Handling different events in this block ---------------> //
	$scope.spinConfig = {lines: 10, length: 3, width: 2, radius:5};

	var currentKanban = new Kanban('Kanban name', 0);

    var loadedRepo;

    // using db repo
    loadedRepo = kanbanRepository.singleRestApiLoad($routeParams.kanbanId).then(function(data){

        kanbanRepository.kanbansByName = data.singlekanban;
        kanbanRepository.theme = data.theme;
        kanbanRepository.lastUpdated = data.lastUpdated;

        $scope.kanban = kanbanRepository.getSingle();

        $scope.columnHeight = angular.element($window).height() - 110;
        $scope.columnWidth = calculateColumnWidth($scope.kanban.columns.length);

        $scope.triggerOpen = function(){
            $scope.$broadcast('TriggerOpenKanban');
        };

        if (kanbanRepository.getTheme() != undefined && kanbanRepository.getTheme() != ''){
            themesProvider.setCurrentTheme(kanbanRepository.getTheme());
        }

        $timeout(function() {
            pollingService.poll();
        }, 1000);

        $scope.$watch('kanban', function(){
            if (!$scope.reloading){
                if ($scope.reloadNoSave) {
                    // skip this save
                    $scope.reloadNoSave = false;
                } else {
                    kanbanRepository.saveSingle();
                    $scope.timeStampLastSave = new Date().getTime();
                }
            }
        }, true);

    });


	var reload = function(data){

        kanbanRepository.kanbansByName = data.singlekanban;
        kanbanRepository.theme = data.theme;
        kanbanRepository.lastUpdated = data.lastUpdated;

        $scope.kanban = kanbanRepository.getSingle();

        $scope.columnHeight = angular.element($window).height() - 110;
        $scope.columnWidth = calculateColumnWidth($scope.kanban.columns.length);

        if (kanbanRepository.getTheme() != undefined && kanbanRepository.getTheme() != ''){
            themesProvider.setCurrentTheme(kanbanRepository.getTheme());
        }

        $scope.reloading = false;

    };

});
