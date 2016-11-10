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

  function get_item_by_id(data, iid) {
    var res = null;
    angular.forEach(data.items, function(val) {
      if( iid === val.id  ) {
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
    if( data ) {
      // Enrollment
      if( priority.id === 'enrollment_count' ) {
        return $filter('number')(acf_text);
      // Tuition
      } else if( priority.id === 'tuition' ) {
        var tuition = parseInt(acf_text);
        if( isNaN(tuition) || !tuition )
          return 'Full Scholarship';
        return $filter('currency')(acf_text);
      // Environment
      } else if( priority.id === 'environment' ) {
        count = parseInt(acf_text);
        if( !isNaN(count) ) {
          var item = get_item_by_id(data, count);
          if( item )
            return item.name;
        }
      }
    }
    return acf_text;
  };
}
