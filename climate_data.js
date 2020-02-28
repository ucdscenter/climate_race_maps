async function wrapper(){


	d3.selection.prototype.moveToFront = function() {
  		return this.each(function(){
    		this.parentNode.appendChild(this);
  		});
	};

	const mapboxAccessToken = 'pk.eyJ1IjoiZXpyYWVkZ2VydG9uIiwiYSI6ImNrNndpeTJ4eDA2NDEzbm52NG5jeTAyeDAifQ.IaHIVaAkQ_dEGVBtoSA9xw'

	var county_geojson = await d3.json("data/gz_2010_us_050_00_500k.json")
	var climate_counties = await d3.csv('data/JK2014-County-results.csv')
	var georgia_race_counties = await d3.csv(race_data_path)
	var georgia_counties_header = await d3.csv(race_header_path)

	$('#loading-div').addClass("hidden")

	climate_counties = climate_counties.filter(function(d){
		if (d.State == stateInitials){
			return true
		}
		return false
	})


	county_geojson["features"] = county_geojson.features.filter(function(d){
		if(d.properties.STATE == stateIndex){
			//d.properties.co2 = 
			//console.log(d.properties.NAME.toLowerCase())
			climate_counties.forEach(function(c){
				//console.log(c.County.toLowerCase())
				if (c.County.toLowerCase().trim() == d.properties.NAME.toLowerCase().trim()){
					d.properties.co2obj = c;
				}
			})
			georgia_race_counties.forEach(function(c){
				if(c.NAME.split(' ')[0].toLowerCase().trim() == d.properties.NAME.toLowerCase().trim()){
					d.properties.raceobj = c
				}
			})
			return true
		}
		return false
	})

	function doLabels(id, dataset, column){
			if (dataset == 'raceobj'){
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
	        	fillOpacity: 0.9,
	        	className: d.properties.NAME
			}}

		let colorInterpolator = d3.interpolatePurples
		if (dataset != 'co2obj'){
			colorInterpolator = d3.interpolateOranges
		}
		function getColor(d, legend=false) {	
			if (d == undefined){ return '#d3d3d3'}
			else if(legend){
				//return colorInterpolator(1 - (stdevColorRange((d - mean) / stdev)))
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
		    attribution: "Map from: <a href='https://eric.clst.org/tech/usgeojson/'>EricTech</a>, Data from: Stamford, <a href='https://data.census.gov/cedsci/table?q=Ohio%20Race%20and%20Ethnicity&tid=ACSDP1Y2018.DP05&t=Race%20and%20Ethnicity&hidePreview=true&layer=state&tp=false&g=0400000US39'>us census data</a>", 
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
		    $('.' + e.target.feature.properties.NAME).trigger("mouseover")
		   d3.selectAll('.' + e.target.feature.properties.NAME).style("stroke-width", 2).style("stroke", '#666').style("opacity", .9).moveToFront()

		    //info.update(layer.feature.properties);
		}

		function resetHighlight(e) {
			d3.selectAll('.' + e.target.feature.properties.NAME).style("stroke-width", 2).style("stroke", 'white').style("opacity", .9)
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

		/*
		var info = L.control();

		info.onAdd = function (map) {
		    this._div = L.DomUtil.create('div', 'info'); // create a div with a class "info"
		    this.update();
		    return this._div;
		};
		info.update = function (props) {
		    this._div.innerHTML = '<h4>US Population Density</h4>' +  (props ?
		        '<b>' + props.name + '</b><br />' + props.density + ' people / mi<sup>2</sup>'
		        : 'Hover over a state');
		};
		*/
		//info.addTo(map);

		let co2_label = co2_column.split('(')[1].split(')')[0]
		console.log(co2_label)

		
		let georgia = L.geoJson(geoobj, {style: style, onEachFeature: onEachFeature})
						.bindTooltip(function (layer) {
							var value
							if(dataset == 'raceobj'){
								value = layer.feature.properties.raceobj[column] + "% white || " + layer.feature.properties.co2obj[co2_column] + co2_label
							}
							else{
								value = layer.feature.properties.raceobj[white_column] + "% white || " + layer.feature.properties.co2obj[column] + co2_label
							}
    						return layer.feature.properties.NAME + ": " + value;
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

        var dformat = d3.format('.3n')
        var stylstr = co2_label
        if(dataset == 'raceobj'){
        	stylstr = '%'
        }	

        for(var i = 0; i < numBoxes + 1; i++){
        	grades.push(colExt[0] + (interval * i))
        }
        var div = L.DomUtil.create('div', 'info legend')
    	// loop through our density intervals and generate a label with a colored square for each interval
    	for (var i = 0; i < grades.length; i++) {
        	div.innerHTML +=
        	'	<i style="background:' + getColor(grades[i] + 1, legend=true) + '"></i> ' +
        	dformat(grades[i]) +' '+  stylstr + '<br>'
    	}

    	return div;
		};

		legend.addTo(map);
			
		map.dragging.disable();
		map.touchZoom.disable();
		map.doubleClickZoom.disable();
		map.scrollWheelZoom.disable();
		return map;
	}//doMap

rmCols = ['Population', 'State', 'County', ' Households ']
Object.keys(climate_counties[0]).forEach(function(d){
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

	doMap('map-1', 'co2obj', co2_column, county_geojson)
	doMap('map-2', 'raceobj', white_column, county_geojson)
}



let  lpaths = d3.selectAll(".leaflet-interactive")
	
$(".leaflet-control-zoom").addClass("hidden")
}

wrapper()