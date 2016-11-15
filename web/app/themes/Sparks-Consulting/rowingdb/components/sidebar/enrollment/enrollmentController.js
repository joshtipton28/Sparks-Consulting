app.controller('FilterCtrl', [
  '$scope',
  '$modal',
  '$http',
  'Filter',
  FilterCtrl]);

function FilterCtrl($scope, $modal, $http, Filter) {
  $scope.filter = Filter;

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

  // programTypeMen filter
  $scope.programTypeWomen = function(item) {
    return item.startsWith('Women');
  };
  $scope.programTypeMen = function(item) {
    return item.startsWith('Men');
  };

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
    data.model = $scope.filter.filters[data.name];
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
        $scope.filters = Filter.filters;
        // OK, accept button callback (store state)
        $scope.ok = function() {
          console.debug('Modal closed', $scope.data);
          $modalInstance.close($scope.data);
        };
        // Cancel, exit button callback (no action)
        $scope.cancel = function() {
          console.debug('Modal cancelled', $scope.data);
          $scope.filters[$scope.data.name] = null;
          $modalInstance.dismiss('cancel');
        };
      }
    });
    // Modal close callback
    modalInstance.result.then(function(data) {
      console.debug('Modal closed callback', data);
      $scope.filter.filters[data.name] = data.model;

      if( data.type === 'location' && data.model && data.model.zip ) {
        $http.get('https://maps.googleapis.com/maps/api/geocode/json?' +
                  'key=AIzaSyDO7gncwOeigq77yzyzSREllCQic3-oC2o&' +
                  'address=' + data.model.zip
        ).then(function(res) {
          $scope.filter.filters[data.name].position = [
            res.data.results[0].geometry.location.lat,
            res.data.results[0].geometry.location.lng
          ];
        }, function(res) {
          console.error('Error getting coordinates for Zip code', res);
        });
      }
    });
  };
}
