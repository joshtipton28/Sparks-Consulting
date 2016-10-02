app.factory('CollegeFactory', ['$http', function ($http) {
    var promise = $http.get('http://dev.sparksconsult.com/wp-json/wp/v2/schools-api?filter[posts_per_page]=200');
    return {
        getData: function (callback) {
            promise.success(callback);
        }
    };
}])