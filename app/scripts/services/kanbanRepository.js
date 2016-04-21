'use strict';

angular.module('mpk').factory('kanbanRepository', function (cloudService, cryptoService, $http, $q) {
  return {
    kanbansByName : {},
    lastUsed : '',
    theme: 'default-dark',
    lastUpdated: 0,
    
    add: function(kanban){
      this.kanbansByName[kanban.name] = kanban;
      this.save();
      return kanban;
    },

    all: function(){
      return this.kanbansByName;
    },

    get: function(kanbanName){
      return this.kanbansByName[kanbanName];
    },

    remove: function(kanbanName) {
      if (this.kanbansByName[kanbanName]){
        delete this.kanbansByName[kanbanName];
      }
      return this.kanbansByName;
    },

    prepareSerializedKanbans: function(){
      var timestamp = new Date().getTime();
      var toBeSerialized = {kanbans: this.kanbansByName, lastUsed: this.lastUsed, theme: this.theme, lastUpdated: this.lastUpdated, timestamp : timestamp};
      return angular.toJson(toBeSerialized, false);
    },

    save: function(){
      var prepared = this.prepareSerializedKanbans();

      console.log("saving locally");
      console.log(prepared);
      localStorage.setItem('myPersonalKanban', prepared);

      console.log("saving to db");

      var result = this.restApiSave(prepared);
      result.then(function(data){
        console.log(data);
      });

      return this.kanbansByName;
    },

    restApiSave : function(payload) {
          var defer = $q.defer();
          $http({
                  method: 'POST',
                  url: 'http://localhost:8888/my-personal-kanban/backend/api.php',
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
                      url: 'http://localhost:8888/my-personal-kanban/backend/api.php',
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
      this.save();
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
