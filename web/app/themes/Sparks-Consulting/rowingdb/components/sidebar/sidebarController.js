app.controller('SidebarController', ['$scope', 'Filter', function($scope, Filter){

	//$scope.getReligion = function () {
	//  return stylesheet_directory_uri + '/rowingdb/components/sidebar/religion/religion-filter.php';
	//};
	//
	//$scope.getProgram = function () {
	//  return stylesheet_directory_uri + '/rowingdb/components/sidebar/program-type/program-filter.php';
	//};

	$scope.getEnrollment = function () {
	  return stylesheet_directory_uri + '/rowingdb/components/sidebar/enrollment/enrollment-filter.php';
	};

	$scope.filter = Filter;

  $scope.filterIsActive = function(filter) {
    var ret = false;
    if( angular.isArray(filter) )
      angular.forEach(filter, function(val) {
        if( val ) {
          ret = true;
          return;
        }
      });
    else if( filter )
      ret = true;
    return ret;
  };

  $scope.reset = function() {
    $scope.filter.filters = {};
  };
}]);
