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

  var states = {
    "alabama": "al",
    "alaska": "ak",
    "american samoa": "as",
    "arizona": "az",
    "arkansas": "ar",
    "california": "ca",
    "colorado": "co",
    "connecticut": "ct",
    "delaware": "de",
    "district of columbia": "dc",
    "federated states of micronesia": "fm",
    "florida": "fl",
    "georgia": "ga",
    "guam": "gu",
    "hawaii": "hi",
    "idaho": "id",
    "illinois": "il",
    "indiana": "in",
    "iowa": "ia",
    "kansas": "ks",
    "kentucky": "ky",
    "louisiana": "la",
    "maine": "me",
    "marshall islands": "mh",
    "maryland": "md",
    "massachusetts": "ma",
    "michigan": "mi",
    "minnesota": "mn",
    "mississippi": "ms",
    "missouri": "mo",
    "montana": "mt",
    "nebraska": "ne",
    "nevada": "nv",
    "new hampshire": "nh",
    "new jersey": "nj",
    "new mexico": "nm",
    "new york": "ny",
    "north carolina": "nc",
    "north dakota": "nd",
    "northern mariana islands": "mp",
    "ohio": "oh",
    "oklahoma": "ok",
    "oregon": "or",
    "palau": "pw",
    "pennsylvania": "pa",
    "puerto rico": "pr",
    "rhode island": "ri",
    "south carolina": "sc",
    "south dakota": "sd",
    "tennessee": "tn",
    "texas": "tx",
    "utah": "ut",
    "vermont": "vt",
    "virgin islands": "vi",
    "virginia": "va",
    "washington": "wa",
    "west virginia": "wv",
    "wisconsin": "wi",
    "wyoming": "wy"
  };

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
        "render_text": function(acf, data) {
          return $filter('number')(acf.enrollment_count);
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
        "render_text": function(acf, data) {
          var tuition = parseInt(acf.tuition);
          if( isNaN(tuition) || !tuition )
            return 'Full Scholarship';
          return $filter('currency')(acf.tuition);
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
        }],
        "render_text": function(acf, data) {
          return $filter('number')(acf.financial_aid_score);
        }
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
        "render_text": function(acf, data) {
          count = parseInt(acf.st_ratio);
          if( !isNaN(count) )
            return count + ':1';
          return acf.st_ratio;
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
        "render_text": function(acf, data) {
          var count = parseInt(acf.environment);
          if( !isNaN(count) ) {
            item = get_item_by_id(data, count);
            if( item )
              return item.name;
          }
          return acf.environment;
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
        }],
        "render_text": function(acf, data) {
          return $filter('number')(acf.academic_intensity) + '%';
        }
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
        }],
        "render_text": function(acf, data) {
          if( acf.school_privacy &&
              data.items.hasOwnProperty(acf.school_privacy) )
            return data.items[acf.school_privacy].name;
          return '';
        }
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
      },
      "location": {
        "type": "zip_distance",
        "title": "Location",
        "content": "Please enter a location.",
        "items": [25, 50, 100, 300, 750, 1500, 3000, 7000],
        "render_text": function(acf, data) {
          var state = (acf.school_state || '').toLowerCase();
          var sstr = acf.school_city + ', ';
          if( states.hasOwnProperty(state) )
            return sstr + states[state].toUpperCase();
          return sstr + acf.school_state;
        }
      }
    },
    "states": states
	};
}]);
