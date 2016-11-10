app.controller('FilterCtrl', [
  '$scope',
  '$modal',
  'Filter',
  FilterCtrl]);

function FilterCtrl($scope, $modal, Filter) {
  $scope.filter = Filter;

  var types_map = {
    'enrollment': {
      'type': 'dropdown',
      'items': [
        { id: 1, name: 'Small (less than 2500)'},
        { id: 2, name: 'Medium (2501 - 10,000)'},
        { id: 3, name: 'Large (10,000 or more)'},
      ]
    }
  };

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


app.controller('EnrollmentFilter', [
  '$scope',
  '$modal',
  'Filter',
  EnrollmentFilter]);

function EnrollmentFilter($scope, $modal, Filter) {
	$scope.open = open;

  function open(size, backdrop, closeOnClick) {
    $scope.filter = Filter;
    $scope.enrollments = [
      { id: 1, name: 'Small (less than 2500)'},
      { id: 2, name: 'Medium (2501 - 10,000)'},
      { id: 3, name: 'Large (10,000 or more)'},
    ];

    var params = {
      templateUrl: 'enrollment-filter',
      resolve: {
        enrollments: function(){
          return $scope.enrollments;
        },
        Filter: function() {
          return Filter;
        }
      },
      controller: function($scope, $modalInstance, enrollments, Filter) {
        $scope.enrollments = enrollments;
        $scope.filter = Filter;

        $scope.reposition = function() {
          $modalInstance.reposition();
        };

        $scope.ok = function() {
          $modalInstance.close($scope.filter);
        };

        $scope.cancel = function() {
          $modalInstance.dismiss('cancel');
          $scope.filter.enrollment = '';
          return $scope.enrollments;
        };

        $scope.openNested = function() {
          open();
        };
      }
    };

    if(angular.isDefined(closeOnClick)){
      params.closeOnClick = closeOnClick;
    }

    if(angular.isDefined(size)){
      params.size = size;
    }

    if(angular.isDefined(backdrop)){
      params.backdrop = backdrop;
    }

    var modalInstance = $modal.open(params);

    modalInstance.result.then(function(filter) {
      $scope.filter = filter;
    });
  }
}
