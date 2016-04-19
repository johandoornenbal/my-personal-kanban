'use strict';

var mpkModule = angular.module('mpk', ['ngSanitize', 'ngRoute', 'angularSpectrumColorpicker', 'pascalprecht.translate']);

mpkModule.config(function($routeProvider, $locationProvider, $translateProvider) {
	$routeProvider
	  	.when('/kanban', {
			templateUrl: 'kanban.html',
		    controller: 'ApplicationController'
		})
		.when('/kanban/:kanbanName', {
			templateUrl: 'kanban.html',
			controller: 'ApplicationController'
		})
		.otherwise({
			redirectTo: '/kanban'
		});

        $translateProvider.preferredLanguage('nl');

        $translateProvider.useStaticFilesLoader({
          prefix: 'scripts/languages/',
          suffix: '.json'
        });

});
