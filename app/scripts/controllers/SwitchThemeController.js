'use strict';

var SwitchThemeController = function ($scope, themesProvider, kanbanRepository, pollingService) {
	$scope.model = {};
	$scope.model.themes = themesProvider.getThemes();
	
	var theme = kanbanRepository.getTheme();
	if (theme == undefined || theme == ''){
		theme = themesProvider.defaultTheme;
	}

	$scope.model.selectedTheme = theme;

	$scope.switchTheme = function(){
		themesProvider.setCurrentTheme($scope.model.selectedTheme);
		kanbanRepository.setTheme($scope.model.selectedTheme);
		pollingService.setSelfChangeInProgress(false);
	};

	$scope.$on('OpenSwitchTheme', function(){

	    pollingService.setSelfChangeInProgress(true);
		$scope.showSwitchTheme = true;

	});

};

angular.module('mpk').controller('SwitchThemeController', SwitchThemeController);
