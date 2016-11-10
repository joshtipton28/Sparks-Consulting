app.factory('Filter', ['$filter', function($filter) {
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

	return {
		priority: ["", "", ""],
    types_map: {
      "enrollment_count": {
        "type": "dropdown",
        "title": "Enrollment",
        "content": "Select the size of school you're interested in. Numbers pertain to undergraduate enrollment.",
        "items": [{
          "id": 1,
          "name": "Small (less than 2500)"
        }, {
          "id": 2,
          "name": "Medium (2500 - 10,000)"
        }, {
          "id": 3,
          "name": "Large (10,000 or more)"
        }],
        "render_text": function(acf_text, data) {
          return $filter('number')(acf_text);
        }
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
        }],
        "render_text": function(acf_text, data) {
          var tuition = parseInt(acf_text);
          if( isNaN(tuition) || !tuition )
            return 'Full Scholarship';
          return $filter('currency')(acf_text);
        }
      },
      "financial_aid_score": {
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
      "st_ratio": {
        "type": "dropdown",
        "title": "Classroom Ratio",
        "content": "Select the type of relationship you'd like to have with professors.",
        "items": [{
          "id": 1,
          "name": "Intimate (smaller than 8:1)"
        }, {
          "id": 2,
          "name": "Close (8:1 - 11:1)"
        }, {
          "id": 3,
          "name": "Decent (11:1 - 14:1)"
        }, {
          "id": 4,
          "name": "Average (14:1 or larger)"
        }],
        "render_text": function(acf_text, data) {
          count = parseInt(acf_text);
          if( !isNaN(count) )
            return count + ':1';
          return acf_text;
        }
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
        }],
        "render_text": function(acf_text, data) {
          count = parseInt(acf_text);
          if( !isNaN(count) ) {
            item = get_item_by_id(data, count);
            if( item )
              return item.name;
          }
          return acf_text;
        }
      },
      "academic_intensity": {
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
      "school_privacy": {
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
      "housing_alcohol": {
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
    }
	};
}]);
