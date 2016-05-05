'use strict';

angular.module('mpk').controller('SingleKanbanApplicationController',
	function ApplicationController($scope, $window, kanbanRepository, pollingService, themesProvider, $routeParams, $location, cloudService, $translate, $timeout) {


    $scope.allCards = [];
    $scope.allColumns = [];
    $scope.allCardListeners = [];
    $scope.allColumnListeners = [];
    $scope.allChangedCards = [];
    $scope.allChangedColumns = [];
    $scope.cardWatchFirst = true;
    $scope.columnWatchFirst = true;

	$scope.colorOptions = ['FFFFFF','DBDBDB','FFB5B5', 'FF9E9E', 'FCC7FC', 'FC9AFB', 'CCD0FC', '989FFA', 'CFFAFC', '9EFAFF', '94D6FF','C1F7C2', 'A2FCA3', 'FAFCD2', 'FAFFA1', 'FCE4D4', 'FCC19D'];
    $scope.reloading = false; /* flag to indicate that changes to scope are due to reloading after loading data from backend */
    $scope.reloadNoSave = false; /* flag set by pol() and unset by $scope.$watch to indicate that changes to scope are due to reloading and are not to be saved */

	// <-------- Polling backend for changes ---------------> //
    var poll = function() {
        $timeout(function() {
            var time = new Date().getTime();
            if (time > pollingService.getMyTimeStamp() + 10000){
            	$translate("CONNECTION_LOST").then(function successFn(translation) {
            		    $scope.errorMessage = translation;
                        $scope.showError = true;
                        $scope.showInfo = true;
            	});
            }
            if (
                pollingService.getChange()
                && pollingService.getSelfChangeInProgress() !== true
                && pollingService.getPolledTimeStampChange() > $scope.timeStampLastSave + 100 // allow 100 for back-end save
            ) {
//                console.log('lastchange: ' + $scope.timeStampLastSave + ' serverTimeStamp: ' + pollingService.getPolledTimeStampChange());
                kanbanRepository.singleRestApiLoad($routeParams.kanbanId).then(function(data){
                    pollingService.setPauze(true);
                    $scope.reloading = true;
                    $scope.reloadNoSave = true;
                    reload(data);
                    pollingService.setNoChange();
                    pollingService.setPauze(false);
                });
            }
//            console.log('change=' + pollingService.getChange() + " selfChange=" + pollingService.getSelfChangeInProgress());
            poll();
        }, 200);
    };
    poll();

	$scope.$on('ColumnsChanged', function(){
		$scope.columnWidth = calculateColumnWidth($scope.kanban.columns.length);
		detectChangesInColumns();
	});

	$scope.$on('newCardAdded', function(){
    	detectChangesInCards();
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
            $scope.cardWatchFirst = false;
            $scope.columnWatchFirst = false;
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

        detectChangesInCards();
        detectChangesInColumns();
//        console.log($scope.allCardListeners.length);

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

    var detectChangesInCards = function(){
        var $i;
        var $t;

        // unregister all card listeners and empty allCards array
        for ($i=0; $i<$scope.allCardListeners.length; $i++){
            $scope.allCardListeners[$i]();
            $scope.allCards = [];
        }

        // fill allCards array (again)
        for ($i=0; $i < $scope.kanban.columns.length; $i++){
            for ($t=0; $t<$scope.kanban.columns[$i].cards.length; $t++){
                $scope.allCards.push($scope.kanban.columns[$i].cards[$t]);
//                console.log($scope.allCards.length);
            }
        }

        // detect change in a single card - register listeners (again)
        for ($i=0; $i<$scope.allCards.length; $i++){
            $scope.allCardListeners.push($scope.$watch('allCards[' + $i + ']', function(newValue, oldValue){
                if ($scope.cardWatchFirst){
//                    $scope.cardWatchFirst = false;
                } else {
                    console.log("change in card detected");
                    console.log(oldValue);
                    console.log(newValue);
                    if (searchById(newValue.id, $scope.allChangedCards)>=0){
                        $scope.allChangedCards.splice(searchById(newValue.id, $scope.allChangedCards), 1);
                        console.log("card found");
                    }
                    $scope.allChangedCards.push(newValue);
                    console.log($scope.allChangedCards);
                }
            }, true));

        }


    };

    var detectChangesInColumns = function(){

         var $i;

         // unregister all column listeners
         for ($i=0; $i<$scope.allColumnListeners.length; $i++){
             $scope.allColumnListeners[$i]();
         }

         // detect change in a single column - register listeners (again)
         for ($i=0; $i < $scope.kanban.columns.length; $i++){
             $scope.allColumnListeners.push($scope.$watch('kanban.columns['+ $i  + ']', function(newValue, oldValue){
                if ($scope.columnWatchFirst){
//                    $scope.columnWatchFirst = false;
                } else {
                    console.log("change in column detected");
                    console.log(oldValue);
                    console.log(newValue);
                    if (searchByName(newValue.name, $scope.allChangedColumns)>=0){
                        $scope.allChangedColumns.splice(searchByName(newValue.name, $scope.allChangedColumns), 1);
                        console.log("column found");
                    }
                    $scope.allChangedColumns.push(newValue);
                    console.log($scope.allChangedColumns);
                }
             }, true));
         }


    };

    var searchById = function search(idSearchFor, myArray){
        for (var i=0; i < myArray.length; i++) {
            if (myArray[i].id === idSearchFor) {
                return i;
            }
        }
        return -1;
    };

    var searchByName = function search(nameSearchFor, myArray){
            for (var i=0; i < myArray.length; i++) {
                if (myArray[i].name === nameSearchFor) {
                    return i;
                }
            }
            return -1;
        };

});
