'use strict';

angular.module('mpk').factory('kanbanManipulator', function (uuidService) {
  return {
    columnIndex: function(kanban, column){
      var theIndex;
      angular.forEach(kanban.columns, function(col, index){
        if (col === column) { theIndex = index; }
      });
      return theIndex;  
    },

    addColumn: function(kanban, columnName){
      kanban.columns.push(new KanbanColumn(columnName, uuidService.generateUUID()));
    },

    addCardToColumn: function(id, kanban, column, cardTitle, details, color, owner, createdOn, lastChange){
      angular.forEach(kanban.columns, function(col){
        if (col.name === column.name){
          col.cards.push(new KanbanCard(id, cardTitle, details, color, owner, createdOn, lastChange));
        }
      });
    },

    removeCardFromColumn: function(kanban, column, card){
      angular.forEach(kanban.columns, function(col){
        if (col.name === column.name){
          col.cards.splice(col.cards.indexOf(card), 1);
        }
      });
    },

    archiveCard: function(kanban, column, card){
      if (kanban.archived == undefined){
        kanban.archived = [];
      }
      kanban.archived.push({card: card, archivedOn: new Date()})
      this.removeCardFromColumn(kanban, column, card);
    },

    unarchiveCard: function(kanban, archivedCard){
      function lastColumn(kanban){
        return kanban.columns[kanban.columns.length - 1];
      }
      this.removeFromArchive(kanban, archivedCard);
      lastColumn(kanban).cards.push(archivedCard.card);     
    },

    removeFromArchive: function(kanban, archivedCard){
      kanban.archived.splice(kanban.archived.indexOf(archivedCard), 1); 
    },

    createNewFromTemplate: function(kanban, newId, newName){
      var newKanban = new Kanban(newId, newName, kanban.columns.length);
      angular.forEach(kanban.columns, function(col) {
        newKanban.columns.push(new KanbanColumn(col.name, uuidService.generateUUID(), col.settings));
      });
      return newKanban;
    },

    removeColumn: function(kanban, column){
      var indexOfColumn = this.columnIndex(kanban, column);
      kanban.columns.splice(indexOfColumn, 1);
      kanban.numberOfColumns--;
      return kanban;
    },

    addColumnNextToColumn: function(kanban, column, direction, label){
      var columnIndex = this.columnIndex(kanban, column);
      if (direction == 'left'){
        kanban.columns.splice(columnIndex, 0, new KanbanColumn(label + ' '+ (kanban.numberOfColumns + 1), uuidService.generateUUID()));
      } else {
        kanban.columns.splice(columnIndex+1, 0, new KanbanColumn(label + ' '+ (kanban.numberOfColumns + 1), uuidService.generateUUID()));
      }
      kanban.numberOfColumns++;
      return kanban;
    }
  };
});
