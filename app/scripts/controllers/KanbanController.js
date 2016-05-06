'use strict';

angular.module('mpk').controller('KanbanController', function KanbanController($scope, kanbanManipulator, pollingService, uuidService) {
    
    $scope.addNewCard = function(column){
		$scope.$broadcast('AddNewCard', column);
		pollingService.setSelfChangeInProgress(true);
	};

	$scope.delete = function(card, column){
	    pollingService.setSelfChangeInProgress(true);
		if (confirm('You sure?')){
			kanbanManipulator.removeCardFromColumn($scope.kanban, column, card);
			$scope.$emit('cardDeleted', card.id);
		}
		pollingService.setSelfChangeInProgress(false);
	};
    
    $scope.setOwner = function(card){
		$scope.$broadcast('ChangeOwner', card);
		pollingService.setSelfChangeInProgress(true);
	};

	$scope.updateUsers = function(){
	    $scope.newUser.id = uuidService.generateUUID();
	    $scope.kanban.users.push($scope.newUser);
	    $scope.newUser = {};
	    $scope.$emit('usersChanged');
	};

	$scope.deleteUser = function(user){
	    pollingService.setSelfChangeInProgress(true);
    	if (confirm('You sure?')){
         	angular.forEach($scope.kanban.users, function(u){
               if (u.name === user.name){
                   $scope.kanban.users.splice($scope.kanban.users.indexOf(u), 1);
               }
            });
            $scope.$emit('usersChanged');
        }
        pollingService.setSelfChangeInProgress(false);
    };

	$scope.openCardDetails = function(card){
		$scope.$broadcast('OpenCardDetails', card);
		pollingService.setSelfChangeInProgress(true);
	};

	$scope.detailsFor = function(card){
		if (card.details !== undefined && card.details !== '') {
			return card.details;
		}
		return card.name;
	};

	$scope.columnLimitsTextFor = function(column){
		if (column.settings && column.settings.limit != '' && column.settings.limit != undefined){
			return column.cards.length + " of " + column.settings.limit;
		}
		return column.cards.length;
	};

	$scope.columnLimitsReached = function(column){
		if (column.settings == undefined || column.settings.limit == '' || column.settings.limit == undefined){
			return false;
		}
		return column.settings.limit <= column.cards.length;
	}

	$scope.colorFor = function(card){
		return (card.color !== undefined && card.color !== '') ? card.color : $scope.colorOptions[0];
	};

	$scope.isLastColumn = function(column, kanban){
		function last(coll){
			return coll[coll.length - 1];
		}

		return last(kanban.columns).name == column;
	};

	$scope.archive = function(kanban, column, card){
	    $scope.$emit('archiveChanged');
		return kanbanManipulator.archiveCard(kanban, column, card);
	};

	$scope.columnSettings = function(kanban, column){
	    pollingService.setSelfChangeInProgress(true);
		$scope.$broadcast('OpenColumnSettings', kanban, column);
	};

	$scope.sortableClassFor = function(column){
		if (column.settings && column.settings.limit && column.settings.limit != ''){
			if (column.settings.limit <= column.cards.length){
				return 'cards-no-sort';
			}
		}
		return 'cards';
	};

	$scope.$on('DeleteColumn', function(e, column){
	    pollingService.setSelfChangeInProgress(true);
	    column.cards.forEach(function(card){
	            $scope.$emit('cardDeleted', card.id);
	    });
		kanbanManipulator.removeColumn($scope.kanban, column);
		$scope.$emit('ColumnDeleted', column.id);
		$scope.$emit('ColumnsChanged');
		pollingService.setSelfChangeInProgress(false);
	});

	$scope.$on('AddColumn', function(e, column, direction, label){
	    pollingService.setSelfChangeInProgress(true);
		kanbanManipulator.addColumnNextToColumn($scope.kanban, column, direction, label);
		$scope.$emit('ColumnsChanged');
		$scope.$broadcast('CloseColumnSettings');
		pollingService.setSelfChangeInProgress(false);
	})

	$scope.$on('openUsers', function(e){
	    pollingService.setSelfChangeInProgress(true);
	    $scope.showUsers = true;
	    $scope.newUser = {};
	});

});

