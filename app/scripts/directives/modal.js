'use strict';

angular.module('mpk').directive('mpkModal', function (pollingService) {
	return {
      template: '<div class="modal fade">' + 
          '<div class="modal-dialog" style="{{ style }}" >' + 
            '<div class="modal-content">' + 
              '<div class="modal-header">' + 
                '<button type="button" class="close" data-dismiss="modal" aria-hidden="true" ng-click="stopSelfChange()">&times;</button>' +
                '<h4 class="modal-title">{{ title | translate }}</h4>' +
              '</div>' + 
              '<div class="modal-body" ng-transclude></div>' + 
            '</div>' + 
          '</div>' + 
        '</div>',
      restrict: 'E',
      transclude: true,
      replace: true,
      scope: true,
      link: function postLink(scope, element, attrs) {
        scope.title = attrs.title;
        scope.style = '';
        if (attrs.modalStyle){
          scope.style = attrs.modalStyle;
        }

        scope.$watch(attrs.visible, function(value){
          if(value == true)
            $(element).modal('show');
          else
            $(element).modal('hide');
        });

        $(element).on('shown.bs.modal', function(){
          scope.$apply(function(){
            scope.$parent[attrs.visible] = true;
            // when any modal open, pollingService is told that selfchange is in progress
            // this var can be (and is being) used by application controller in order to prevent
            // loading changes from RestApi
            pollingService.setSelfChangeInProgress(true);
          });
        });

        $(element).on('hidden.bs.modal', function(){
          scope.$apply(function(){
            scope.$parent[attrs.visible] = false;
            // when any modal closed, pollingService is told that selfchange is done
            pollingService.setSelfChangeInProgress(false);
          });
        });
      }
    };
});