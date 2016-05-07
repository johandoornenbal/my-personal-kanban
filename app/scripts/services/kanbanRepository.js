'use strict';

angular.module('mpk').factory('kanbanRepository', function (cloudService, cryptoService, $http, $q, uuidService) {

     var BACKEND_URI = 'http://localhost:8888/my-personal-kanban/backend/';
     // set id for the browser session

     var browser = uuidService.generateUUID();

     var postToBackend = function(url, payload) {

           var defer = $q.defer();
           $http({
                   method: 'POST',
                   url: url,
                   cache: false,
                   dataType: "json",
                   headers: {
                       'Content-Type': 'application/x-www-form-urlencoded' //BELANGRIJK VOOR REST ENDPOINT!!!! Yodo
                   },
                   data: payload
               })
               .then(function successCallback(response){
                     defer.resolve(response.data);
               },
               function errorCallback(response) {
                     defer.resolve(response.data);
               });

           return defer.promise;

     };

     var getFromBackend = function(url) {

            var defer = $q.defer();
            $http({
                method: 'GET',
                url: url,
                cache: false,
                dataType: "json",
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded' //BELANGRIJK VOOR REST ENDPOINT!!!! Yodo
                }
            })
            .then(function successCallback(response){
                  defer.resolve(response.data);
            },
            function errorCallback(response) {
                  defer.resolve(response.data);
            });

            return defer.promise;

     };

     var columnAdapter = function(column){
          // prepare column to save
          var columnPrepared = {};
          columnPrepared.id = column.id;
          columnPrepared.name = column.name;
          columnPrepared.settings = column.settings;

          // array of card id's is saved instead of card objects
          var cardIds = [];
          column.cards.forEach(function(card){cardIds.push(card.id)});
          columnPrepared.cards = cardIds;
          // console.log(columnPrepared);

          return columnPrepared;
     };

     var kanbanAdapter = function(kanban){

          // prepare kanban to save
          var kanbanPrepared = {};
          kanbanPrepared.id = kanban.id;
          kanbanPrepared.name = kanban.name;
          kanbanPrepared.numberOfColumns = kanban.numberOfColumns;
          kanbanPrepared.settings = kanban.settings;
          kanbanPrepared.users = kanban.users;
          kanbanPrepared.archived = kanban.archived;
          kanbanPrepared.browser = browser;
          var columnsPrep = [];
          kanban.columns.forEach(function(column){
                columnsPrep.push(column.id);
          });
          kanbanPrepared.columns = columnsPrep;

          return kanbanPrepared;

     };

  return {
    kanbansByName : {},
    lastUsed : '',
    theme: 'default-dark',
    lastUpdated: 0,
    browser : browser,
    
    add: function(kanban){
      this.kanbansByName[kanban.name] = kanban;
      this.save();
      return kanban;
    },

    all: function(){
      return this.kanbansByName;
    },

    getByName: function(kanbanName){
      return this.kanbansByName[kanbanName];
    },

    getSingle: function(){
        return this.kanbansByName;
    },

    remove: function(kanbanName) {
      if (this.kanbansByName[kanbanName]){
        delete this.kanbansByName[kanbanName];
      }
      return this.kanbansByName;
    },

    prepareSerializedKanbans: function(){
      var timestamp = new Date().getTime();
      var toBeSerialized = {kanbans: this.kanbansByName, lastUsed: this.lastUsed, theme: this.theme, lastUpdated: this.lastUpdated, timestamp : timestamp, browser : browser};
      return angular.toJson(toBeSerialized, false);
    },

    prepareSingleSerializedKanban: function(){
      var timestamp = new Date().getTime();
      var toBeSerialized = {singlekanban : this.kanbansByName, lastUsed: this.lastUsed, theme: this.theme, lastUpdated: this.lastUpdated, timestamp : timestamp, browser : browser};
      return angular.toJson(toBeSerialized, false);
    },

    save: function(){
      var prepared = this.prepareSerializedKanbans();

      console.log("saving locally");
      localStorage.setItem('myPersonalKanban', prepared);

      console.log("saving to db");

      var result = this.restApiSave(prepared);
      result.then(function(data){
        console.log(data);
      });

      return this.kanbansByName;
    },

    saveSingle: function(){
          var prepared = this.prepareSingleSerializedKanban();

          console.log("saving single kanban locally");
          localStorage.setItem('mySinglePersonalKanban', prepared);

          console.log("saving to single kanban db");

          var result = this.singleRestApiSave(prepared);
          result.then(function(data){
            console.log(data);
          });

          return this.kanbansByName;
    },

    restApiSave : function(payload) {
          var defer = $q.defer();
          $http({
                  method: 'POST',
                  url: BACKEND_URI + 'adminApi.php',
                  cache: false,
                  dataType: "json",
                  headers: {
                      'Content-Type': 'application/x-www-form-urlencoded' //BELANGRIJK VOOR REST ENDPOINT!!!! Yodo
                  },
                  data: payload
              })
              .then(function successCallback(response){
                    defer.resolve(response.data);
              },
              function errorCallback(response) {
                    defer.resolve(response.data);
              });
          return defer.promise;
    },

    restApiLoad : function() {
          console.log("loading from db storage");
          var defer = $q.defer();
          $http({
                  method: 'GET',
                  url: BACKEND_URI + 'adminApi.php',
                  cache: false,
                  dataType: "json",
                  headers: {
                      'Content-Type': 'application/x-www-form-urlencoded' //BELANGRIJK VOOR REST ENDPOINT!!!! Yodo
                  }
              })
              .then(function successCallback(response){
                    defer.resolve(response.data);
              },
              function errorCallback(response) {
                    defer.resolve(response.data);
              });
          return defer.promise;
    },

    singleRestApiSave : function(payload) {
          var defer = $q.defer();
          $http({
                  method: 'POST',
                  url: BACKEND_URI + 'api.php',
                  cache: false,
                  dataType: "json",
                  headers: {
                      'Content-Type': 'application/x-www-form-urlencoded' //BELANGRIJK VOOR REST ENDPOINT!!!! Yodo
                  },
                  data: payload
              })
              .then(function successCallback(response){
                    defer.resolve(response.data);
              },
              function errorCallback(response) {
                    defer.resolve(response.data);
              });
          return defer.promise;
    },

    singleRestApiLoad : function($uuid) {
          console.log("loading from db storage");
          var defer = $q.defer();
          $http({
                  method: 'GET',
                  url: BACKEND_URI + 'api_v2.php/kanban/' + $uuid,
                  cache: false,
                  dataType: "json",
                  headers: {
                      'Content-Type': 'application/x-www-form-urlencoded' //BELANGRIJK VOOR REST ENDPOINT!!!! Yodo
                  }
              })
              .then(function successCallback(response){
                    defer.resolve(response.data);
              },
              function errorCallback(response) {
                    defer.resolve(response.data);
              });
          return defer.promise;
    },

    restApiPoll : function(kanbanId) {
          console.log("Polling backend for kanban with id " + kanbanId + " and browser with id " + browser);
          var defer = $q.defer();
          $http({
                  method: 'GET',
                  url: BACKEND_URI + 'api_v2.php/poll/' + kanbanId,
                  cache: false,
                  dataType: "json",
                  headers: {
                      'Content-Type': 'application/x-www-form-urlencoded' //BELANGRIJK VOOR REST ENDPOINT!!!! Yodo
                  }
              })
              .then(function successCallback(response){
                    defer.resolve(response.data);
              },
              function errorCallback(response) {
                    defer.resolve(response.data);
              });
          return defer.promise;
    },

    getCard : function(cardId) {
        return getFromBackend(BACKEND_URI + 'api_v2.php/card/' + cardId);
    },

    saveCard : function(card, kanbanId) {
          card.kanbanId = kanbanId;
          card.browser = browser;
          var payload = angular.toJson(card, false);
          return postToBackend(BACKEND_URI + 'api_v2.php/savecard', payload);
    },

    deleteCard : function(cardId, kanbanId) {
          var obj = {};
          obj.cardId = cardId;
          obj.kanbanId = kanbanId;
          obj.browser = browser;
          var payload = angular.toJson(obj, false);
          return postToBackend(BACKEND_URI + 'api_v2.php/deletecard', payload);
    },

    saveColumn : function(column, kanbanId) {
          var columnPrepared = columnAdapter(column);
          columnPrepared.kanbanId = kanbanId;
          columnPrepared.browser = browser;
          var payload = angular.toJson(columnPrepared, false);
          return postToBackend(BACKEND_URI + 'api_v2.php/savecolumn', payload);
    },

    deleteColumn : function(columnId, kanbanId) {
          var obj = {};
          obj.columnId = columnId;
          obj.kanbanId = kanbanId;
          obj.browser = browser;
          var payload = angular.toJson(obj, false);
          return postToBackend(BACKEND_URI + 'api_v2.php/deletecolumn', payload);
    },

    saveUsers : function(kanban) {
          var kanbanPrepared = kanbanAdapter(kanban);
          var payload = angular.toJson(kanbanPrepared, false);
          return postToBackend(BACKEND_URI + 'api_v2.php/saveusers', payload);
    },

    saveArchive : function(kanban) {
          var kanbanPrepared = kanbanAdapter(kanban);
          var payload = angular.toJson(kanbanPrepared, false);
          return postToBackend(BACKEND_URI + 'api_v2.php/savearchive', payload);
    },

    saveSettings : function(kanban) {
          var kanbanPrepared = kanbanAdapter(kanban);
          var payload = angular.toJson(kanbanPrepared, false);
          return postToBackend(BACKEND_URI + 'api_v2.php/savesettings', payload);
    },

    load: function(){
      var saved = angular.fromJson(localStorage.getItem('myPersonalKanban'));
      if (saved === null) {
        return null;
      }
      this.kanbansByName = saved.kanbans;
      this.lastUsed = saved.lastUsed;
      this.theme = saved.theme;
      this.lastUpdated = saved.lastUpdated;
      console.log("loading from local storage");

      return this.kanbansByName;
    },

    getLastUsed: function(){
      if (!this.lastUsed){
        return this.kanbansByName[Object.keys(this.kanbansByName)[0]];
      }
      return this.kanbansByName[this.lastUsed];
    },

    setLastUsed : function(kanbanName){
      this.lastUsed = kanbanName;
      return this.lastUsed;
    },

    getTheme: function(){
      return this.theme;
    },

    setTheme: function(theme){
      this.theme = theme;
      return this.theme;
    },

    /**
    * returns the Promise from the chained calls (just in case I freaking forget)
    */
    upload: function(){
      return cloudService.uploadKanban(this.prepareSerializedKanbans());
    },

    setLastUpdated: function(updated){
      this.lastUpdated = updated;
      return this;
    },

    getLastUpdated: function(){
      return this.lastUpdated;
    },

    download: function(){
      return cloudService.downloadKanban();
    },

    saveDownloadedKanban: function(kanban, lastUpdated){
      if (typeof(kanban) == 'string'){
        try {
          kanban = cryptoService.decrypt(kanban, cloudService.settings.encryptionKey);
        }catch (ex){
          console.debug(ex);
          return {success: false, message: "Looks like Kanban saved in the cloud was persisted with different encryption key. You'll need to use old key to download your Kanban. Set it up in the Cloud Setup menu."};
        }
      }
      var fromCloud = angular.fromJson(kanban);
      this.kanbansByName = fromCloud.kanbans;
      this.lastUsed = fromCloud.lastUsed;
      this.theme = fromCloud.theme;
      this.lastUpdated = lastUpdated;
      this.save();

      return {success: true}; 
    },

    renameLastUsedTo: function(newName){
      var lastUsed = this.getLastUsed();
      delete this.kanbansByName[lastUsed.name];
      lastUsed.name = newName;

      this.kanbansByName[newName] = lastUsed;
      this.lastUsed = newName;
      return true;
    },

    import: function(kanbans){
      var self = this;
      angular.forEach(Object.keys(kanbans), function(kanbanName){
        self.kanbansByName[kanbanName] = kanbans[kanbanName];
      });
      var names = Object.keys(kanbans);
      this.setLastUsed(kanbans[names[0]]);
      this.save();
    }

  };
});
