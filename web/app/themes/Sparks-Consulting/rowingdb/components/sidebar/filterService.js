app.factory('Filter', ['$filter', function($filter) {
  function get_item_by_name(data, name) {
    var res = null;
    angular.forEach(data.items, function(val) {
      if( name === val.name  ) {
        res = val;
        return;
      }
    });
    return res;
  }

  function generic_multi_name_render(names) {
    return names.join(', ');
  }

  function generic_name_filter(self, val, spec) {
    if( spec !== val )
      return false;
    return true;
  }

  function generic_multi_name_filter(self, names, specs) {
    var ret = {val: true};
    if( names === null )
      names = [];
    if( !angular.isArray(names) )
      names = [names];
    if( angular.isArray(specs) && angular.isArray(names) )
      angular.forEach(specs, function(spec) {
        angular.forEach(names, function(name) {
          if( name !== spec ) {
            this.val = false;
            return;
          }
        }, ret);
      }, ret);
    return ret.val;
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
    states: states,
    // List column specifiers
		priority: ["enrollment_count", "tuition", "location"],
    // Actual list filter
    filters: {},
    // Filters and priorities data and helpers
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
        "render_text": function(val) {
          return $filter('number')(val);
        },
        "filter": function(self, val, spec) {
          var item = get_item_by_name(self, spec);
          if( isNaN(val) || !item ) return false;
          // Filter
          if( item.id === 1 && val >= 2500 )
            return false;
          if( item.id === 2 && (val < 2500 || val >= 10000) )
            return false;
          if( item.id === 3 && val < 10000 )
            return false;
          return true;
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
        "render_text": function(val) {
          if( isNaN(val) || !val )
            return 'Full Scholarship';
          return $filter('currency')(val);
        },
        "filter": function(self, val, spec) {
          var item = get_item_by_name(self, spec);
          if( isNaN(val) || !item ) return false;
          // Filter
          if( item.id === 1 && val >= 10000 )
            return false;
          if( item.id === 2 && (val < 10000 || val >= 25000) )
            return false;
          if( item.id === 3 && (val < 25000 || val >= 40000) )
            return false;
          if( item.id === 4 && val < 40000 )
            return false;
          return true;
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
        "render_text": function(val) {
          return $filter('number')(val);
        },
        "filter": function(self, val, spec) {
          var item = get_item_by_name(self, spec);
          if( isNaN(val) || !item ) return false;
          // Filter
          if( item.id === 1 && val < 95 )
            return false;
          if( item.id === 2 && val < 90 )
            return false;
          if( item.id === 3 && val < 85 )
            return false;
          if( item.id === 4 && val < 75 )
            return false;
          if( item.id === 5 && val < 60 )
            return false;
          return true;
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
        "render_text": function(val) {
          if( !isNaN(val) )
            return val + ':1';
          return '';
        },
        "filter": function(self, val, spec) {
          var item = get_item_by_name(self, spec);
          if( isNaN(val) || !item ) return false;
          // Filter
          if( item.id === 1 && val >= 8 )
            return false;
          if( item.id === 2 && (val < 8 || val >= 11) )
            return false;
          if( item.id === 3 && (val < 11 || val >= 14) )
            return false;
          if( item.id === 4 && val < 14 )
            return false;
          return true;
        }
      },
      "environment": {
        "type": "dropdown",
        "title": "Environment",
        "content": "Prefer the city? Maybe you need to be around the woods. Select an environment you'd like to goto school in.",
        "filter": generic_name_filter
      },
      "selectivity": {
        "type": "checklist",
        "title": "Selectivity",
        "content": "Select a level of selectivity - keep in mind more selective schools are not necessarily better.",
        "items": [{
          "id": 1,
          "name": "Most Selective"
        }, {
          "id": 2,
          "name": "More Selective"
        }, {
          "id": 3,
          "name": "Selective"
        }, {
          "id": 4,
          "name": "Less Selective"
        }],
        "filter": generic_name_filter
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
        "render_text": function(val) {
          return $filter('number')(val) + '%';
        },
        "filter": function(self, val, spec) {
          var item = get_item_by_name(self, spec);
          if( isNaN(val) || !item ) return false;
          // Filter
          if( item.id === 1 && val >= 70 )
            return false;
          if( item.id === 2 && (val < 70 || val >= 80) )
            return false;
          if( item.id === 3 && (val < 80 || val >= 90) )
            return false;
          if( item.id === 4 && val < 90 )
            return false;
          return true;
        }
      },
      "school_privacy": {
        "type": "dropdown",
        "title": "Private/Public",
        "content": "Please make a selection.",
        "filter": generic_name_filter
      },
      "religion": {
        "type": "checklist",
        "title": "Religious Affiliation",
        "content": "Please make a selection. Religious Affiliation doesn't exclude folks of different faiths, but is based in what faith the school was founded upon.",
        "items": [{
          "id": 1,
          "name": "Free Methodist"
        }, {
          "id": 2,
          "name": "Jesuit"
        }, {
          "id": 3,
          "name": "Lutheran"
        }, {
          "id": 4,
          "name": "Methodist"
        }, {
          "id": 5,
          "name": "Presbyterian"
        }, {
          "id": 6,
          "name": "Roman Catholic"
        }, {
          "id": 7,
          "name": "None"
        }, {
          "id": 8,
          "name": "Catholic"
        }],
        "filter": generic_name_filter
      },
      "food_services": {
        "type": "checklist",
        "title": "Food Service",
        "content": "Make a selection of as many (or as few) options as you'd like.",
        "items": [{
          "id": 1,
          "name": "Dining Hall(s)"
        }, {
          "id": 2,
          "name": "In-dorm"
        }, {
          "id": 3,
          "name": "On Campus Restaurants"
        }],
        "render_text": generic_multi_name_render,
        "filter": generic_multi_name_filter
      },
      "housing_types": {
        "type": "checklist",
        "title": "Housing, Types",
        "content": "Make a selection of as many (or as few) options as you'd like.",
        "items": [{
          "id": 1,
          "name": "Dorms"
        }, {
          "id": 2,
          "name": "Apartments"
        }, {
          "id": 3,
          "name": "Greek"
        }],
        "render_text": generic_multi_name_render,
        "filter": generic_multi_name_filter
      },
      "housing_sub_types": {
        "type": "checklist",
        "title": "Housing, Sub-types",
        "content": "Make a selection of as many (or as few) options as you'd like.",
        "items": [{
          "id": 1,
          "name": "Co-ed"
        }, {
          "id": 2,
          "name": "Male"
        }, {
          "id": 3,
          "name": "Female"
        }, {
          "id": 4,
          "name": "Disabled"
        }, {
          "id": 5,
          "name": "International"
        }, {
          "id": 6,
          "name": "Substance Free"
        }],
        "render_text": generic_multi_name_render,
        "filter": generic_multi_name_filter
      },
      "housing_alcohol": {
        "type": "dropdown",
        "title": "Housing, Alcohol",
        "content": "Make a selection - this information is based on school policy, though the reality can vary.",
        "filter": generic_name_filter
      },
      "location": {
        "type": "zip_distance",
        "title": "Location",
        "content": "Please enter a location.",
        "items": [25, 50, 100, 300, 750, 1500, 3000, 7000]
      }
    },
    "normalizeCollege": function(college) {
      college.norm = {};
      // Normalize and isolate data
      // Normalize from string
      angular.forEach([
        'tuition', 'enrollment_count', 'financial_aid_score',
        'academic_intensity', 'st_ratio', 'school_privacy'
      ], function(cat) {
        var val = parseInt(college.acf[cat]);
        if( isNaN(val) )
          college.norm[cat] = null;
        else college.norm[cat] = val;
      });
      // Normalize from object (value key)
      angular.forEach([
        'environment', 'selectivity', 'religion'
      ], function(cat) {
        if( college.acf[cat] && college.acf[cat].hasOwnProperty('label') )
          college.norm[cat] = college.acf[cat].label;
        else college.norm[cat] = null;
      });
      // Normalize from "string array...ish"
      angular.forEach([
        'housing_types', 'housing_sub_types', 'food_services',
      ], function(cat) {
        college.norm[cat] = [];
        angular.forEach(college.acf[cat], function(val) {
          college.norm[cat].push(val.label);
        });
        if( college.norm[cat].length <= 0 )
          college.norm[cat] = null;
      });
      // Normalize school_privacy
      if( college.norm.school_privacy === 1 )
        college.norm.school_privacy = 'Public';
      else if( college.norm.school_privacy === 2 )
        college.norm.school_privacy = 'Private';
      else college.norm.school_privacy = null;
      // Normalize location
      college.norm.location = college.acf.school_city + ', ' + college.acf.school_state;
      // Copy housing_alcohol
      college.norm.housing_alcohol = college.acf.housing_alcohol;
      // Create LatLng position for map
      college.norm.position = null;
      if( college.acf.latitude && college.acf.longitude ) {
        var lat = parseFloat(college.acf.latitude);
        var lng = parseFloat(college.acf.longitude);
        if( !isNaN(lat) && !isNaN(lng) )
          college.norm.position = [lat, lng];
      }
      return college;
    }
	};
}]);
