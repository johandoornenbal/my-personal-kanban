'use strict';

var NewKanbanCardController = function ($scope, kanbanManipulator, pollingService, uuidService) {
	$scope.master = {title: '', details: '', cardColor: $scope.colorOptions[0]};
	$scope.newCard = {};

	$scope.$on('AddNewCard', function(e, column){
		$scope.kanbanColumnName = column.name;
		$scope.column = column;
		$scope.newCard = angular.copy($scope.master);
		$scope.newCard.createdOn = new Date().getTime();
        $scope.newCard.lastChange = new Date().getTime();

		$scope.showNewCard = true;
	});


	$scope.addNewCard = function(newCard){
		if (!this.newCardForm.$valid){
			return false;
		}

		kanbanManipulator.addCardToColumn(uuidService.generateUUID(), $scope.kanban, $scope.column, newCard.title, newCard.details, newCard.cardColor, newCard.owner, newCard.createdOn, newCard.lastChange);
		$scope.newCard = angular.copy($scope.master);

		
		$scope.showNewCard = false;
		pollingService.setSelfChangeInProgress(false);
		$scope.$emit("newCardAdded");

		return true;
	};


};

angular.module('mpk').controller('NewKanbanCardController', NewKanbanCardController);