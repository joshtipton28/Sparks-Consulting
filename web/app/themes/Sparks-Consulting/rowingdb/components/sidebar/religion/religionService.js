app.factory('ReligionFactory', ['$http', function ($http) {
    var promise = $http.get('http://plugin.dev/wp-json/wp/v2/religion');
    return {
        getData: function (callback) {
            promise.success(callback);
        }
    };
}])