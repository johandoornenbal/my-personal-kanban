'use strict';

var NewKanbanController = function ($scope, kanbanRepository, kanbanManipulator, $translate, pollingService, uuidService){
	$scope.model = {};

	$scope.$on('OpenNewKanban', function(e, allKanbanNames){
		$scope.model.kanbanNames = allKanbanNames;
		$scope.model.kanbanName = '';
		$scope.model.numberOfColumns = 3;
		$scope.model.useTemplate = '';
		$scope.model.id = uuidService.generateUUID();

		$scope.showNewKanban = true;
	});

	$scope.createNew = function(){

		if (!this.newKanbanForm.$valid){
			return false;
		}

		if ($scope.model.kanbanNames.indexOf($scope.model.kanbanName) !== -1){
            $translate("NAME_IN_USE").then(function successFn(translation) {
                var msg = translation;
                alert(msg);
            });
        	return false;
        }

		var newKanban = new Kanban($scope.model.id, $scope.model.kanbanName, $scope.model.numberOfColumns);

		if ($scope.model.useTemplate != ''){
			var templateKanban = kanbanRepository.all()[$scope.model.useTemplate];
			newKanban = kanbanManipulator.createNewFromTemplate(templateKanban, $scope.model.id, $scope.model.kanbanName);
		} else {
            $translate("COLUMN").then(function successFn(translation) {
                var column = translation;
                for (var i=1;i<parseInt($scope.model.numberOfColumns)+1;i++){
                    kanbanManipulator.addColumn(newKanban, column + ' ' + i);
                }
            });
		}

		kanbanRepository.add(newKanban);

		$scope.kanbanName = '';
		$scope.numberOfColumns = 3;
		
		kanbanRepository.setLastUsed(newKanban.name);

		$scope.$emit('NewKanbanAdded');
		$scope.showNewKanban = false;
		pollingService.setSelfChangeInProgress(false);

		return true;
	};

};

angular.module('mpk').controller('NewKanbanController', NewKanbanController);