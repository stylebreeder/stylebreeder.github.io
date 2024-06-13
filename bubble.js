/***
 *
 forceCenter (for setting the center of gravity of the system)
 forceManyBody (for making elements attract or repel one another)
 forceCollide (for preventing elements overlapping)
 forceX and forceY (for attracting elements to a given point)
 forceLink (for creating a fixed distance between connected elements)
 *
 */

(function () {
    var width = 2500,
        height = 1000;

    // generate initial legend
    d3.queue()
        .defer(d3.csv, "cluster.csv")
        .await(ready);

// handle on click event
    /****
     d3.select('#region-names')
     .on('change', function () {
            var newData = (d3.select(this).property('value'));
            d3.queue()
                .defer(d3.csv, "nose.csv")
                .await(ready)
        });
     ***/
    // function updateLegend(csv_name) {
    //     d3.select("svg").remove();
    //     d3.queue()
    //         .defer(d3.csv, csv_name)
    //         .await(ready);
    //     d3.select("#region_label").html("<b>Current Region:</b> <span class='badge alert-info'>" + csv_name[0].toUpperCase() + csv_name.slice(1, -4) + "</span> " + "<b>Change the region:</b>");
    // }

    // d3.select('#region-names')
    //     .on('change', function () {
    //         var newData = d3.select(this).property('value');
    //         updateLegend(newData);
    //     });

    function ready(error, datapoints) {
        //6,8,9,11,12
        // define count object that holds count for each layer

        var countObj = {};
        var numCircles = 0;
        var uniqueIndex = {};
        var indLayer = 1;
        datapoints.forEach(function (d) {
            numCircles += 1;
            var layer = d.label;
            if (countObj[layer] === undefined) {
                countObj[layer] = 0;
                uniqueIndex[layer] = indLayer;
                indLayer += 1;
            }
            countObj[layer] = countObj[layer] + 1;

        });


        var radiusScale = d3.scaleSqrt().domain([1, 100]).range([10, 80])
        var forceXLayer = d3.forceX(function (d) {
            var numC = countObj[d.label];
            var m = width / (Object.keys(countObj).length + 1);

            return ((uniqueIndex[d.label] * m * 1.7) - (m));
            /***
             if (d.label === "6") {
                return 300
            } else if (d.label === "8") {
                return 600
            } else if (d.label === "9") {
                return 900
            } else if (d.label === "11") {
                return 1200
            } else {
                return 1500
            }
             ***/

        }).strength(0.08)


        var forceXCombine = d3.forceX(height / 2).strength(0.06)
        var forceCollide = d3.forceCollide(function (d) {
            return radiusScale(d.size / 2) + 1;
        })
        var simulation = d3.forceSimulation()
            //.force('center', d3.forceCenter(width/2, height/2))
            .force("x", forceXCombine)
            .force("y", d3.forceY(height / 2).strength(0.04))
            .force("collide", forceCollide)


        var svg = d3.select("#chart")
            .append("svg")
            .attr("height", height)
            .attr("width", width)
            .append("g")
            .attr("transform", "translate(0,0)")

//hıw we do patterns
        //var newData = datapoints.filter(filterCriteria);
        var defs = svg.append("defs");


        function zoomed() {
            svg.attr("transform", d3.event.transform);
        }

        var zoom = d3.zoom().on("zoom", zoomed);
        svg.call(zoom);
        d3.select('#zoom-reset-button').on("click", function () {
            zoom.transform(svg, d3.zoomIdentity);
        });
        defs.selectAll(".bubble-pattern")
            .data(datapoints)
            .enter().append("pattern")
            .attr("class", "bubble-pattern")
            //id create
            .attr("id", function (d) {
                // jon-snow
                // Madonna
                // the-eagles
                return d.id
            })
            .attr("height", "100%")
            .attr("width", "100%")
            .attr("patternContentUnits", "objectBoundingBox")
            .append("image")
            .attr("height", 1)
            .attr("width", 1)
            .attr("preserveAspectRatio", "none")
            // set the stroke width
            .attr("xmlns:xlink", "http://www.w3.org/1999/xlink")
            .attr("xlink:href", function (d) {
                return d.img_path
            })
        ;

        const labelColors = {
            3: "#1f77b4",
            1: "#ff7f0e",
            2: "#2ca02c",
            4: "#d62728",
            5: "#9467bd",
            6: "#8c564b",
            7: "#e377c2",
            0: "#7f7f7f",
            9: "#bcbd22",
            8: "#17becf"
        };
        
        function getColorByLabel(label) {
            return labelColors[label] || "#ffffb3"; // Default color if label not found
        }


        defs.exit().remove();
        //howwe did 15 circles
        var circles = svg.selectAll(".bubble")

            .data(datapoints)
            .enter().append("circle")
            .attr("class", "bubble")
            .attr("r", function (d) {
                return radiusScale(d.size / 2);
            })

            .attr("fill", function (d) {

                return "url(#" + d.id + ")"
            })
            .style("stroke", function (d) {
                return getColorByLabel(d.label)
            })
            .style("stroke-width", 5)
            .on('click', function (d) {
            });


        circles.exit().remove();
        d3.select("#label").on("click", function () {
            simulation.force("x", forceXLayer)
                .alphaTarget(0.4)
                .alpha(1).restart()
        })
        d3.select("#combine").on("click", function () {
            simulation.force("x", forceXCombine)
                .alphaTarget(0.4)
                .alpha(1).restart()
        })
        simulation.nodes(datapoints)
            .on('tick', ticked)
        


        var setEvents = circles
            .on('click', function (d) {
                // d3.select("h1").html("Region: <span class='badge alert-info'>" + d.region[0].toUpperCase() + d.region.slice(1) + "</span>");
                // <a href="#" onclick="copyToClipboard('https://www.google.com')">Copy Google Link</a>
                var str_lc = "<b>LoRA url for " + d.model_name + ":</b> <a target='_blank' href='" + d.url + "'>Download</a> - <a target='_blank' href='https://colab.research.google.com/drive/101IkPC7Q4cZWUTps46Em5261O3McecPZ?usp=sharing'>Open Colab</a> ";
                d3.select("#lc_info").html(str_lc);
                d3.select("#usage_info").html("");
                // d3.select("#region_label").html("<b>Current Region:</b> <span class='badge alert-info'>" + d.region[0].toUpperCase() + d.region.slice(1) + "</span> " + "<b>Change the region:</b>");
                d3.select(this).attr("r", 200);
            })

            .on('mouseenter', function () {
                    // select element in current context
                    d3.select(this)
                        .transition()
                        .attr("x", function (d) {
                            return -50;
                        })
                        .attr("y", function (d) {
                            return -50;
                        })
                        .attr("r", function (d) {
                            return radiusScale(d.size / 2) + 5;
                        })

                    d3.select(this).raise();

                }
            )
            // set back
            .on('mouseleave', function () {
                d3.select(this)
                    .transition()
                    .attr("x", function (d) {
                        return -25;
                    })
                    .attr("y", function (d) {
                        return -25;
                    })
                    .attr("r", function (d) {
                        return radiusScale(d.size / 2);
                    });
            });


        function ticked() {
            circles
                .attr("cx", function (d) {
                    return d.x
                })
                .attr("cy", function (d) {
                    return d.y
                })
        }
    }

})();
