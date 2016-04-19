angular.module('mpk').controller('TranslateController', function($translate, $scope) {
    $scope.changeLanguage = function (langKey) {
        $translate.use(langKey);
    };

});