app.controller('FilterCtrl', [
  '$scope',
  '$modal',
  '$http',
  'Filter',
  FilterCtrl]);

function FilterCtrl($scope, $modal, $http, Filter) {
  var types_map = {
    "enrollment": {
      "type": "dropdown",
      "title": "Enrollment",
      "content": "Select the size of school you're interested in. Numbers pertain to undergraduate enrollment.",
      "items": [{
          "id": 1,
          "name": "Small (less than 2500)"
        }, {
          "id": 2,
          "name": "Medium (2501 - 10,000)"
        }, {
          "id": 3,
          "name": "Large (10,000 or more)"
        },
      ]
    },
    "tuition": {
      "type": "dropdown",
      "title": "Tuition",
      "content": "Select the amount of expense your family will be able to manage.",
      "items": [{
        "id": 1,
        "name": "Very Low (less than $10,000)"
      }, {
        "id": 2,
        "name": "Low ($10,001 - $25,000)"
      }, {
        "id": 3,
        "name": "Normal ($25,001 - $40,000)"
      }, {
        "id": 4,
        "name": "High ($40,001 or more)"
      }]
    },
    "financial-score": {
      "type": "dropdown",
      "title": "Financial Aid Score",
      "content": "Select the level of financial aid you believe you'll need.",
      "items": [{
        "id": 1,
        "name": "Outstanding, Top 5%"
      }, {
        "id": 2,
        "name": "Excellent, Top 10%"
      }, {
        "id": 3,
        "name": "Very Good, Top 15%"
      }, {
        "id": 4,
        "name": "Average, Top 25%"
      }, {
        "id": 5,
        "name": "Moderate, Top 40%"
      }]
    },
    "class-ratio": {
      "type": "dropdown",
      "title": "Classroom Ratio",
      "content": "Select the type of relationship you'd like to have with professors.",
      "items": [{
        "id": 1,
        "name": "Intimate (8:1 or smaller)"
      }, {
        "id": 2,
        "name": "Close (8:1 - 11:1)"
      }, {
        "id": 3,
        "name": "Decent (11:1 - 14:1)"
      }, {
        "id": 4,
        "name": "Average (14:1 or larger)"
      }]
    },
    "environment": {
      "type": "dropdown",
      "title": "Environment",
      "content": "Prefer the city? Maybe you need to be around the woods. Select an environment you'd like to goto school in.",
      "items": [{
        "id": 1,
        "name": "Large City"
      }, {
        "id": 2,
        "name": "Mid-sized City"
      }, {
        "id": 3,
        "name": "Small City"
      }, {
        "id": 4,
        "name": "Suburban"
      }, {
        "id": 5,
        "name": "Urban"
      }, {
        "id": 6,
        "name": "Small Town"
      }]
    },
    "academic-intensity": {
      "type": "dropdown",
      "title": "Academic Intensity",
      "content": "Select a level of academic intensity.",
      "items": [{
        "id": 1,
        "name": "Moderate"
      }, {
        "id": 2,
        "name": "Demanding"
      }, {
        "id": 3,
        "name": "Strenuous"
      }, {
        "id": 4,
        "name": "Intense"
      }]
    },
    "school-privacy": {
      "type": "dropdown",
      "title": "Private/Public",
      "content": "Please make a selection.",
      "items": [{
        "id": 1,
        "name": "Public"
      }, {
        "id": 2,
        "name": "Private"
      }]
    },
    "alcohol": {
      "type": "dropdown",
      "title": "Housing, Alcohol",
      "content": "Make a selection - this information is based on school policy, though the reality can vary.",
      "items": [{
        "id": 1,
        "name": "Allowed"
      }, {
        "id": 2,
        "name": "Not Allowed"
      }]
    }
  };

  $scope.filter = Filter;

  //$http.get('assets/types_map.json')
  //  .success(function(data) {
  //    console.debug('Loaded types_map.json', data);
  //    types_map = data;
  //  })
  //  .catch(function(err) {
  //    console.error('Could not load types_map.json', err);
  //  });

  // Find a type's corresponding data
  function get_type_data(type) {
    var res = null;
    angular.forEach(types_map, function(val, key) {
      if( type === key ) {
        res = val;
        return;
      }
    });
    return res;
  }

  $scope.open = function(type) {
    // Get the filter data
    var data = get_type_data(type);
    console.debug('open("' + type + '")', data);
    if( data === null ) {
      console.error('Received bad filter type');
      return;
    }
    // Re-inject the name of the filter
    data.name = type;
    // Inject the global filter value
    data.model = $scope.filter[data.name];
    // Set up the $modal parameters
    var modalInstance = $modal.open({
      // Use a general template
      templateUrl: 'enrollment-filter',
      // Pass in parameters to the modal
      resolve: {
        data: function(){ return data; },
        Filter: function() { return Filter; }
      },
      // Modal controller
      controller: function($scope, $modalInstance, data, Filter) {
        $scope.data = data;
        $scope.filter = Filter;
        // OK, accept button callback (store state)
        $scope.ok = function() {
          console.debug('Modal closed', $scope.data);
          $modalInstance.close($scope.data);
        };
        // Cancel, exit button callback (no action)
        $scope.cancel = function() {
          console.debug('Modal cancelled', $scope.data);
          $modalInstance.dismiss('cancel');
        };
      }
    });
    // Modal close callback
    modalInstance.result.then(function(data) {
      console.debug('Modal closed callback', data);
      $scope.filter[data.name] = data.model;
    });
  };
}
