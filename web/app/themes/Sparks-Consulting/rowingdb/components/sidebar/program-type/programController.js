app.controller('ProgramFilter', ['$scope', '$modal', 'Filter', function($scope, $modal, Filter ){

    $scope.open = open;

    function open(size, backdrop, closeOnClick, Filter) {
        $scope.filter = [];
        $scope.womensPrograms = [
            { id: 1, name: 'Division I'},
            { id: 2, name: 'Division II'},
            { id: 3, name: 'Division III'},
            { id: 4, name: 'Openweight'},
            { id: 5, name: 'Lightweight'},
            { id: 6, name: 'LWT Club'},
            { id: 7, name: 'Club'},
        ];
        $scope.mensPrograms = [
            { id: 1, name: 'Division I'},
            { id: 2, name: 'Division II'},
            { id: 3, name: 'Division III'},
            { id: 4, name: 'Openweight'},
            { id: 5, name: 'Lightweight'},
            { id: 6, name: 'LWT Club'},
            { id: 7, name: 'Club'},
        ];

        var params = {
            templateUrl: 'program-filter',
            resolve: {
                womensPrograms: function(){
                    return $scope.womensPrograms;
                },
                mensPrograms: function(){
                    return $scope.mensPrograms;
                },
                filter: function(){
                    return $scope.filter;
                }
            },
            controller: function($scope, $modalInstance, womensPrograms, mensPrograms, Filter) {

                $scope.womensPrograms = womensPrograms;
                $scope.mensPrograms = mensPrograms;

                $scope.filter = Filter;

                $scope.reposition = function() {
                    $modalInstance.reposition();
                };

                $scope.ok = function() {
                    $modalInstance.close($scope);
                };

                $scope.cancel = function() {
                    $modalInstance.dismiss('cancel');
                    $scope.filter.wProgram = '';
                    $scope.filter.mProgram = '';
                    return
                        $scope.womensPograms;
                        $scope.mensPrograms;
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