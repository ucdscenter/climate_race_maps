'use strict'

async function wrapper(){

	const white_pop_column = "# White Population, Alone, 2014"
	const income_column = "Average Household Income, 2014"
	const total_pop_column = "# Population, 2014"


	let area_vars = [
		[" Total Household Carbon Footprint (tCO2e/yr) "],
		[" Food (tCO2e/yr) "],
		[" Goods (tCO2e/yr) "],
		[" Housing (tCO2e/yr) "],
		[" Services (tCO2e/yr) "],
		[" Transport (tCO2e/yr) "],
		["Total Zip Code Carbon Footprint (tCO2e/yr)"]]

		//[" Vehicle miles traveled "]
		//["FUELOIL (gallons)"],
		//["Nat. Gas (cu.ft.)"]]

	let height_vars = [["% population that is white", "percent_white"], 
	[ "median household income", "median_household_income"]]

	var data_format = d3.format('.3f')
	var percent_format = d3.format('.2%')
  	var money_format = d3.format('$.3s')


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


	let states = window.location.search.split("=")[1].split(',')

	async function doData(selstates){

		let filteredData = []

		let co2Data = await d3.csv('data/JK2014-zip-code-results.csv')
		

		let co2indexes = {}
		let index = 0;
		co2Data = co2Data.filter(function(d){
			let keep = false
			selstates.forEach(function(st){

				if (st == d.State){
					keep = true
				}
			})
			if(keep == true){
				area_vars.forEach(function(v){
					d[v] = parseFloat(d[v].trim())
				})
				co2indexes[d.ZipCode] = index;
				index++;

			}
			return keep;
		})
		filteredData.push(...co2Data)
		if (selstates[0] == "OH"){
			let statefps = ['data/zip_codes_race/2014_indiana_Ranking.csv', 'data/zip_codes_race/2014_kentucky_Ranking.csv', 'data/zip_codes_race/2014_ohio_Ranking.csv']

			for(var i = 0; i < statefps.length; i++){
				let statedata = await d3.csv(statefps[i])
				statedata.forEach(function(row){
					if (co2indexes[row.FIPS] != undefined){
						row.percent_white = +data_format(row[white_pop_column]/row[total_pop_column])
						row.median_household_income = parseInt(row["Median Household Income, 2014"])
						co2Data[co2indexes[row.FIPS]] = Object.assign(co2Data[co2indexes[row.FIPS]], row);
					}
				})
				
			}		
		}
		if (selstates[0] == 'GA'){
			let statefps = ['data/zip_codes_race/2014_georgia_Ranking.csv'];
			for(var i = 0; i < statefps.length; i++){
				let statedata = await d3.csv(statefps[i])
				statedata.forEach(function(row){
					if (co2indexes[row.FIPS] != undefined){
						row.percent_white = +data_format(row[white_pop_column]/row[total_pop_column])
						row.median_household_income = parseInt(row["Median Household Income, 2014"])
						co2Data[co2indexes[row.FIPS]] = Object.assign(co2Data[co2indexes[row.FIPS]], row);
					}
				})
				
			}		
		}

		return {
			data : filteredData
		}
	}

	async function doGraph(thestates){

		let data = await doData(thestates)
		let x_var = 'percent_white'
		let y_var = " Total Household Carbon Footprint (tCO2e/yr) "

		let padding = {top : 10, bottom: 10, left: 50, right: 10}
		let height = window.innerHeight;
		let width = window.innerWidth;

		let graphwidth = width * .6;
		let graphheight = height * .8;

		let svg = d3.select("#graph-div").append("svg").attr("id", "graph-svg").attr("height", graphheight).attr("width", graphwidth)




		console.log(data)

		let xExt = d3.extent(data.data, function(d){
			return d[x_var]
		})
		let yExt = d3.extent(data.data, function(d){
			return d[y_var]
		})

		let xScale = d3.scaleLinear().domain(xExt).range([0, graphwidth - (padding.left + padding.right)])
		let yScale = d3.scaleLinear().domain(yExt).range([graphheight - (padding.top + padding.bottom), 0])

		svg.append("g")
	      .attr("transform", "translate(" + padding.left + "," + (graphheight  - (padding.top + padding.bottom)) + ")")
	      .attr("class", 'x-axis')
	      .call(d3.axisBottom(xScale));
		svg.append("g")
	      .attr("transform", "translate(" + padding.left + "," + 0 + ")")
	      .attr("class", 'y-axis')
	      .call(d3.axisLeft(yScale).ticks(4));


	    let dotg = svg.append("g").attr('transform', 'translate(' + padding.left + ',' + 0 + ')')

	    dotg.selectAll(".dotcircle")
	    	.data(data.data)
	    	.enter()
	    	.append("circle")
	    	.attr("cx", function(d){
	    		console.log(d[x_var])
	    		return xScale(d[x_var])
	    	})
	    	.attr("cy", function(d){
	    		return yScale(d[y_var])
	    	})
	    	.attr("class", function(d){
	    		if (isNaN(d[x_var]) || isNaN(d[y_var])){
	    			return "hidden"
	    		}
	    		else {
	    			return ""
	    		}
	    	})
	    	.attr("r", 2.5)



	};
	doGraph(states)
}

wrapper()