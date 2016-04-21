'use strict';

angular.module('mpk').factory('pollingService', function(kanbanRepository, $timeout){

      var previousPolledTimeStamp;
      var polledTimeStamp;
      var poll;
      var change = false;
      var selfChangeInProgress = false;

      return {
          poll:  poll = function() {
             $timeout(function() {
                 poll();
             }, 1000);

             kanbanRepository.restApiPoll().then(function(data){
                previousPolledTimeStamp = polledTimeStamp;
                polledTimeStamp = data.servertimestamp;
//                console.log(previousPolledTimeStamp);
//                console.log(polledTimeStamp);
                if (polledTimeStamp > previousPolledTimeStamp){
                    change = true;
                }
             });
          },
          getChange : function(){ return change;},
          setNoChange : function(){ change = false; },
          getSelfChangeInProgress : function(){ return selfChangeInProgress; },
          setSelfChangeInProgress : function(changing){selfChangeInProgress = changing; }
      };

});