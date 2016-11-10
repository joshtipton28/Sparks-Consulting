app.controller('MainController', [
  '$scope',
  '$filter',
  'CollegeFactory',
  'Filter',
  MainController]);

function MainController($scope, $filter, CollegeFactory, Filter) {
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
    }
  ];

  // Load college data from external source
  CollegeFactory.getData(function(data) {
    $scope.colleges = data;
  });

  // Load the sidebar
  $scope.getSidebar = function () {
	  return stylesheet_directory_uri + '/rowingdb/components/sidebar/sidebar.php';
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
      console.debug('keep?', keep);
      return keep;
    };
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
        res = val;
        return;
      }
    });
    return res;
  }

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
