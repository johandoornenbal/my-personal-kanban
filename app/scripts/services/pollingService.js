'use strict';

angular.module('mpk').factory('pollingService', function(kanbanRepository, $timeout){

      var previousPolledTimeStamp;
      var polledTimeStamp;
      var poll;
      var change = false;
      // this var can be set in order to give a controller using the service a clue that
      // possible changes from backend could conflict with the editing (possibly) going on
      var selfChangeInProgress = false;
      var polledTimeStampChange;
      //TODO: implement check that backend connection is responding OK
      var connectionLost = false;

      return {
          poll:  poll = function() {
             $timeout(function() {
                 poll();
             }, 10000);

             kanbanRepository.restApiPoll().then(function(data){
                previousPolledTimeStamp = polledTimeStamp;
                polledTimeStamp = data.servertimestamp;
//                console.log(previousPolledTimeStamp);
//                console.log(polledTimeStamp);
                if (polledTimeStamp > previousPolledTimeStamp){
                    change = true;
                    polledTimeStampChange = polledTimeStamp;
                }
             });
          },
          getConnectionLost: function(){ return connectionLost;},
          getChange : function(){ return change;},
          setNoChange : function(){ change = false; },
          getSelfChangeInProgress : function(){ return selfChangeInProgress; },
          setSelfChangeInProgress : function(changing){selfChangeInProgress = changing; },
          getPolledTimeStampChange : function(){ return polledTimeStampChange; }
      };

});