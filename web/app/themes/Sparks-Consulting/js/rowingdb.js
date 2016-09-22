var App = Vue.extend({});

	var getColleges = '/wp-json/wp/v2/schools-api?filter[posts_per_page]=9999';

	var colleges = {
		data: function(){

			this.$http.get(getColleges).then(function(colleges){
       		this.$set('colleges', colleges.data);
		    });

			return {
				colleges: '',
				religionFilter: [],
				view: {
					toggle: 1
				}
			}
		},
	};

	var schoolFilter = Vue.extend({
		template: '#school-filter-template',
		data: colleges.data,
	});

	var schoolTable = Vue.extend({
		template: '#school-filter-template',
		data: colleges.data,
	});

	//Number Format - Adds comma to proper place in numbers
	Vue.filter('numberFormat', function (value) {
	  return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
	})

	//Routes
	var router = new VueRouter();

	router.map({
		'/':{
			component: schoolFilter
		},
		'/listing':{
			component: schoolTable
		}
	});

	router.start(App, '#app')