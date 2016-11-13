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
    $scope.colleges = data;
    $scope.college = $scope.get_college_by_slug($scope.slug);
    console.debug('slug', $scope.slug);
    console.debug('college', $scope.college);

    if( !$scope.college || !$scope.college.acf ) {
      console.error('Invalid college specified', $scope.slug);
      $scope.go('home');
      return;
    }

    // Load the featured image URL
    $scope.college.featured_image_source = null;
    if( $scope.college.featured_media ) {
      $http.get(
        '/wp-json/wp/v2/media/' + $scope.college.featured_media
      ).then(function successCallback(res) {
        if( res && res.hasOwnProperty('data') )
          $scope.college.featured_image_source = res.data.source_url;
        else
          console.error('Unexpected featured image format', res);
      }, function errorCallback(res) {
        console.error('Error getting featured image', res);
      });
    }
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

  // Allow for HTML rendering / unescaping
  $scope.trustHtml = function(html) {
    return $sce.trustAsHtml(html);
  };

  // Find a type's corresponding data
  function get_type_data(type) {
    var res = null;
    angular.forEach($scope.filter.types_map, function(val, key) {
      if( type === key ) {
        val.id = key;
        res = val;
        return;
      }
    });
    return res;
  }

  // Render text intelligently
  $scope.render_acf_text = function(priority, acf) {
    if( !acf || acf[priority] === 'false' )
      return '';

    data = get_type_data(priority);
    if( data && angular.isFunction(data.render_text) )
      return $scope.filter.types_map[priority].render_text(acf, data);
    return acf[priority];
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
