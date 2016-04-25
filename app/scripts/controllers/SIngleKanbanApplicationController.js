'use strict';

angular.module('mpk').controller('SingleKanbanApplicationController',
	function ApplicationController($scope, $window, kanbanRepository, pollingService, themesProvider, $routeParams, $location, cloudService, $translate, $timeout) {

	$scope.colorOptions = ['FFFFFF','DBDBDB','FFB5B5', 'FF9E9E', 'FCC7FC', 'FC9AFB', 'CCD0FC', '989FFA', 'CFFAFC', '9EFAFF', '94D6FF','C1F7C2', 'A2FCA3', 'FAFCD2', 'FAFFA1', 'FCE4D4', 'FCC19D'];

	// <-------- Polling backend for changes ---------------> //
    var poll = function() {
        $timeout(function() {
            if (
                pollingService.getChange()
                && pollingService.getSelfChangeInProgress() !== true
                && pollingService.getPolledTimeStampChange() > $scope.timeStampLastSave
            ) {
                console.log('lastchange: ' + $scope.timeStampLastSave + ' serverTimeStamp: ' + pollingService.getPolledTimeStampChange());
                kanbanRepository.singleRestApiLoad($routeParams.kanbanId).then(function(data){
                    reload(data);
                    pollingService.setNoChange();
                });
            }
            console.log('checking pollingService connectionLost=' + pollingService.getConnectionLost() + ' change=' + pollingService.getChange() + " selfChange=" + pollingService.getSelfChangeInProgress());
            poll();
        }, 500);
    };
    poll();

	$scope.$on('ColumnsChanged', function(){
		$scope.columnWidth = calculateColumnWidth($scope.kanban.columns.length);
	});

	function calculateColumnWidth(numberOfColumns){
		return Math.floor((100 / numberOfColumns) * 100) / 100;
	}

	function handleErrorUploadDownload(errorMessage){
		$scope.infoMessage = '';
		$scope.showInfo = true;
		$scope.showError = true;
		$scope.showSpinner = false;
		$scope.errorMessage = errorMessage;
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

        $scope.$watch('kanban', function(){
            kanbanRepository.saveSingle();
            $scope.timeStampLastSave = new Date().getTime();
        }, true);

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

    };

});
