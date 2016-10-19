app.controller('EnrollmentFilter', ['$scope', '$modal', 'Filter', function($scope, $modal, Filter ){

	$scope.open = open;

    function open(size, backdrop, closeOnClick, Filter) {
        $scope.filter = [];
        $scope.enrollments = [
            { id: 1, name: 'Small (less than 2500)'},
            { id: 2, name: 'Medium (2501 - 10,000)'},
            { id: 3, name: 'Large (10,000 or more)'},
        ];

        var params = {
            templateUrl: 'enrollment-filter',
            resolve: {
                enrollments: function(){
                    return $scope.enrollments;
                },
                filter: function(){
                    return $scope.filter;
                }
            },
            controller: function($scope, $modalInstance, enrollments, Filter) {

                $scope.enrollments = enrollments;

                $scope.filter = Filter;

                $scope.reposition = function() {
                    $modalInstance.reposition();
                };

                $scope.ok = function() {
                    $modalInstance.close($scope);
                };

                $scope.cancel = function() {
                    $modalInstance.dismiss('cancel');
                    $scope.filter.enrollment = '';
                    return $scope.enrollments;
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