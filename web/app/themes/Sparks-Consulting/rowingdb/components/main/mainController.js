app.controller('MainController', ['$scope', 'CollegeFactory', 'Filter', function($scope, CollegeFactory, Filter){
	CollegeFactory.getData(function(data) {
      $scope.colleges = data;
  	})

  	$scope.getSidebar = function () {
	  return stylesheet_directory_uri + '/rowingdb/components/sidebar/sidebar.php';
	};

	$scope.filter = Filter;

}])