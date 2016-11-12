app.config(function($stateProvider, $urlRouterProvider, $locationProvider) {
	$locationProvider.html5Mode(true);

	$stateProvider.state('home',{
		url: '/',
		templateUrl: stylesheet_directory_uri + '/rowingdb/components/main/main.php',
		controller: 'MainController as first'
	});

	$stateProvider.state('listing',{
		url: '/listing',
		templateUrl: stylesheet_directory_uri + '/rowingdb/components/listing/listing.php',
		controller: 'MainController'
	});

  $stateProvider.state('college',{
		url: '/rowing-teams/:collegeId',
		templateUrl: stylesheet_directory_uri + '/rowingdb/components/college-single/college-single.php',
		controller: 'MainController'
	});
});
