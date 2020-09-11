async function wrapper(){

	let area_vars = [
		[" Total Household Carbon Footprint (tCO2e/yr) "],
		[" Food (tCO2e/yr) "],
		[" Goods (tCO2e/yr) "],
		[" Housing (tCO2e/yr) "],
		[" Services (tCO2e/yr) "],
		[" Transport (tCO2e/yr) "]]
		//[" Vehicle miles traveled "]
		//["FUELOIL (gallons)"],
		//["Nat. Gas (cu.ft.)"]]

	const height_vars = [
    {
        "index" : 0, 
        "longlabel" : "median household income",
        "shortlabel" : "median income",
        "datalabel" : "Median Household Income, 2014",
        "worklabel" : "median_household_income"
      },
    {
      "index" : 1, 
      "longlabel" : "% population that is white",
      "shortlabel" : "% white",
      "datalabel" : "# White Population, Alone, 2014",
      "worklabel" : "percent_white"
    },
    {
      "index" : 2, 
      "longlabel" : "% population that is Asian",
      "shortlabel" : "% Asian",
      "datalabel" : "# Asian Population, Alone, 2014",
      "worklabel" : "percent_asian"
    },
    {
      "index" : 3, 
      "longlabel" : "% population that is Black",
      "shortlabel" : "% black",
      "datalabel" : "# Black Population, Alone, 2014",
      "worklabel" : "percent_black"
    },
    {
      "index" : 4, 
      "longlabel" : "% population that is Hispanic",
      "shortlabel" : "% hispanic",
      "datalabel" : "# Hispanic Population, 2014",
      "worklabel" : "percent_hispanic"
    },
    {
      "index" : 5, 
      "longlabel" : "% population that is Native American",
      "shortlabel" : "% Native American",
      "datalabel" : "# Population, Hispanic, American Indian and Alaska Native Alone, 2014",
      "worklabel" : "percent_nativeamerican"
    }
  ]
	let area_axis_select =  d3.select("#area-axis-select")
	let height_axis_select = d3.select('#height-axis-select')
	let cities_included = ["cincinnati", "atlanta"]

	let city_links = d3.selectAll(".city")
	console.log(city_links)

	city_links.attr("class", function(d){
		let c = d3.select(this).attr('id')
		return "btn btn-outline-dark city"
	})
	area_axis_select
		.selectAll("option")
		.data(area_vars)
		.enter()
		.append("option")
		.attr("value", function(d){
			return d[0]
		})
		.text(function(d){
			return d[0]
		})

	height_axis_select
		.selectAll("option")
		.data(height_vars)
		.enter()
		.append("option")
		.attr("value", function(d){
			return d.index;
		})
		.text(function(d){
			return d.longlabel
		})

	

	let xval = area_axis_select.property("value")
	let yval = height_axis_select.property("value")

	console.log(xval)
	console.log(yval)

	function optionChange(){
		xval = area_axis_select.property("value")
		yval = height_axis_select.property("value")
		console.log(xval)
		console.log(yval)
		city_links.attr("class", function(d){
			let c = d3.select(this).attr('id')
			let oldlink = d3.select("#" + c).attr("href");
			oldlink = oldlink.split("?")[0];
			var searchParams = new URLSearchParams();
			searchParams.append("x", xval)
			searchParams.append("y", yval)
			searchParams.append("city", c)
			console.log(searchParams.toString())
			newlink = oldlink + "?" + searchParams.toString()
			console.log(newlink)
			d3.select("#" + c).attr("href", newlink )
			return "btn btn-outline-dark city"
		})
	}
	area_axis_select.on("change", function(d){
		optionChange()
	})
	height_axis_select.on("change", function(d){
		optionChange()
	})

	optionChange()



}

wrapper()