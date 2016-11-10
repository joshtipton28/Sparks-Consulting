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
      templateUrl: data.name + '-filter',
      resolve: {
        data: function(){ return data; },
        Filter: function() { return Filter; }
      },
      controller: function($scope, $modalInstance, data, Filter) {
        $scope.data = data;
        $scope.filter = Filter;

        $scope.ok = function() {
          console.debug('Modal closed', $scope.data);
          $modalInstance.close($scope.data);
        };
        $scope.cancel = function() {
          console.debug('Modal cancelled', $scope.data);
          $modalInstance.dismiss('cancel');
        };
      }
    });

    modalInstance.result.then(function(data) {
      console.debug('Modal closed callback', data);
      $scope.filter[data.name] = data.model;
    });
  };
}
