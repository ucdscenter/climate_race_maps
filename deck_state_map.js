var selectedObject;
async function wrapper() {
  var dformat = d3.format('.3f')
  var pformat = d3.format('.2%')
  var mformat = d3.format('$.3s')
  let zipcode_geojson = {
    type: "FeatureCollection",
    features: []
  }
  //var	zipcode_geojson = 
  for (var i = 0; i < zip_geo_path.length; i++) {
    let state_geo = await d3.json(zip_geo_path[i]);
    zipcode_geojson.features.push(...state_geo.features)
  }

  console.log(zipcode_geojson)


  var climate_zipcodes = await d3.csv('data/JK2014-zip-code-results.csv')
  var city_msa = await d3.csv('data/' + city_msa_file)
  console.log(city_msa)
  let race_zipcodes = city_msa
  /*for(var i = 0; i < zip_geo_path.length; i++){
   var state_demo_zipcodes = await d3.csv(race_data_path[i])
   race_zipcodes.push(...state_demo_zipcodes)
  }*/


  console.log(race_zipcodes)

  let params = getJsonFromUrl(window.location.search)
  let x_val = decodeURIComponent(params.x)
  let y_val = height_vars[parseInt(decodeURIComponent(params.y))]

  console.log(x_val)
  console.log(y_val)

  $('#loading-div').addClass("hidden")

  if (y_val.worklabel == 'median_household_income') {
    d3.select("#descriptive-y-axis").text("Median household income:")

  }
  else {
    d3.select("#descriptive-y-axis").text(y_val.longlabel + ":")
  }

  d3.select("#descriptive-x-axis").text(x_val)


  var zipobj = {}
  race_zipcodes.forEach(function (d, i) {
    d.zip = d.Name.split(",")[0]

    d[y_val.worklabel] = dformat(parseInt(d[y_val.datalabel].replace(',', "")) / parseInt(d[total_pop_column].replace(',', "")))
    console.log(d[y_val.worklabel])
    d.median_household_income = parseInt(d["Median Household Income, 2014"].replace(',', ""))
    zipobj[d.zip] = [i]
  })
  var thing = 0
  climate_zipcodes = climate_zipcodes.filter(function (d, i) {

    let zipstr = d.ZipCode.toString().length == 4 ? "0" + d.ZipCode.toString() : d.ZipCode.toString()

    if (zipobj[zipstr] != undefined) {
      /*console.log(d)
      Object.keys(d).forEach(function(k){
        let newname = k
        newname.replace(/"/g, "")
        newname.trim()

      })*/
      zipobj[zipstr].push(thing)
      thing++
      return true
    }
    return false
  })


  var thing2 = 0
  zipcode_geojson.features = zipcode_geojson.features.filter(function (d, i) {
    if (zipobj[d.properties.ZCTA5CE10] != undefined) {
      // d.selected = true;
      for (var i = 0; i < city_msa.length; i++) {
        if (d.properties.ZCTA5CE10 == city_msa[i].FIPS) {
          zipobj[d.properties.ZCTA5CE10].push(thing2);
          thing2++;
          return true
        }
      }

    }

    return false
  })
  console.log(zipcode_geojson)
  let id_zip = 0
  Object.values(zipobj).forEach(function (d) {
    if (d.length == 3) {
      zipcode_geojson.features[d[2]].properties.raceobj = race_zipcodes[d[0]]
      zipcode_geojson.features[d[2]].properties.co2obj = climate_zipcodes[d[1]]
      zipcode_geojson.features[d[2]].properties.id = id_zip++;
    }
  })

  zipcode_geojson.features = zipcode_geojson.features.filter(function (d, i) {
    if (d.properties.co2obj == undefined || d.properties.raceobj == undefined) {
      return false
    }
    return true
  })

  let dataset = 'co2obj'
  let column = x_val
  var colExt = d3.extent(zipcode_geojson.features.map(function (x) {
    if (x.properties[dataset] != undefined) {
      return parseFloat(x.properties[dataset][column].trim().replace(/,/g, ''))
    }
  }))

  console.log(zipcode_geojson)


  d3.select('#min_val').text(colExt[0])
  d3.select('#max_val').text(colExt[1])
  var raceExt = d3.extent(zipcode_geojson.features.map(function (x) {

    if (x.properties.raceobj != undefined) {
      if (y_val.worklabel != "median_household_income") {
        console.log()
        return (1 - x.properties.raceobj[y_val.worklabel])

      }
      else {
        if (x.properties.raceobj[y_val.worklabel] > 0) {
          return x.properties.raceobj[y_val.worklabel];
        }
      }
    }
  }))
  let heightScale = d3.scaleLinear().domain(colExt).range([10, 10000])

  let center_circles = {
    type: "FeatureCollection",
    features: [],
  }
  zipcode_geojson.features.forEach(function (f) {
    let point = turf.centroid(f)
    var options = { steps: 10, units: 'kilometers', properties: f.properties }
    let circle = turf.circle(point.geometry.coordinates, .5, options)
    center_circles.features.push(circle)
  })

  const mapboxAccessToken = 'pk.eyJ1IjoiZXpyYWVkZ2VydG9uIiwiYSI6ImNrdmllOWpnOTAwYzIyb28wNWt0ZmY2MTAifQ.UCZJAFBHQeGzxL7q_mVoXA'
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


  const RACE_COLOR_SCALE = [
    // negative
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0],

    // positive
    [255, 255, 229],
    [247, 252, 185],
    [217, 240, 163],
    [173, 221, 142],
    [120, 198, 121],
    [65, 171, 93],
    [35, 132, 67],
    [0, 104, 55],
    [0, 69, 41]
  ];
  const zipshapegeojsonLayer = getZipShapeGeoJsonLayer(zipcode_geojson)
  let idx = 0;
  const zipcountgeojsonLayer = getZipCountGeoJsonLayer(center_circles)

  var deckg = createDeckGl(mapboxAccessToken, zipshapegeojsonLayer, zipcountgeojsonLayer, getTooltip);
  // Sequentially highlighting zips: Using line 203, 204 on any event listener should work! 
  // In 203, instead of accessing by randomIndex we need to access by zip code, either by creating a key-value pair initially or by filtering the array.
  setInterval(() => {
    if (idx > zipcode_geojson.length - 1)
      idx = 0;
    selectedObject = zipcode_geojson.features[idx++];
    deckg.setProps({ layers: [getZipShapeGeoJsonLayer(zipcode_geojson), getZipCountGeoJsonLayer(center_circles)] })

  }, 5000)
  function colorScale(x) {
    if (isNaN(x) == true || x <= 0) {
      console.log(x)
      return [50, 50, 50]
    }
    if (y_val.worklabel != "median_household_income") {

      const i = Math.round(x * 7) + 4;

      if (x < 0) {
        return RACE_COLOR_SCALE[i] || RACE_COLOR_SCALE[0];
      }
      return RACE_COLOR_SCALE[i] || RACE_COLOR_SCALE[RACE_COLOR_SCALE.length - 1];
    }
    else {
      const i = Math.round((x - raceExt[0]) / (raceExt[1] - raceExt[0]) * 7) + 4;
      if (x < 0) {
        return COLOR_SCALE[i] || COLOR_SCALE[0];
      }
      return COLOR_SCALE[i] || COLOR_SCALE[COLOR_SCALE.length - 1];

    }

  }
  function heighttooltipdecider(object) {
    return x_val + ": " + object.properties.co2obj[x_val]
  }

  function tooltipdecider(object) {
    let heightthing = 0
    if (y_val.worklabel != "median_household_income") {
      heightthing = pformat(object.properties.raceobj[y_val.worklabel])

      return y_val.longlabel + " " + heightthing
    }
    else {
      heightthing = mformat(object.properties.raceobj[y_val.worklabel])
      return "Median Household Income " + heightthing;
    }

  };

  function legenddecider(thing) {
    let heightthing = ''
    if (y_val.worklabel != "median_household_income") {
      heightthing = pformat(1 - thing) + " " + y_val.shortlabel.slice(1) + ' <br>'
    }
    else {
      heightthing = mformat(thing) + '<br>'
    }
    return heightthing
  }

  function getTooltip({ object }) {

    console.log('get tootip', { object })
    return object && `Zip Code ${object.properties.co2obj.ZipCode}
  Total Pop ${object.properties.raceobj[total_pop_column]}
	${heighttooltipdecider(object)}
  ${tooltipdecider(object)}`
  }


  function renderColorLegend() {

    function componentToHex(c) {
      var hex = c.toString(16);
      return hex.length == 1 ? "0" + hex : hex;
    }

    function rgbToHex(r, g, b) {
      return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
    }
    var numBoxes = 9
    let diff = raceExt[1] - raceExt[0]
    let interval = diff / numBoxes

    var grades = [];
    var labels = [];


    var stylstr = "% nonwhite"
    var shittyfix = 0
    let tformat = dformat
    if (dataset == 'raceobj') {
      stylstr = '%'
      tformat = pformat
    }
    else {
      tformat = dformat
    }
    for (var i = 0; i < numBoxes + 1; i++) {
      grades.push(raceExt[0] + (interval * i))
    }
    var div = document.getElementById("color-legend")
    // loop through our density intervals and generate a label with a colored square for each interval
    for (var i = 0; i < grades.length; i++) {
      var gradecolor;
      if (y_val.worklabel != "median_household_income") {
        gradecolor = colorScale(parseFloat(grades[i]) / raceExt[1])
      }
      else {
        gradecolor = colorScale(parseFloat(grades[i]))
      }
      div.innerHTML +=
        ' <i style="background-color:' + rgbToHex(gradecolor[0], gradecolor[1], gradecolor[2]) + '; height:12px; width:12px"></i> ' + legenddecider(grades[i]);
    }
  }//renderColorLegend
  renderColorLegend()

  function renderDotPlot() {

    d3.select('#dot-svg').remove()
    labelstr = ""
    let ylabel = ""
    var xScale

    let gwidth = window.innerWidth * .25;
    let gheight = window.innerHeight * .25;



    if (gheight > gwidth) {
      gwidth = gheight * 1.85;
    }
    else {
      gheight = gwidth * .54;
    }

    if ((window.innerWidth - gwidth) < 230) {
      d3.selectAll(".legend-section").style("width", 150 - (230 - (window.innerWidth - gwidth)))
    }
    else {
      d3.selectAll(".legend-section").style("width", 150)
    }

    let padding = {
      top: 5,
      bottom: 20,
      left: 40,
      right: 5
    }
    var tickformat
    if (y_val.worklabel != "median_household_income") {
      ylabel = y_val.shortlabel
      xScale = d3.scaleLinear().domain([0, 1]).range([0, gwidth - (padding.left + padding.right)])
      tickformat = d3.format('.0%')
    }
    else {
      ylabel = "Median Household Income"
      xScale = d3.scaleLinear().domain(raceExt).range([0, gwidth - (padding.left + padding.right)])
      tickformat = d3.format('$.2s')
    }
    labelstr = x_val + " by " + ylabel
    //d3.select('#dotplot-label').text(labelstr)



    let yScale = d3.scaleLinear().domain([0, colExt[1] + 3]).range([gheight - (padding.top + padding.bottom), 0])
    let dot_svg = d3.select("#dotplot")
      .append("svg")
      .attr("width", gwidth)
      .attr("height", gheight)
      .attr("id", "dot-svg");

    dot_svg.append("g")
      .attr("transform", "translate(" + padding.left + "," + (gheight - (padding.top + padding.bottom)) + ")")
      .attr("class", 'x-axis')
      .call(d3.axisBottom(xScale).ticks(4).tickFormat(tickformat));
    dot_svg.append("g")
      .attr("transform", "translate(" + padding.left + "," + 0 + ")")
      .attr("class", 'y-axis')
      .call(d3.axisLeft(yScale).ticks(4));

    dot_svg.append("text").text(ylabel).attr("x", (gwidth / 2) - 25).attr("y", gheight - 2).style("font-size", '7px')
    dot_svg.append("text").text("tC02/yr").attr("x", 0).attr("y", (gheight / 2) - 1).style("font-size", '8px')
    let dotg = dot_svg.append("g").attr('transform', 'translate(' + padding.left + ',' + 0 + ')')

    dotg.selectAll(".g_circle")
      .data(zipcode_geojson.features)
      .enter()
      .append("circle")
      .attr("cx", function (d) {
        if (xScale(d.properties.raceobj[y_val.worklabel]) < 0) {
          return 0
        }
        return xScale(d.properties.raceobj[y_val.worklabel])
      })
      .attr("cy", function (d) {
        return yScale(d.properties.co2obj[x_val])
      })
      .attr("r", 2.5)
      .style("fill", function (d) {
        var c;
        if (y_val.worklabel != "median_household_income") {
          c = colorScale(1 - d.properties.raceobj[y_val.worklabel])
        }
        else {
          c = colorScale(d.properties.raceobj[y_val.worklabel])
        }

        return "rgb(" + c.join(",") + ")"
      })
      .attr("class", function (d) {
        let thestr = "dot dot-" + d.properties.co2obj.ZipCode;
        if (d.properties.co2obj.ZipCode == undefined) {
          return thestr + " hidden"
        }
        return thestr
      })



  }
  renderDotPlot()


  $(window).resize(function () {
    renderDotPlot()

  })
  $(window).resize()

  function createDeckGl(mapboxAccessToken, zipshapegeojsonLayer, zipcountgeojsonLayer, getTooltip) {
    return new deck.DeckGL({
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
      getTooltip,
    });
  }

  function getZipCountGeoJsonLayer(center_circles) {
    return new deck.GeoJsonLayer({
      data: center_circles,
      opacity: 1,
      stroked: true,
      filled: true,
      extruded: true,
      wireframe: true,
      fp64: true,

      getElevation: function (f) {
        return heightScale(parseFloat(f.properties.co2obj[x_val].trim()))
      },
      getRadius: 1000,
      getFillColor: function (d) {
        if (y_val.worklabel != "median_household_income") {
          return colorScale(1 - d.properties.raceobj[y_val.worklabel])
        }
        else {
          return colorScale(d.properties.raceobj[y_val.worklabel]);
        }
      },
      updateTriggers: {
        getFillColor: []
      },
      getLineColor: f => [0, 0, 0],
      pickable: true,
      onHover: function (d, e) {

      }
    });
  }

  function getZipShapeGeoJsonLayer(zipcode_geojson) {
    return new deck.GeoJsonLayer({
      data: zipcode_geojson,
      opacity: .4,
      stroked: true,
      filled: true,
      extruded: true,
      wireframe: true,
      fp64: true,

      getElevation: function (f) {
        return 0
      },
      lineWidthScale: 5,
      getFillColor: function (d) {
        if (selectedObject && d.properties.id === selectedObject.properties.id) {
          return [0, 0, 0]
        }

        if (y_val.worklabel != "median_household_income") {
          return colorScale(1 - d.properties.raceobj[y_val.worklabel])
        }
        else {
          return colorScale(d.properties.raceobj[y_val.worklabel]);
        }
      },
      getLineColor: f => [0, 0, 0],
      // autoHighlight: true,
      // highlightColor: [0,0,0],
      pickable: true,
      updateTriggers: {
        getFillColor: [
          selectedObject ? selectedObject.properties.id : null
        ]
      },

      onHover: function (d, e) {
        if (d.object) {
          if (d.object.properties != undefined) {
            d3.select(".dot-selected").classed("dot-selected", false)
            d3.select(".dot-" + d.object.properties.co2obj.ZipCode).classed("dot-selected", true)
          }
        }
      },
    });
  }
}//wrapper

wrapper();	