'use strict'

const CITY_INFO = {

	'atlanta' : {
		'name' : 'Atlanta',
		'stateIndex' : '13',
		'stateInitials' : ['GA'],
		'zip_geo_path' : ['data/geojson_zip_codes/ga_georgia_zip_codes_geo.min.json'],
		'viewloc' : [33.7, -84.5],
		'viewz' : 10,
		'city_msa_file' : 'zcta_within_msas/atlanta.csv'
	},
	'boston' : {
		'name' : 'Boston',
		'stateIndex' : '13',
		'stateInitials' : ['MA', 'NH'],
		'zip_geo_path' : ['data/geojson_zip_codes/ma_massachusetts_zip_codes_geo.min.json', 'data/geojson_zip_codes/nh_new_hampshire_zip_codes_geo.min.json',],
		'viewloc' : [42.4, -71.1],
		'viewz' : 10,
		'city_msa_file' : 'zcta_within_msas/boston.csv'
	},
	'chicago' : {
		'name' : 'Chicago',
		'stateIndex' : '13',
		'stateInitials' : ['IN', 'IL', 'WI'],
		'zip_geo_path' : ['data/geojson_zip_codes/in_indiana_zip_codes_geo.min.json', 'data/geojson_zip_codes/il_illinois_zip_codes_geo.min.json', 'data/geojson_zip_codes/wi_wisconsin_zip_codes_geo.min.json'],
		'viewloc' : [41.7, -87.5],
		'viewz' : 11,
		'city_msa_file' : 'zcta_within_msas/chicago.csv'
	},
	'cincinnati' : {
		'name' : 'Cincinnati',
		'stateIndex' : '39',
		'stateInitials' : ['OH', 'KY', 'IN'],
		'zip_geo_path' : ['data/geojson_zip_codes/oh_ohio_zip_codes_geo.min.json', 'data/geojson_zip_codes/in_indiana_zip_codes_geo.min.json', 'data/geojson_zip_codes/ky_kentucky_zip_codes_geo.min.json'],
		'viewloc' : [39.15, -84.5],
		'viewz' : 11,
		'city_msa_file' : 'zcta_within_msas/cincinnati.csv'
	},
	'cleveland' : {
		'name' : 'Cleveland',
		'stateIndex' : '13',
		'stateInitials' : ['OH'],
		'zip_geo_path' : ['data/geojson_zip_codes/oh_ohio_zip_codes_geo.min.json'],
		'viewloc' : [41.5, -81.7],
		'viewz' : 8,
		'city_msa_file' : 'zcta_within_msas/cleveland.csv'
	},
	'dallas' : {
		'name' : 'Dallas',
		'stateIndex' : '13',
		'stateInitials' : ['TX'],
		'zip_geo_path' : ['data/geojson_zip_codes/tx_texas_zip_codes_geo.min.json'],
		'viewloc' : [32.7, -96.8],
		'viewz' : 10,
		'city_msa_file' : 'zcta_within_msas/dallas.csv'
	},
	'denver' : {
		'name' : 'Denver',
		'stateIndex' : '13',
		'stateInitials' : ['CO'],
		'zip_geo_path' : ['data/geojson_zip_codes/co_colorado_zip_codes_geo.min.json'],
		'viewloc' : [39.7, -104.9],
		'viewz' : 10,
		'city_msa_file' : 'zcta_within_msas/denver.csv'
	},
	'houston' : {
		'name' : 'Houston',
		'stateIndex' : '13',
		'stateInitials' : ['TX'],
		'zip_geo_path' : ['data/geojson_zip_codes/tx_texas_zip_codes_geo.min.json'],
		'viewloc' : [29.7, -95.4],
		'viewz' : 10,
		'city_msa_file' : 'zcta_within_msas/houston.csv'
	},
	'los_angeles' : {
		'name' : 'Los Angeles',
		'stateIndex' : '13',
		'stateInitials' : ['CA'],
		'zip_geo_path' : ['data/geojson_zip_codes/ca_california_zip_codes_geo.min.json'],
		'viewloc' : [34.0, -118.2],
		'viewz' : 10,
		'city_msa_file' : 'zcta_within_msas/lost_angeles.csv'
	},
	'minneapolis' : {
		'name' : 'Minneapolis',
		'stateIndex' : '13',
		'stateInitials' : ['WI', 'MN'],
		'zip_geo_path' : ['data/geojson_zip_codes/wi_wisconsin_zip_codes_geo.min.json', 'data/geojson_zip_codes/mn_minnesota_zip_codes_geo.min.json'],
		'viewloc' : [44.9, -93.3],
		'viewz' : 10,
		'city_msa_file' : 'zcta_within_msas/minneapolis.csv'
	},
	'philadelphia' : {
		'name' : 'Philadelphia',
		'stateIndex' : '13',
		'stateInitials' : ['MD', 'DE', 'PA', 'NJ'],
		'zip_geo_path' : ['data/geojson_zip_codes/md_maryland_zip_codes_geo.min.json', 'data/geojson_zip_codes/de_delaware_zip_codes_geo.min.json', 'data/geojson_zip_codes/pa_pennsylvania_zip_codes_geo.min.json', 'data/geojson_zip_codes/nj_new_jersey_zip_codes_geo.min.json'],
		'viewloc' : [39.9, -75.2],
		'viewz' : 10,
		'city_msa_file' : 'zcta_within_msas/philadelphia.csv'
	},
	'portland' : {
		'name' : 'Portland',
		'stateIndex' : '13',
		'stateInitials' : ['OR', 'WA'],
		'zip_geo_path' : ['data/geojson_zip_codes/or_oregon_zip_codes_geo.min.json', 'data/geojson_zip_codes/wa_washington_zip_codes_geo.min.json'],
		'viewloc' : [45.5, -122.7],
		'viewz' : 10,
		'city_msa_file' : 'zcta_within_msas/portland.csv'
	},
	'st_louis' : {
		'name' : 'St. Louis',
		'stateIndex' : '13',
		'stateInitials' : ['IL', 'MO'],
		'zip_geo_path' : ['data/geojson_zip_codes/il_illinois_zip_codes_geo.min.json', 'data/geojson_zip_codes/mo_missouri_zip_codes_geo.min.json'],
		'viewloc' : [38.6, -90.2],
		'viewz' : 10,
		'city_msa_file' : 'zcta_within_msas/st_louis.csv'
	}


}

 function getJsonFromUrl(hashBased) {
    var query;
    if(hashBased) {
      var pos = location.href.indexOf("?");
      if(pos==-1) return [];
      query = location.href.substr(pos+1);
    } else {
      query = location.search.substr(1);
    }
    var result = {};
    query.split("&").forEach(function(part) {
      if(!part) return;
      part = part.split("+").join(" "); // replace every + with space, regexp-free version
      var eq = part.indexOf("=");
      var key = eq>-1 ? part.substr(0,eq) : part;
      var val = eq>-1 ? decodeURIComponent(part.substr(eq+1)) : "";
      var from = key.indexOf("[");
      if(from==-1) result[decodeURIComponent(key)] = val;
      else {
        var to = key.indexOf("]",from);
        var index = decodeURIComponent(key.substring(from+1,to));
        key = decodeURIComponent(key.substring(0,from));
        if(!result[key]) result[key] = [];
        if(!index) result[key].push(val);
        else result[key][index] = val;
      }
    });
    return result;
}



let urlparams = getJsonFromUrl(window.location.search)
console.log(urlparams)
	d3.select('#cityname').text(CITY_INFO[urlparams.city]['name'])

	const stateIndex = CITY_INFO[urlparams.city]['stateIndex']
	const stateInitials = CITY_INFO[urlparams.city]['stateInitials'];
	const race_data_path = []
	const zip_geo_path = CITY_INFO[urlparams.city]['zip_geo_path'];



	//const race_header_path = 'data/ohio_counties_t/ACSDP5Y2014.DP05_metadata_2020-02-28T140329.csv'

  const viewloc = CITY_INFO[urlparams.city]['viewloc']
	const viewz = CITY_INFO[urlparams.city]['viewz']
	const white_pop_column = "# White Population, Alone, 2014"
	const income_column = "Average Household Income, 2014"
	const total_pop_column = "# Population, 2014"
	const white_column = 'percent_white'
  const city_msa_file = CITY_INFO[urlparams.city]['city_msa_file']