app.controller('MainController', [
  '$scope',
  '$state',
  '$filter',
  '$sce',
  'CollegeFactory',
  'Filter',
  MainController]);

function MainController($scope, $state, $filter, $sce, CollegeFactory, Filter) {
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
    $scope.colleges = data;
    angular.forEach($scope.colleges, function(college, key) {
      $scope.colleges[key].norm = {};
      // Convert integer-strings to integers in-place
      angular.forEach([
        'tuition', 'enrollment_count', 'financial_aid_score',
        'academic_intensity', 'school_privacy', 'st_ratio'
      ], function(cat) {
        $scope.colleges[this].acf[cat] = parseInt($scope.colleges[this].acf[cat]) || 0;
      }, key);

      // Normalize and isolate data
      // Normalize from string
      angular.forEach([
        'tuition', 'enrollment_count', 'financial_aid_score',
        'academic_intensity', 'st_ratio'
      ], function(cat) {
        $scope.colleges[this].norm[cat] = parseInt($scope.colleges[this].acf[cat]) || 0;
      }, key);
      // Normalize from object (value key)
      angular.forEach([
        'school_privacy', 'environment', 'selectivity'
      ], function(cat) {
        $scope.colleges[this].norm[cat] = $scope.colleges[this].acf[cat].label;
      }, key);
      // Normalize from "string array...ish"
      console.debug('college', $scope.colleges[key]);
      angular.forEach([
        'housing_types', 'housing_sub_types', 'food_services',
      ], function(cat) {
        $scope.colleges[this].norm[cat] = [];
        angular.forEach($scope.colleges[this].acf[cat], function(val) {
          $scope.colleges[this].norm[cat].push(val.label);
        }, this);
      }, key);
      $scope.colleges[key].norm.location = college.acf.school_city + ', ' + college.acf.school_state;

      console.debug('college', $scope.colleges[key]);
      return;
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
          if( !type.filter(type, college, spec) ) {
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
    if( !college.hasOwnProperty('acf') ||
        !college.acf.hasOwnProperty('school_city') ||
        !college.acf.hasOwnProperty('school_state') ||
        !angular.isString(college.acf.school_city) ||
        !angular.isString(college.acf.school_state) ||
        (college.acf.school_city.length === 0 ||
         !college.acf.school_city.trim()) ||
        (college.acf.school_state.length === 0 ||
         !college.acf.school_state.trim()))
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

  // Allow for HTML rendering / unescaping
  $scope.trustHtml = function(html) {
    return $sce.trustAsHtml(html);
  };

  // Render text intelligently
  $scope.render_acf_text = function(priority, acf) {
    if( !acf || acf[priority.id] === 'false' )
      return '';

    data = get_type_data(priority.id);
    if( data && angular.isFunction(data.render_text) )
      return $scope.filter.types_map[priority.id].render_text(acf, data);
    return acf[priority.id];
  };
}
