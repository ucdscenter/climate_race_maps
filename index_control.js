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

	let height_vars = [["% population that is white", "percent_white"], 
	[ "median household income", "median_household_income"]]
	let area_axis_select =  d3.select("#area-axis-select")
	let height_axis_select = d3.select('#height-axis-select')
	let cities_included = ["cincinnati", "atlanta"]
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
			return d[1]
		})
		.text(function(d){
			return d[0]
		})

	area_axis_select.on("change", function(d){
		let xval = d3.select(this).property("value")
		cities_included.forEach(function(c){
			let oldlink = d3.select("#" + c +"-link").attr("href")
		let linkvars = oldlink.split("?")
		let newlink = linkvars[0] + "?" + "x=" + xval + "&" + linkvars[1].split("&")[1] 
		console.log(newlink)
		d3.select("#" + c +"-link").attr("href", newlink )
		})
	})
	height_axis_select.on("change", function(d){
		let yval = d3.select(this).property("value")
		cities_included.forEach(function(c){
			let oldlink = d3.select("#" + c +"-link").attr("href")
			let linkvars = oldlink.split("?")
			let newlink = linkvars[0] + "?" + linkvars[1].split("&")[0] + "&y=" + yval 
			console.log(newlink)
			d3.select("#" + c +"-link").attr("href", newlink)
		})
	})
	cities_included.forEach(function(c){
			let oldlink = d3.select("#" + c +"-link").attr("href")
		let linkvars = oldlink.split("?")
		let newlink = linkvars[0] + "?" + "x=" + area_vars[0] + "&" + linkvars[1].split("&")[1] 
		console.log(newlink)
		d3.select("#" + c +"-link").attr("href", newlink )
	})
	cities_included.forEach(function(c){
			let oldlink = d3.select("#" + c +"-link").attr("href")
			let linkvars = oldlink.split("?")
			let newlink = linkvars[0] + "?" + linkvars[1].split("&")[0] + "&y=" + height_vars[0][1]
			console.log(newlink)
			d3.select("#" + c +"-link").attr("href", newlink)
	})



}

wrapper()