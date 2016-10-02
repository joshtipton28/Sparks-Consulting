app.controller('SidebarController', ['$scope', 'Filter', function($scope, Filter){

	$scope.getReligion = function () {
	  return stylesheet_directory_uri + '/rowingdb/components/sidebar/religion/religion-filter.php';
	};

	$scope.filter = Filter;


    $scope.reset = function() {
        $scope.filter.religion = '';
        return $scope.religions;
    };

}])