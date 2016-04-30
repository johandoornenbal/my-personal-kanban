'use strict';

angular.module('mpk').controller('ApplicationController', 
	function ApplicationController($scope, $window, kanbanRepository, pollingService, themesProvider, $routeParams, $location, cloudService, $translate, $timeout) {

    $scope.useLocalDb = false; /* set to true if not using RestApi of backend*/
	$scope.colorOptions = ['FFFFFF','DBDBDB','FFB5B5', 'FF9E9E', 'FCC7FC', 'FC9AFB', 'CCD0FC', '989FFA', 'CFFAFC', '9EFAFF', '94D6FF','C1F7C2', 'A2FCA3', 'FAFCD2', 'FAFFA1', 'FCE4D4', 'FCC19D'];
    $scope.reloading = false; /* flag set by poll() and unset by reload() to indicate that changes to scope are due to reloading after loading data from backend */
    $scope.reloadNoSave = false; /* flag set by pol() and unset by $scope.$watch to indicate that changes to scope are due to reloading and are not to be saved */

	// <-------- Polling backend for changes ---------------> //
    var poll = function() {
        $timeout(function() {
            if (
                pollingService.getChange()
                && pollingService.getSelfChangeInProgress() !== true
                && pollingService.getPolledTimeStampChange() > $scope.timeStampLastSave + 100 // allow 100 for back-end save
            ) {
                kanbanRepository.restApiLoad().then(function(data){
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


	// <-------- Handling different events in this block ---------------> //
	$scope.$on('NewKanbanAdded', function(){
		$scope.showNewKanban = false;
		$scope.kanban = kanbanRepository.getLastUsed();
		$scope.allKanbans = Object.keys(kanbanRepository.all());
		$scope.selectedToOpen = $scope.kanban.name;
		$location.path('/kanban/' + $scope.kanban.name);
		$scope.switchToList = $scope.allKanbans.slice(0);
		$translate("SWITCH_TO").then(function successFn(translation) {
		    $scope.switchToList.splice(0,0,translation);
		});
	});

	$scope.$on('ColumnsChanged', function(){
		$scope.columnWidth = calculateColumnWidth($scope.kanban.columns.length);
	});

	$scope.$on('ImportFinished', function(){
        $scope.kanban = kanban;
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
	$scope.cloudMenu = {};
	$scope.kanbanMenu.openNewKanban = function(){
	    pollingService.setSelfChangeInProgress(true);
		$scope.$broadcast('OpenNewKanban', allKanbanNames(kanbanRepository));
	};
	$scope.kanbanMenu.delete = function(){
	    $translate("AYS_DELETE_KANBAN").then(function successFn(translation) {
            if (confirm(translation)){
                kanbanRepository.remove($scope.kanban.name);
                var all = allKanbanNames(kanbanRepository);

                if (all.length > 0){
                    kanbanRepository.setLastUsed(all[0]);
                } else {
                    kanbanRepository.setLastUsed(undefined);
                }
                $scope.kanban = undefined;
                $scope.allKanbans = Object.keys(kanbanRepository.all());

                if ($scope.allKanbans.length > 0){
                    $scope.switchToKanban($scope.allKanbans[0]);
                }

                $scope.switchToList = $scope.allKanbans.slice(0);
                $translate("SWITCH_TO").then(function successFn(translation) {
                    $scope.switchToList.splice(0,0,translation);
                });
            }
		});
		return false;
	};
	$scope.kanbanMenu.openSwitchTheme = function(){
		$scope.$broadcast('OpenSwitchTheme', kanbanRepository.getTheme());
	};
	$scope.kanbanMenu.openArchive = function (kanban){
		$scope.$broadcast('OpenArchive', kanban);
	};
	$scope.kanbanMenu.openUsers = function (kanban){
    	$scope.$broadcast('openUsers', kanban);
    };
	$scope.kanbanMenu.openExport = function(allKanbans, kanbanName){
		$scope.$broadcast('OpenExport', allKanbans, kanbanName);
	};
	$scope.kanbanMenu.openImport = function(){
		$scope.$broadcast('OpenImport');
	};

	$scope.cloudMenu.openCloudSetup = function(){
		$scope.$broadcast('OpenCloudSetup');
	};
	$scope.cloudMenu.upload = function(){
		if (!cloudService.isConfigurationValid()){
			return $scope.openCloudSetup(true);
		}
		var promise = kanbanRepository.upload();
		$scope.errorMessage = '';
		$scope.showError = false;
		$scope.infoMessage = 'Uploading Kanban ...';
		$scope.showInfo = true;
		$scope.showSpinner = true;

		promise.then(function(result){
			if (result.data.success){
				kanbanRepository.setLastUpdated(result.data.lastUpdated).save();
				$scope.infoMessage = '';
				$scope.showInfo = false;
				$scope.showSpinner = false;
			} else {
				handleErrorUploadDownload(result.data.error);
				console.error(result);
			}
		}, function(errors){ 
			$scope.infoMessage = '';
			$scope.showInfo = true;
			$scope.showSpinner = false;
			$scope.showError = true;
			$scope.errorMessage = 'There was a problem uploading your Kanban.';
		});
		return false;
	};
	$scope.cloudMenu.download = function(){
		if (!cloudService.isConfigurationValid()){
			return $scope.openCloudSetup(true);
		}
		$scope.infoMessage = 'Downloading your Kanban ...';
		$scope.showSpinner = true;
		$scope.showError = false;
		$scope.errorMessage = '';
		var promise = kanbanRepository.download();
		promise.success(function(data){
			if (data.success){
				var saveResult = kanbanRepository.saveDownloadedKanban(data.kanban, data.lastUpdated);
				if (saveResult.success){
					if (kanbanRepository.getLastUsed() == undefined){
						kanbanRepository.setLastUsed(allKanbanNames(kanbanRepository)[0]);
						kanbanRepository.save();
					}

					$window.location.reload();
				} else {
					handleErrorUploadDownload(saveResult.message);
				}
			} else {
				handleErrorUploadDownload(data.error);
			}
		}).error(function(data, status, headers, config){
			$scope.infoMessage = '';
			$scope.showInfo = true;
			$scope.showError = true;
			$scope.showSpinner = false;
			$scope.errorMessage = 'Problem Downloading your Kanban. Check Internet connectivity and try again.';		
		});
		return false;
	};
	
	function allKanbanNames(kanbanRepository){
		return Object.keys(kanbanRepository.all());
	}

	$scope.editingKanbanName = function(){
		$scope.editingName = true;
	};

	$scope.editingName = false;
	
	$scope.rename = function(){
	    if ($scope.switchToList.indexOf($scope.newName) !== -1){
            $translate("NAME_IN_USE").then(function successFn(translation) {
                var msg = translation;
                alert(msg);
            });
            return false;
        }
		kanbanRepository.renameLastUsedTo($scope.newName);
		kanbanRepository.save();
		
		$scope.allKanbans = Object.keys(kanbanRepository.all());
		$scope.editingName = false;

		$scope.switchToKanban($scope.newName);
	};

	$scope.openKanbanShortcut = function($event){
		$scope.$broadcast('TriggerOpen');
	};

	$scope.switchToKanban = function(kanbanName){
	    $translate("SWITCH_TO").then(function successFn(translation) {
		    if (kanbanName == translation) return;
		});
		$scope.kanban = kanbanRepository.getByName(kanbanName);

		kanbanRepository.setLastUsed(kanbanName);
		$scope.newName = kanbanName;
		$location.path('/kanban/' + kanbanName);
		kanbanRepository.save();
		$translate("SWITCH_TO").then(function successFn(translation) {
		    $scope.switchTo = translation;
		});
	};

	$scope.openHelpShortcut = function($event){
 		$scope.$broadcast('TriggerHelp');
 	};
	
	// <-------- Handling different events in this block ---------------> //
	$scope.spinConfig = {lines: 10, length: 3, width: 2, radius:5};

	var currentKanban = new Kanban('Kanban name', 0);

    var loadedRepo;

	if ($scope.useLocalDb) {

	    //  using local repo
    	loadedRepo = kanbanRepository.load();

        if (loadedRepo){
            if ($routeParams.kanbanName != undefined && kanbanRepository.getByName($routeParams.kanbanName)) {
                currentKanban = kanbanRepository.getByName($routeParams.kanbanName);
            } else if (kanbanRepository.getLastUsed() != undefined	) {
                currentKanban = kanbanRepository.getLastUsed();
                $location.path('/kanban/' + currentKanban.name);
            }
        }

        $scope.kanban = currentKanban;
        $scope.allKanbans = Object.keys(kanbanRepository.all());
        $scope.selectedToOpen = $scope.newName = currentKanban.name;

        $scope.switchToList = $scope.allKanbans.slice(0);
        $translate("SWITCH_TO").then(function successFn(translation) {
            $scope.switchToList.splice(0, 0, translation);
            $scope.switchTo = translation;
        });

        $scope.columnHeight = angular.element($window).height() - 110;
        $scope.columnWidth = calculateColumnWidth($scope.kanban.columns.length);

        $scope.triggerOpen = function(){
            $scope.$broadcast('TriggerOpenKanban');
        };

        if (kanbanRepository.getTheme() != undefined && kanbanRepository.getTheme() != ''){
            themesProvider.setCurrentTheme(kanbanRepository.getTheme());
        }

        $scope.$watch('kanban', function(){
            if (!$scope.reloading){
                if ($scope.reloadNoSave) {
                    // skip this save
                    $scope.reloadNoSave = false;
                } else {
                    kanbanRepository.save();
                    $scope.timeStampLastSave = new Date().getTime();
                }
            }
        }, true);

    } else {

    // using db repo
        loadedRepo = kanbanRepository.restApiLoad().then(function(data){

            kanbanRepository.kanbansByName = data.kanbans;
            kanbanRepository.lastUsed = data.lastUsed;
            kanbanRepository.theme = data.theme;
            kanbanRepository.lastUpdated = data.lastUpdated;

            if (loadedRepo){
                if ($routeParams.kanbanName != undefined && kanbanRepository.getByName($routeParams.kanbanName)) {
                    currentKanban = kanbanRepository.getByName($routeParams.kanbanName);
                } else if (kanbanRepository.getLastUsed() != undefined	) {
                    currentKanban = kanbanRepository.getLastUsed();
                    $location.path('/kanban/' + currentKanban.name);
                }
            }

            $scope.kanban = currentKanban;
            $scope.allKanbans = Object.keys(kanbanRepository.all());
            $scope.selectedToOpen = $scope.newName = currentKanban.name;

            $scope.switchToList = $scope.allKanbans.slice(0);
            $translate("SWITCH_TO").then(function successFn(translation) {
                $scope.switchToList.splice(0, 0, translation);
                $scope.switchTo = translation;
            });

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
                        kanbanRepository.save();
                        $scope.timeStampLastSave = new Date().getTime();
                    }
                }
            }, true);

    	});

    };



	var reload = function(data){

        kanbanRepository.kanbansByName = data.kanbans;
        kanbanRepository.lastUsed = data.lastUsed;
        kanbanRepository.theme = data.theme;
        kanbanRepository.lastUpdated = data.lastUpdated;

        currentKanban = kanbanRepository.getByName($routeParams.kanbanName);
        $scope.kanban = currentKanban;
        $scope.allKanbans = Object.keys(kanbanRepository.all());
        $scope.selectedToOpen = $scope.newName = currentKanban.name;

        $scope.switchToList = $scope.allKanbans.slice(0);
        $translate("SWITCH_TO").then(function successFn(translation) {
            $scope.switchToList.splice(0, 0, translation);
            $scope.switchTo = translation;
        });

        $scope.columnHeight = angular.element($window).height() - 110;
        $scope.columnWidth = calculateColumnWidth($scope.kanban.columns.length);

        if (kanbanRepository.getTheme() != undefined && kanbanRepository.getTheme() != ''){
            themesProvider.setCurrentTheme(kanbanRepository.getTheme());
        }

        $scope.reloading = false;

    };

});
