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
    return function() {
      var keep = true;
      console.debug('prioritiesFilter(' + current_idx + ')', $scope.filter.priority);
      angular.forEach($scope.filter.priority, function(priority, idx) {
        console.debug('itr', idx, priority, current_idx);
        if( idx !== current_idx ) {
          if( priority && priority !== "" &&
              priority === $scope.filter.priority[current_idx] ) {
            keep = false;
            return;
          }
        }
      });
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
  $scope.render_acf_text = function(priority, acf_text) {
    if( acf_text === 'false' )
      return '';

    data = get_type_data(priority.id);
    if( data && angular.isFunction(data.render_text) )
      return $scope.filter.types_map[priority.id].render_text(acf_text, data);
    return acf_text;
  };
}
