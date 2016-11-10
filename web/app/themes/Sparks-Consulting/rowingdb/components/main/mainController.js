app.controller('MainController', [
  '$scope',
  'CollegeFactory',
  'Filter',
  MainController]);

function MainController($scope, CollegeFactory, Filter) {
  $scope.filter = Filter;
  $scope.colleges = [];
  $scope.priorities = [
    {
      "id": null,
      "name": null,
    }, {
      "id": "enrollment_count",
      "name": "Enrollment"
    }, {
      "id": "environment",
      "name": "Environment"
    }, {
      "id": "tuition",
      "name": "Tuition"
    }
  ];

  CollegeFactory.getData(function(data) {
    $scope.colleges = data;
  });

  $scope.getSidebar = function () {
	  return stylesheet_directory_uri + '/rowingdb/components/sidebar/sidebar.php';
	};
}
