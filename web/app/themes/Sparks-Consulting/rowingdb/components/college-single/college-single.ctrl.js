app.controller('CollegeSingleCtrl', [
  '$scope',
  '$state',
  '$stateParams',
  '$http',
  '$filter',
  '$sce',
  'CollegeFactory',
  'Filter',
  CollegeSingleCtrl]);

function CollegeSingleCtrl($scope, $state, $stateParams, $http, $filter, $sce, CollegeFactory, Filter) {
  $scope.filter = Filter;
  $scope.slug = $stateParams.collegeSlug || null;
  $scope.college = {};
  $scope.colleges = [];
  // Load college data from external source
  CollegeFactory.getData(function(data) {
    $scope.college = {};
    angular.forEach(data, function(college) {
      if( college.slug === $scope.slug ) {
        $scope.college = $scope.filter.normalizeCollege(college);
        return;
      }
    });

    console.debug('slug', $scope.slug);
    console.debug('college', $scope.college);

    if( !$scope.college || !$scope.college.norm ) {
      console.error('Invalid college specified', $scope.slug);
      $scope.go('home');
      return;
    }

    // Load the featured image URL
    $scope.college.norm.featured_image = null;
    if( $scope.college.featured_media ) {
      $http.get(
        '/wp-json/wp/v2/media/' + $scope.college.featured_media
      ).then(function successCallback(res) {
        if( res && res.hasOwnProperty('data') )
          $scope.college.norm.featured_image = res.data.source_url;
        else
          console.error('Unexpected featured image format', res);
      }, function errorCallback(res) {
        console.error('Error getting featured image', res);
      });
    }
  });

  // Allow for HTML rendering / unescaping
  $scope.trustHtml = function(html) {
    return $sce.trustAsHtml(html);
  };

  // Render text intelligently
  $scope.render_acf_text = function(priority, college) {
    if( !college || !college.norm || college.norm[priority] === 'false' )
      return '';

    if( $scope.filter.types_map[priority] &&
        angular.isFunction($scope.filter.types_map[priority].render_text) )
      return $scope.filter.types_map[priority].render_text(college.norm[priority]);
    return college.norm[priority];
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
