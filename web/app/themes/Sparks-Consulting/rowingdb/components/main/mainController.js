app.controller('MainController', [
  '$scope',
  '$state',
  '$http',
  '$filter',
  '$sce',
  'CollegeFactory',
  'Filter',
  MainController]);

function MainController($scope, $state, $http, $filter, $sce, CollegeFactory, Filter) {
  $scope.filter = Filter;
  $scope.filtered = [];
  $scope.sort = {
    priority: {},
    direction: false
  };
  $scope.counter = {
    'from': 0,
    'to': 0,
    'effect': 'swing',
    'duration': 2
  };
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
    }, {
      "id": "st_ratio",
      "name": "Classroom Ratio"
    }, {
      "id": "location",
      "name": "Location"
    }, {
      "id": "financial_aid_score",
      "name": "Financial Aid"
    }, {
      "id": "academic_intensity",
      "name": "Academic Intensity"
    }, {
      "id": "school_privacy",
      "name": "Private/Public"
    }
  ];

  // Load college data from external source
  CollegeFactory.getData(function(data) {
    $scope.colleges = [];
    var flag = false;
    angular.forEach(data, function(college) {
      $scope.colleges.push($scope.filter.normalizeCollege(college));

      if( !flag ) {
        console.debug('colleges', $scope.colleges);
        flag = true;
      }
    });

    var csv = [];
    angular.forEach($scope.colleges, function(college, key) {
      $http.get(
        'https://maps.googleapis.com/maps/api/geocode/json?' +
        'key=AIzaSyDO7gncwOeigq77yzyzSREllCQic3-oC2o&' +
        'address=' + $scope.trustHtml(college.title.rendered) +
        ', ' + college.acf.school_city + ', ' + college.acf.school_state
      ).then(function successCallback(res) {
        if( res && res.hasOwnProperty('data') ) {
          $scope.colleges[key].norm.position = [
            res.data.results[0].geometry.location.lat,
            res.data.results[0].geometry.location.lng
          ];

          csv.push({
            'id': college.id,
            'slug': college.slug,
            'title': $scope.trustHtml(college.title.rendered),
            'city': college.acf.school_city,
            'state': college.acf.school_state,
            'latitude': res.data.results[0].geometry.location.lat,
            'longitude': res.data.results[0].geometry.location.lng
          });

          console.debug('csv', csv);
        }
        else
          console.error('Unexpected featured image format', res);
      }, function errorCallback(res) {
        console.error('Error getting featured image', res);
      });
    });
  });

  $scope.go = function(ref) {
    $state.go(ref);
  };

  $scope.resetFilters = function() {
    $scope.filter.priority = ["enrollment_count", "tuition", "location"];
    $scope.filter.filters = {};
  };

  $scope.$watch('filtered.length', function(nval, oval) {
    $scope.counter.from = oval;
    $scope.counter.to = nval;
  });

  // Load the sidebar
  $scope.getSidebar = function () {
	  return stylesheet_directory_uri + '/rowingdb/components/sidebar/sidebar.php';
	};

  // Set the table sort
  $scope.setSort = function(priority) {
    if( $scope.sort.priority === priority ) {
      $scope.sort.direction = !$scope.sort.direction;
    } else {
      $scope.sort.priority = priority;
      $scope.sort.direction = false;
    }
  };

  // Priorities options filter
  $scope.prioritiesFilter = function(current_idx) {
    return function(item) {
      var keep = true;
      var existing_priorities = [];
      // Get a list of all priorities defined
      angular.forEach($scope.filter.priority, function(priority, idx) {
        if( idx !== current_idx && priority && priority !== "" )
          existing_priorities.push(priority);
      });
      // If no priorities already defined, return
      if( !existing_priorities.length )
        return keep;
      // Check if this item already is defined elsewhere
      angular.forEach(existing_priorities, function(priority) {
        if( this.id === priority ) {
          keep = false;
          return;
        }
      }, item);
      return keep;
    };
  };

  // Filter of filters...
  $scope.masterFilter = function(college) {
    ret = true;
    angular.forEach($scope.filter.filters, function(spec, type_id) {
      if( spec && type_id ) {
        var type = $scope.filter.types_map[type_id];
        if( type && angular.isFunction(type.filter) ) {
          type.id = type_id;
          // "type" is the types_map[id]
          // "val" is the college normalized data value
          // "spec" is the filter value to be applied
          if( !type.filter(type, college.norm[type.id], spec) ) {
            ret = false;
            return ret;
          }
        }
      }
    });
    return ret;
  };

  // Filter out colleges without well-formatted city/state parts
  $scope.hasLocationFilter = function(college) {
    if( !college.norm.position )
      return false;
    return true;
  };

  // Find a priority by id
  $scope.get_priority_by_id = function(pid) {
    var prio = null;
    if( pid === null ) return prio;
    angular.forEach($scope.priorities, function(val) {
      if( pid === val.id ) {
        prio = val;
        return;
      }
    });
    return prio;
  };

  // Return ordered, existing priorities list
  $scope.get_priorities = function() {
    var prios = [];
    angular.forEach($scope.filter.priority, function(val) {
      if( val !== null && val !== "" ) {
        var prio = $scope.get_priority_by_id(val);
        if( prio !== null )
          prios.push(prio);
      }
    });
    return prios;
  };

  // Allow for HTML rendering / unescaping
  $scope.trustHtml = function(html) {
    return $sce.trustAsHtml(html);
  };

  // Render text intelligently
  $scope.render_acf_text = function(priority, college) {
    if( !college || !college.norm || college.norm[priority.id] === 'false' )
      return '';

    if( $scope.filter.types_map[priority.id] &&
        angular.isFunction($scope.filter.types_map[priority.id].render_text) )
      return $scope.filter.types_map[priority.id].render_text(college.norm[priority.id]);
    return college.norm[priority.id];
  };
}
