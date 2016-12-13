(function () {
    angular.module('newsDetail', [])
        .controller('newsDetailCtrl', [
            "$scope", "$stateParams", "NewsDetail",
            function ($scope, $stateParams, NewsDetail) {
                $scope.txt = NewsDetail.getData()[$stateParams.id];
            }]);
})();