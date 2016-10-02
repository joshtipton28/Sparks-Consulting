app.controller('ReligionFilter', ['$scope', 'ReligionFactory', '$modal', 'Filter', function($scope, ReligionFactory, $modal, Filter ){

	$scope.open = open;

    function open(size, backdrop, closeOnClick, Filter) {
        $scope.filter = [];

        var params = {
            templateUrl: 'religion-filter',
            resolve: {
                religions: function(){
                    return $scope.religions;
                },
                filter: function(){
                    return $scope.filter;
                }
            },
            controller: function($scope, $modalInstance, religions, Filter) {

                ReligionFactory.getData(function(data) {
                    $scope.religions = data;
                })

                $scope.filter = Filter;

                $scope.reposition = function() {
                    $modalInstance.reposition();
                };

                $scope.ok = function() {
                    $modalInstance.close($scope);
                };

                $scope.cancel = function() {
                    $modalInstance.dismiss('cancel');
                    $scope.filter.religion = '';
                    return $scope.religions;
                };

                $scope.openNested = function() {
                    open();
                };

            }
        };

        if(angular.isDefined(closeOnClick)){
            params.closeOnClick = closeOnClick;
        }

        if(angular.isDefined(size)){
            params.size = size;
        }

        if(angular.isDefined(backdrop)){
            params.backdrop = backdrop;
        }

        var modalInstance = $modal.open(params);

        modalInstance.result.then(function(selectedItem) {
            $scope.filter = selectedItem;
        });

    };
}])