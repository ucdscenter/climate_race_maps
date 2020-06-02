async function wrapper(){

	var dformat = d3.format('.3f')
	var pformat = d3.format('.2%')
  var mformat = d3.format('$.3s')
  let zipcode_geojson = {
    type : "FeatureCollection",
    features : []
  }
	//var	zipcode_geojson = 
  for(var i = 0; i < zip_geo_path.length; i++){
    let state_geo = await d3.json(zip_geo_path[i]);
    zipcode_geojson.features.push(...state_geo.features)
  }


	var climate_zipcodes = await d3.csv('data/JK2014-zip-code-results.csv')
  let race_zipcodes = []
  for(var i = 0; i < zip_geo_path.length; i++){
	 var state_demo_zipcodes = await d3.csv(race_data_path[i])
   race_zipcodes.push(...state_demo_zipcodes)
  }


  let x_val = decodeURIComponent(window.location.search.split("&")[0].split("=")[1])
  let y_val = decodeURIComponent(window.location.search.split("&")[1].split("=")[1])


	$('#loading-div').addClass("hidden")

  if (y_val == 'percent_white'){
    d3.select("#descriptive-y-axis").text("% of zipcode population that is not white:")
  }
  else{
    d3.select("#descriptive-y-axis").text("Median household income:")
  }

  d3.select("#descriptive-x-axis").text(x_val)
	
	
	var zipobj = {}
	race_zipcodes.forEach(function(d, i){

		d.zip = d.Name.split(",")[0]
		d.percent_white = dformat(d[white_pop_column]/d[total_pop_column]) + " "
    d.median_household_income = parseInt(d["Median Household Income, 2014"])
		zipobj[d.zip] = [i]
	})
	var thing = 0
	climate_zipcodes = climate_zipcodes.filter(function(d, i){
		
		if(zipobj[d.ZipCode] != undefined){
			/*console.log(d)
			Object.keys(d).forEach(function(k){
				let newname = k
				newname.replace(/"/g, "")
				newname.trim()

			})*/
			zipobj[d.ZipCode].push(thing)
			thing++
			return true
		}
		return false
	})
	var thing2 = 0
	zipcode_geojson.features = zipcode_geojson.features.filter(function(d, i ){

		
		if (zipobj[d.properties.ZCTA5CE10] != undefined){
			zipobj[d.properties.ZCTA5CE10].push(thing2);
			thing2++;
			return true
		}
		return false
	})

	Object.values(zipobj).forEach(function(d){
		if(d.length == 3){
		zipcode_geojson.features[d[2]].properties.raceobj = race_zipcodes[d[0]]
		zipcode_geojson.features[d[2]].properties.co2obj = climate_zipcodes[d[1]]
		}
	})

	zipcode_geojson.features = zipcode_geojson.features.filter(function(d, i ){
		if (d.properties.co2obj == undefined || d.properties.raceobj == undefined){
			return false
		}
		return true
	})

let dataset = 'co2obj'
let column = x_val
var colExt = d3.extent(zipcode_geojson.features.map(function(x){if(x.properties[dataset] != undefined){
				return parseFloat(x.properties[dataset][column].trim().replace(/,/g,''))}
}))


d3.select('#min_val').text(colExt[0])
d3.select('#max_val').text(colExt[1])
var raceExt = d3.extent(zipcode_geojson.features.map(function(x){

  if (x.properties.raceobj != undefined){
    if (y_val == "percent_white"){
      return (1 - x.properties.raceobj[y_val])
    }
    else{
      return x.properties.raceobj[y_val];
    }
    
}
}))
let heightScale = d3.scaleLinear().domain(colExt).range([10, 10000])

let center_circles = {
	type: "FeatureCollection", 
	features: [],
}
zipcode_geojson.features.forEach(function(f){
	let point = turf.centroid(f)
	var options = {steps: 10, units: 'kilometers', properties: f.properties}
	let circle = turf.circle(point.geometry.coordinates, .5, options)
	center_circles.features.push(circle)
})

const mapboxAccessToken = 'pk.eyJ1IjoiZXpyYWVkZ2VydG9uIiwiYSI6ImNrNndpeTJ4eDA2NDEzbm52NG5jeTAyeDAifQ.IaHIVaAkQ_dEGVBtoSA9xw'
const COLOR_SCALE = [
  // negative
  [65, 182, 196],
  [127, 205, 187],
  [199, 233, 180],
  [237, 248, 177],

  // positive
  [255, 255, 204],
  [255, 237, 160],
  [254, 217, 118],
  [254, 178, 76],
  [253, 141, 60],
  [252, 78, 42],
  [227, 26, 28],
  [189, 0, 38],
  [128, 0, 38]
];

const zipshapegeojsonLayer = new deck.GeoJsonLayer({
  data: zipcode_geojson,
  opacity: .5,
  stroked: true,
  filled: true,
  extruded: true,
  wireframe: true,
  fp64: true,

  getElevation: function(f){
  	return 0
  } ,
  lineWidthScale: 5,
  getFillColor: function(d){
    if (y_val == "percent_white"){
     return colorScale(1 - d.properties.raceobj[y_val])
    }
    else{
      return colorScale(d.properties.raceobj[y_val]);
    }
    },
  getLineColor: f => [0, 0, 0],

  pickable: true
});


const zipcountgeojsonLayer = new deck.GeoJsonLayer({
  data: center_circles,
  opacity: .8,
  stroked: true,
  filled: true,
  extruded: true,
  wireframe: true,
  fp64: true,

  getElevation: function(f){
    return heightScale(parseFloat(f.properties.co2obj[x_val].trim()))
  } ,
  getRadius: 1000,
  getFillColor: function(d){
    if (y_val == "percent_white"){
     return colorScale(1 - d.properties.raceobj[y_val])
    }
    else{
      return colorScale(d.properties.raceobj[y_val]);
    }
    },
  getLineColor: f => [0, 0, 0],

  pickable: true
});

new deck.DeckGL({
  mapboxApiAccessToken: mapboxAccessToken,
  mapStyle: 'mapbox://styles/mapbox/light-v9',
  initialViewState: {
    latitude: viewloc[0],
    longitude: viewloc[1],
    zoom: 8,
    maxZoom: 16,
    pitch: 45
  },
  controller: true,
  layers: [zipshapegeojsonLayer, zipcountgeojsonLayer],
  getTooltip
});

function colorScale(x) {
   if (isNaN(x) == true){
    return [50, 50, 50]
   }
  if (y_val == 'percent_white'){

    const i = Math.round(x * 7) + 4;

    if (x < 0) {
      return COLOR_SCALE[i] || COLOR_SCALE[0];
    }
    return COLOR_SCALE[i] || COLOR_SCALE[COLOR_SCALE.length - 1];
  }
  else{
    const i = Math.round((x - raceExt[0])/(raceExt[1] - raceExt[0]) * 7) + 4;
    if (x < 0) {
      return COLOR_SCALE[i] || COLOR_SCALE[0];
    }
    return COLOR_SCALE[i] || COLOR_SCALE[COLOR_SCALE.length - 1];

  }
  
}
function heighttooltipdecider(object){
  return x_val + ": " + object.properties.co2obj[x_val]
}

function tooltipdecider(object){
  let heightthing = 0
  if (y_val == 'percent_white'){
    heightthing = pformat( 1 - object.properties.raceobj[y_val])
  
   return "Percent of Non-White Population " + heightthing
 }
  else{
    heightthing = mformat(object.properties.raceobj[y_val])
    return "Median Household Income " + heightthing;
  }
 
};

function legenddecider(thing){
  let heightthing = ''
  if (y_val == 'percent_white'){
    heightthing = pformat( 1 - thing) + ' white<br>'
  }
  else{
    heightthing = mformat(thing)
  }
  return heightthing + '<br>'
}

function getTooltip({object}) {

 
	return object && `Zip Code ${object.properties.co2obj.ZipCode}
	${heighttooltipdecider(object)}
	 ${tooltipdecider(object)}`
}


function renderColorLegend(){

  function componentToHex(c) {
      var hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
  }

  function rgbToHex(r, g, b) {
      return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
  }
  var numBoxes = 9
  let diff = raceExt[1] - raceExt[0]
  let interval = diff/numBoxes
  
  var grades = [];
    var labels = [];

    
    var stylstr = "% nonwhite"
    var shittyfix = 0
    let tformat = dformat
    if(dataset == 'raceobj'){
      stylstr = '%'
      tformat = pformat
    } 
    else {
      tformat = dformat
    }

    for(var i = 0; i < numBoxes + 1; i++){
      grades.push(raceExt[0] + (interval * i))
    }
    var div = document.getElementById("color-legend")
  // loop through our density intervals and generate a label with a colored square for each interval
  for (var i = 0; i < grades.length; i++) {
    var gradecolor;
    if (y_val == 'percent_white'){
      gradecolor = colorScale(parseFloat(grades[i])/ raceExt[1])
    }
    else{
      gradecolor = colorScale(parseFloat(grades[i]))
    }
    div.innerHTML +=
    ' <i style="background-color:' + rgbToHex(gradecolor[0], gradecolor[1], gradecolor[2]) + '; height:12px; width:12px"></i> ' + legenddecider(grades[i]);
  }
}//renderColorLegend
renderColorLegend()

}//wrapper

wrapper()	