'use strict';

var mpkModule = angular.module('mpk', ['ngSanitize', 'ngRoute', 'angularSpectrumColorpicker', 'pascalprecht.translate']);

mpkModule.config(function($routeProvider, $locationProvider, $translateProvider) {
	$routeProvider
	  	.when('/kanban', {
			templateUrl: 'kanbanAdmin.html',
		    controller: 'AdminApplicationController'
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
