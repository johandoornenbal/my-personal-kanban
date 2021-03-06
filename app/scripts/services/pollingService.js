'use strict';

angular.module('mpk').factory('pollingService', function(kanbanRepository, $timeout){

      var myTimeStamp;
      var previousPolledTimeStamp;
      var polledTimeStamp;
      var polledBrowser;
      var poll;
      var change = false;
      // this var can be set in order to give a controller using the service a clue that
      // possible changes from backend could conflict with the editing (possibly) going on
      var selfChangeInProgress = false;
      var polledTimeStampChange;
      var pauze = false;

      return {
          poll:  poll = function(kanbanId) {
             $timeout(function() {

                if (!pauze){

                    console.log('polling ...');
                     kanbanRepository.restApiPoll(kanbanId).then(function(data){
                        myTimeStamp = new Date().getTime();
                        previousPolledTimeStamp = polledTimeStamp;
                        polledTimeStamp = data.servertimestamp;
                        console.log(polledTimeStamp);
                        polledBrowser = data.browser;
                        if (polledTimeStamp > previousPolledTimeStamp && polledBrowser != kanbanRepository.browser){
                            change = true;
                            polledTimeStampChange = polledTimeStamp;
                        }
                     });

                } else {

                    console.log('pauzing polling ...');

                }

                poll(kanbanId);

             }, 3000);


          },
          getChange : function(){ return change;},
          setNoChange : function(){ change = false; },
          getSelfChangeInProgress : function(){ return selfChangeInProgress; },
          setSelfChangeInProgress : function(changing){selfChangeInProgress = changing; },
          getPolledTimeStampChange : function(){ return polledTimeStampChange; },
          setPauze : function(pauzing){pauze = pauzing;},
          getPauze : function(){return pauze;},
          getMyTimeStamp : function(){return myTimeStamp;}
      };

});