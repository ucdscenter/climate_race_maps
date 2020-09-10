'use strict'

async function wrapper(){

	let colorscale = d3.schemeSet3
    colorscale.push('#757575')
    colorscale[1] = '#8B4513'
    console.log(colorscale)

	let cities = {
		'atlanta' : colorscale[0],
  		'boston' : colorscale[1],
  		'chicago' : colorscale[2],
  		'cincinnati' : colorscale[3],
  		'cleveland' : colorscale[4],
  		'dallas' : colorscale[5],
  		'denver' : colorscale[6],
  		'houston' : colorscale[7],
  		'los_angeles' : colorscale[8],
  		'minneapolis' : colorscale[9],
  		'philadelphia' : colorscale[10],
  		'portland' : colorscale[11],
  		'st_louis' : colorscale[12]
	}

	let city_keys = Object.keys(CITY_INFO)
	console.log(city_keys)
	let climate_zipcodes = await d3.csv('data/JK2014-zip-code-results.csv')


	var dformat = d3.format('.3f')
	var pformat = d3.format('.2%')
  	var mformat = d3.format('$.3s')

  	


	async function create_data(x_obj){
		console.log(x_obj)
		let data = {
			"extents" : {},
			"zipcodes" : {}

		}

		data.extents[x_name] = 0

		area_vars.forEach(function(a){
			data.extents[a] = 0;
		})


		for (var i=0; i < city_keys.length; i++){
			let msa_data = await d3.csv("data/" + CITY_INFO[city_keys[i]].city_msa_file)
			msa_data = msa_data.filter(function(r){
				if (parseInt(r["Median Household Income, 2014"].replace(',', "")) > 0){
					return true
				}
				return false
			})
			msa_data.forEach(function(r){
				r.city = city_keys[i]
				r.zip = r.Name.split(",")[0]
				r.percent_white = parseInt(r[race_pop_column].replace(',', ""))/ parseInt(r[total_pop_column].replace(',', ""))
	    		r.median_household_income = parseInt(r["Median Household Income, 2014"].replace(',', ""))
				data.zipcodes[r.FIPS] = r
			})
		}

		climate_zipcodes.forEach(function(zr){
			let zipstr = zr.ZipCode.toString().length == 4 ? "0" + zr.ZipCode.toString() : zr.ZipCode.toString()

			if (data.zipcodes[zipstr] != undefined){
				data.zipcodes[zipstr] = Object.assign(zr, data.zipcodes[zipstr])
			}
		})

		data.zipcodes = Object.values(data.zipcodes)

		data.zipcodes = Array.from(d3.group(data.zipcodes, function(d){
			return d.city
		}))
		for (var c_index=0; c_index < data.zipcodes.length; c_index++){
			let q_arr = [0, .1, .2, .3, .4,.5,.6,.7,.8, .9, 1]
			let quantiles = []
			q_arr.forEach(function(q){
				quantiles.push(d3.quantile(data.zipcodes[c_index][1], q, function(r){
					return r[x_name]
				}))
			})

			if (quantiles[quantiles.length - 1] > data.extents[x_name]){
				data.extents[x_name] =  quantiles[quantiles.length - 1]
			}
			
			function qdecider(score){
				for (var i = 0; i < quantiles.length; i++){
					if(score <= quantiles[i])
						return quantiles[i]
				}
			}
			data.zipcodes[c_index] = [data.zipcodes[c_index][0], Array.from(d3.group(data.zipcodes[c_index][1], function(z){
				return qdecider(z[x_name])
			}))]
		}

		async function do_points(the_zipcodes){
			function point_creator(scores){

				let avg_obj = {}
				area_vars.forEach(function(a){
					avg_obj[a] = d3.median(scores, function(s){
						if (s[a] != undefined){
							return parseFloat(s[a].trim())
						}
						
					})
					if (avg_obj[a] > data.extents[a]){
						data.extents[a] = avg_obj[a]
					}
				})
				return avg_obj
			}

			let points = []
			for (var c_index=0; c_index < the_zipcodes.length; c_index++){
				for(var q_index=0; q_index < the_zipcodes[c_index][1].length; q_index++){
					points = point_creator(the_zipcodes[c_index][1][q_index][1])
					the_zipcodes[c_index][1][q_index][1] = points
				}
				the_zipcodes[c_index][1].sort(function(a,b){
					return a[0] - b[0]
				})
			}
			return the_zipcodes
		}

		data.zipcodes = await do_points(data.zipcodes);





		console.log(data)
		return data
	}

	let formatted_data = {};

	let compobj1 = parseInt(urlparams.comp1);
	let compobj2 = parseInt(urlparams.comp2);
	formatted_data[height_vars[0][1]] = await create_data(height_vars[compobj1])
	formatted_data[height_vars[1][1]] = await create_data(height_vars[compobj2])
	console.log(formatted_data)
	let svg_height = 300


	function render_graph(){
	height_vars.forEach(function(x_obj){
		d3.select('#dotplots-div').append("div").attr("class", "col-12 mb-2 mt-2").append("h3").text(
			x_obj[0])
		area_vars.forEach(function(a){
			create_quantile_graph(x_obj, a)
		})
		d3.select('#dotplots-div').append("hr").attr("class", "col-12 mb-2 mt-2")
	})
	}

	
	
	function create_quantile_graph(x_name, y_name){
		let outerdiv = d3.select("#dotplots-div")
		let innerdiv = outerdiv.append("div").attr("class", "col-lg-4 col-md-6 col-sm-12 mb-5")

		innerdiv.append("p").text(x_name[0] + " by " + y_name)

		let svg_width = parseFloat(innerdiv.style("width").slice(0, -2))

		let padding = {top: 10, left: 30, right: 15, bottom: 15}


	  var tickformat
	  var xScale, yScale

	  var line_g
	  var x_label
	  if (x_name[1] == race_column){
	    xScale = d3.scaleLinear().domain([0, 1]).range([0, svg_width - (padding.left + padding.right)])
	    tickformat = d3.format('.0%')
	    x_label = "% white"
	  }
	  else{
	    xScale = d3.scaleLinear().domain([0, formatted_data[x_name[1]].extents[x_name[1]]]).range([0, svg_width - (padding.left + padding.right)])
	    tickformat = d3.format('$.2s')
	    x_label = 'median income'
	  }

	  yScale = d3.scaleLinear().domain([ 0, formatted_data[x_name[1]].extents[y_name] + 3]).range([svg_height - (padding.top + padding.bottom), 0])

		let graph_svg = innerdiv.append("svg").attr("height", svg_height).attr("width", svg_width).attr("class", "line_graph")

		function create_axes(){
			graph_svg.append("g")
		        .attr("transform", "translate(" + padding.left + "," + (svg_height  - (padding.top + padding.bottom)) + ")")
		        .attr("class", 'x-axis')
		        .call(d3.axisBottom(xScale).ticks(4).tickFormat(tickformat));
			graph_svg.append("g")
			    .attr("transform", "translate(" + padding.left + "," + 0 + ")")
			    .attr("class", 'y-axis')
			    .call(d3.axisLeft(yScale).ticks(4));

			graph_svg.append("text").text(x_label).attr("x", (svg_width/2) - 25).attr("y", svg_height - 2).style("font-size", '7px')
		  graph_svg.append("text").text("tC02/yr").attr("x", 0).attr("y", (svg_height / 2) -1 ).style("font-size", '8px')
		  line_g = graph_svg.append("g").attr('transform', 'translate(' + padding.left + ',' + 0 + ')')
		};

		create_axes()

		/*function draw_line(city_data){
			line_g.append("path")
		}


		function create_lines(){
			formatted_data[x_name[1]].zipcodes.forEach(function(c){
				draw_line(c)
			})
		}

		create_lines()*/

		line_g.selectAll(".line")
			.data(formatted_data[x_name[1]].zipcodes)
			.enter()
			.append("path")
			.attr("fill", "none")
			.attr("stroke", function(d, i){ return cities[d[0]]})
			.attr("stroke-opacity", .7)
        	.attr("stroke-width", 1.5)
        	.attr("class", function(d){
        		return d[0] + " a_city"
        	})
        	.attr("d", function(d){
         		 return d3.line()
            		.x(function(d) { return xScale(d[0]); })
            		.y(function(d) { return yScale(d[1][y_name]); }).curve(d3.curveMonotoneX)
            	(d[1].filter(function(q){
            		if(q[0] == undefined){
            			return false
            		}
            		return true
            	}).slice(1, -1))
            })

        let extent_dots = line_g.selectAll(".extent_dots").data(formatted_data[x_name[1]].zipcodes)
        	.enter()
        	.append("g")


       	extent_dots.append("circle")
	       	.attr("cx", function(d){
	       		if(d[1][0][0] == undefined){
	       			return xScale(d[1][1][0]);
	       		}
	       		return xScale(d[1][0][0]);
	       	})
	       	.attr("cy", function(d){
	       		if(d[1][0][0] == undefined){
	       			return xScale(d[1][1][1][y_name]);
	       		}
	       		return yScale(d[1][0][1][y_name])
	       	})
	       	.attr("r", 1.5)
	       	.attr("fill", function(d, i){
	       		return cities[d[0]]
	       	})
	       	.attr("fill-opacity", .5)
	       	.attr("class", function(d){
	       		return d[0] + " a_city"
	       	})

	    extent_dots.append("circle")
	       	.attr("cx", function(d){
	       		return xScale(d[1][d[1].length - 1][0]);
	       	})
	       	.attr("cy", function(d){
	       		return yScale(d[1][d[1].length - 1][1][y_name])
	       	})
	       	.attr("r", 1.5)
	       	.attr("fill", function(d, i){
	       		console.log(d[0])
	       		return cities[d[0]]
	       	})
	       	.attr("fill-opacity", .5)
	       	.attr("class", function(d){
	       		return d[0] + " a_city"
	       	})

	}//create_quantile_graph

	async function do_buttons(){
		let buttondiv = d3.select("#city-buttons-div")

		let divs = buttondiv.selectAll(".btn btn-secondary")
			.data(Object.keys(cities))
			.enter()
			.append("div")
			.attr("type", "button")
			.attr("class", "col-lg-2 col-md-4 col-sm-6 btn btn-outline-dark m-2 city-btn")
			.style("background-color", function(d, i){
				console.log(d)
				return cities[d] + '80'
			})
			.text(function(d, i){
				return d
			})
			.on("click", function(d, i){
				console.log("also clicked")
				d3.selectAll(".a_city").attr("stroke-opacity", .3).attr("opacity", .3)
				d3.selectAll("." + d).attr("stroke-opacity", 1).attr("opacity", 1).attr("fill-opacity", 1)
				d3.event.stopPropagation();
			})
	}
	await do_buttons()
	await render_graph();
	$("#loading").addClass("hidden")
	$('body').click(function(e){
		console.log("clicked")
		d3.selectAll(".a_city").attr("stroke-opacity", .7).attr("opacity", .7)
	})
	//$("#after-loaded").removeClass("hidden")


}//wrapper

wrapper()