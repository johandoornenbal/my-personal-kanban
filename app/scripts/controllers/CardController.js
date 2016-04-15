'use strict';

var CardController = function ($scope) {
	$scope.card = {};
	$scope.editTitle = false;

	$scope.editingDetails = false;
	$scope.editingTitle = false;


	$scope.$on('OpenCardDetails', function(e, card){
		$scope.card = card;

		$scope.editingDetails = false;
		$scope.editingTitle = false;

		$scope.showCardDetails = true;
	});

	$scope.$on('ChangeOwner', function(e, card){
    		$scope.card = card;

    		$scope.editingDetails = false;
    		$scope.editingTitle = false;

    		$scope.changeOwner = true;
    	});

};
mpkModule.controller('CardController', CardController);
