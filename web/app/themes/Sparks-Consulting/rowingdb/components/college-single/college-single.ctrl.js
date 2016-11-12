app.controller('CollegeSingleCtrl', [
  '$scope',
  '$state',
  '$stateParams',
  '$filter',
  '$sce',
  'CollegeFactory',
  'Filter',
  CollegeSingleCtrl]);

function CollegeSingleCtrl($scope, $state, $stateParams, $filter, $sce, CollegeFactory, Filter) {
  $scope.filter = Filter;
  $scope.slug = $stateParams.collegeSlug || null;
  $scope.college = {};
  $scope.colleges = [];
  // Load college data from external source
  CollegeFactory.getData(function(data) {
    $scope.colleges = data;
    $scope.college = $scope.get_college_by_slug($scope.slug);
    console.debug('slug', $scope.slug);
    console.debug('college', $scope.college);
  });

  $scope.get_college_by_slug = function(slug) {
    var ret = null;
    angular.forEach($scope.colleges, function(college) {
      if( college.slug === slug ) {
        ret = college;
        return;
      }
    });
    return ret;
  };

  $scope.go = function(ref) {
    $state.go(ref);
  };

  $scope.resetFilters = function() {
    $scope.filter.priority = ["", "", ""];
    $scope.filter.filters = {};
  };

  // Maybe the user got lost...
  if( !$scope.slug ) {
    $scope.go('home');
  }
}
