async function wrapper(){


	d3.selection.prototype.moveToFront = function() {
  		return this.each(function(){
    		this.parentNode.appendChild(this);
  		});
	};
	var dformat = d3.format('.3f')
	var pformat = d3.format('.2%')
	const mapboxAccessToken = 'pk.eyJ1IjoiZXpyYWVkZ2VydG9uIiwiYSI6ImNrNndpeTJ4eDA2NDEzbm52NG5jeTAyeDAifQ.IaHIVaAkQ_dEGVBtoSA9xw'

	var	zipcode_geojson = await d3.json(zip_geo_path)
	var climate_zipcodes = await d3.csv('data/JK2014-zip-code-results.csv')
	var race_zipcodes = await d3.csv(race_data_path)

	$('#loading-div').addClass("hidden")
	
	
	var zipobj = {}
	race_zipcodes.forEach(function(d, i){

		d.zip = d.Name.split(",")[0]
		d.percent_white = dformat(d[white_pop_column]/d[total_pop_column]) + " "
		zipobj[d.zip] = [i]
	})
	var thing = 0
	climate_zipcodes = climate_zipcodes.filter(function(d, i){
		
		if(zipobj[d.ZipCode] != undefined){
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
	console.log(zipcode_geojson)
	console.log(climate_zipcodes)
	console.log(zipobj)

	Object.values(zipobj).forEach(function(d){
		if(d.length == 3){
		zipcode_geojson.features[d[2]].properties.raceobj = race_zipcodes[d[0]]
		zipcode_geojson.features[d[2]].properties.co2obj = climate_zipcodes[d[1]]
		}
	})


	function doLabels(id, dataset, column){
			if (dataset == ''){
				georgia_counties_header.forEach(function(c){
					if (column == c.GEO_ID){
						//d3.select("#" + id + "-label").text(c.id)
						d3.select('#' + id + "-label").text("% of white population") 
					}
				})
			}
			else{
				d3.select("#" + id + "-label").text(column)
			}
		}
	function doMap(id, dataset, column, geoobj){
		doLabels(id, dataset, column)
		console.log(geoobj)

		var colExt = d3.extent(geoobj.features.map(function(x){if(x.properties[dataset] != undefined){
				return parseFloat(x.properties[dataset][column].trim().replace(/,/g,''))}
		}))
		
		console.log(colExt)
		let stdevColorRange = d3.scaleLinear().domain(colExt).range([0,1])
		let thingmap = {}
		function style(d){
			return {fillColor: getColor(d.properties[dataset]),
	        	weight: 1,
	        	opacity: 1,
	        	color: 'white',
	        	fillOpacity: 0.7,
	        	className: 'z' + d.properties.ZCTA5CE10
			}}

		let colorInterpolator = d3.interpolatePurples
		if (dataset != 'co2obj'){
			colorInterpolator = d3.interpolateOranges
		}
		function getColor(d, legend=false) {	
			if (d == undefined){ return '#d3d3d3'}
			else if(legend){
				//return colorInterpolator(1 - (stdevColorRange((d - mean) / stdev)))
				console.log(d)
				console.log(dataset)
				return colorInterpolator(stdevColorRange(d))
			}
			else{
				//return colorInterpolator(1 - (stdevColorRange((d[column] - mean) / stdev)))
				//console.log(typeof(d[column]))
				
				let cleanedD = parseFloat(d[column].trim().replace(/,/g,''))
				return colorInterpolator(stdevColorRange(cleanedD))
			}
		}

		d3.select('#'+ id +'-div').style("height", '600px')
		var map = L.map(id).setView(viewloc, viewz);
		L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=' + mapboxAccessToken, {
		    id: 'mapbox/light-v9',
		    attribution: "Map from: <a href='https://eric.clst.org/tech/usgeojson/'>EricTech</a>, Data from: Stamford, <a href='https://data.census.gov/cedsci/table?q=Ohio%20Race%20and%20Ethnicity&tid=ACSDP1Y2018.DP05&t=Race%20and%20Ethnicity&hidePreview=true&layer=state&tp=false&g=0400000US39'>us census data</a>, race percentages based on ACS 2014 5 year estimates.", 
		    tileSize: 512,
		    zoomOffset: -1
		}).addTo(map);



		function highlightFeature(e) {
		    var layer = e.target;
		    //console.log(e.target)
		   /* layer.setStyle({
		        weight: 1,
		        color: '#666',
		        fillOpacity: 0.9
		    });*/

		    if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
		        layer.bringToFront();
		    }
		    $('.z' + e.target.feature.properties.ZCTA5CE10).trigger("mouseover")
		   d3.selectAll('.z' + e.target.feature.properties.ZCTA5CE10).style("stroke-width", 1).style("stroke", 'black').style("opacity", .9).moveToFront()

		    //info.update(layer.feature.properties);
		}

		function resetHighlight(e) {
			d3.selectAll('.z' + e.target.feature.properties.ZCTA5CE10).style("stroke-width", 1).style("stroke", 'white').style("opacity", .9)
    		//georgia.resetStyle(e.target);
    		//info.update();
		}

		function zoomToFeature(e) {
    		map.fitBounds(e.target.getBounds());
		}

		function onEachFeature(feature, layer) {
    		layer.on({
        		mouseover: highlightFeature,
        		mouseout: resetHighlight,
        		/*click: zoomToFeature*/
    		});
    		layer.county = feature.properties.NAME
		}
		var co2_label
		if (co2_column.split('(').length > 1){
			co2_label = co2_column.split('(')[1].split(')')[0]
		}
		else{
			co2_label = co2_column.slice(0,2)
		}
		console.log(co2_label)

		
		let georgia = L.geoJson(geoobj, {style: style, onEachFeature: onEachFeature})
						.bindTooltip(function (layer) {
							var value
							if(dataset == 'raceobj'){
								value = pformat(layer.feature.properties.raceobj[column]) + "% white || " + layer.feature.properties.co2obj[co2_column] + co2_label
							}
							else{
								value = pformat(layer.feature.properties.raceobj[white_column]) + "% white || " + layer.feature.properties.co2obj[column] + co2_label
							}
    						return layer.feature.properties.ZCTA5CE10 + ": " + value;
						})

		 georgia.addTo(map);

		var legend = L.control({position: 'bottomright'});

		legend.onAdd = function (map) {

			var numBoxes = 6
		console.log(colExt)
		let diff = colExt[1] - colExt[0]
		let interval = diff/numBoxes
    	
    	var grades = [];
        var	labels = [];

        
        var stylstr = co2_label
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
        	grades.push(colExt[0] + (interval * i))
        }
        var div = L.DomUtil.create('div', 'info legend')
    	// loop through our density intervals and generate a label with a colored square for each interval
    	for (var i = 0; i < grades.length; i++) {
        	div.innerHTML +=
        	'	<i style="background:' + getColor(grades[i], legend=true) + '"></i> ' +
        	tformat(grades[i]) +' '+  stylstr + '<br>'
    	}

    	return div;
		};

		legend.addTo(map);
			
		/*map.dragging.disable();
		map.touchZoom.disable();
		map.doubleClickZoom.disable();
		map.scrollWheelZoom.disable();*/
		return map;
	}//doMap

	rmCols = ['Population', 'State', 'County', ' Households ']
Object.keys(climate_zipcodes[0]).forEach(function(d){
	var included = true
	rmCols.forEach(function(rm){
		if( d == rm){
			included = false
		}
	})
	if (included){
		d3.select("#co2-col-select").append("option").attr("value", d).text(d)
	}
})

let co2_column = " Total Household Carbon Footprint (tCO2e/yr) "

d3.select('#co2-col-select').on("change", function(d){
	co2_column = d3.select(this).property('value')
	renderMaps()
});

$('#co2-col-select')
    .val(co2_column)
    .trigger('change');
renderMaps()
	
function renderMaps(){
	d3.select('#map-1').remove()
	d3.select('#map-2').remove()
	d3.select('#map-1-label').text(co2_column)
	d3.select('#map-1-div').append("div").attr("id", 'map-1')
	d3.select('#map-2-div').append("div").attr("id", 'map-2')

	doMap('map-1', 'co2obj', co2_column, zipcode_geojson)
	doMap('map-2', 'raceobj', white_column, zipcode_geojson)
}
	
}

wrapper()