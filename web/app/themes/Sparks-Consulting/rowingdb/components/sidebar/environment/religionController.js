app.controller('ReligionFilter', ['$scope', '$modal', 'Filter', function($scope, $modal, Filter ){

	$scope.open = open;

    function open(size, backdrop, closeOnClick, Filter) {
        $scope.filter = [];
        $scope.religions = [
            { id: 1, name: 'None'},
            { id: 2, name: 'Catholic'},
            { id: 3, name: 'Roman Catholic'},
            { id: 4, name: 'Jesuit'},
            { id: 5, name: 'Lutheran'},
            { id: 6, name: 'Methodist'},
            { id: 7, name: 'Free Methodist'},
            { id: 8, name: 'Presbyterian'},
        ];

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

                $scope.religions = religions;

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