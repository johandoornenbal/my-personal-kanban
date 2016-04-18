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

//		$translateProvider.translations('en', {
//		    CARD_DETAILS: 'Card details',
//            CARD_TITLE: 'Kanban card title'
//          })
//          .translations('nl', {
//            CARD_DETAILS: 'Kaart details',
//            CARD_TITLE: 'Kanban kaart titel'
//          });

        $translateProvider.preferredLanguage('nl');

        $translateProvider.useStaticFilesLoader({
          prefix: 'scripts/languages/',
          suffix: '.json'
        });

});
