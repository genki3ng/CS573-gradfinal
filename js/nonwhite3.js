var margin = {top: 20, right: 20, bottom: 50, left: 50},
    width = 480 - margin.left - margin.right,
    height = 250 - margin.top - margin.bottom;

// setup x
var xValue = function(d) { return d.trump;},
    xScale = d3.scale.linear().range([0, width]),
    xMap = function(d) { return xScale(xValue(d));},
    xAxis = d3.svg.axis().scale(xScale).orient("bottom")
              .innerTickSize(-height)
              .outerTickSize(0);
// setup y
var yValue = function(d) { return d.share;},
    yScale = d3.scale.linear().range([height, 0]),
    yMap = function(d) { return yScale(yValue(d));},
    yAxis = d3.svg.axis().scale(yScale).orient("left")
              .innerTickSize(-width)
              .outerTickSize(0);

// setup fill color
var color = d3.scale
              .linear()
              .domain([0,100])
              .range(['Blue', 'Red']);

// add the graph canvas to the body of the webpage
var svg = d3.select("body").select(".state-chartNCEW").select('.chart').append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// add the tooltip area to the webpage
var tooltip = d3.select("body").select(".state-chartNCEW").select('.chart').append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

var tooltipPrompt = d3.select("body").select(".state-chartNCEW").select('.chart').append("div")
    .attr("class", "tooltipPrompt")
    .style("opacity", 0);

var rect = svg.append("rect").attr({
    width: width,
    height: height,
    fill: "#ffffff"
});

// Level 3, add prompt box.
tooltipPrompt.html("<b>Drag the line to see how many states have less Trump vote than the line indicate.</b>")
     .style("left", width+300+"px")
     .style("top", height+"px")
     .style("opacity", 1);

// load data
d3.csv("data\\nonwhite.csv", function(error, data) {

//Add Verticle line
var verticalLine = svg.append('line')
// .attr('transform', 'translate(100, 50)')
.attr({
    'x1': width/2,
    'y1': 0,
    'x2': width/2,
    'y2': height
})
    .attr("stroke", "steelblue")
    .attr("stroke-width","2px")
    .attr('class', 'verticalLine');
  // change string (from CSV) into number format
  data.forEach(function(d) {
    d.trump = +d.trump;
    d.share = +d.share;
//    console.log(d);
  });

  // don't want dots overlapping axis, so add in buffer to data domain
  xScale.domain([0, 100]);

  yScale.domain([0,100]);

  // x-axis
  svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis)
    .append("text")
      .attr("class", "label")
      .attr("x", width/2)
      .attr("y", 40)
      .style("text-anchor", "end")
      .style("font-weight","bold")
      .style("font-size","16px")
      .text("Trump Vote");

  // y-axis
  svg.append("g")
      .attr("class", "y axis")
      .call(yAxis)
    .append("text")
      .attr("class", "label")
      .attr("transform", "rotate(-90)")
      .attr("y", -40)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .style("font-weight","bold")
      .style("font-size","16px")
      .text("Share Of State Electorate");

  // draw dots
var dots =
    svg.selectAll(".dot")
      .data(data)
    .enter().append("circle")
      .attr("class", "dot")
// Store vote rate
var c=0;
var vote = []
data.forEach(function(d){
  vote.push(d.trump);
})

var dotAttribute = dots
      .attr("r", 3.5)
      .attr("cx", xMap)
      .attr("cy", yMap)
      .style("fill", function(d,i) {return color(d.trump);})
      .on("mouseover", function(d) {
        var xPos = d3.mouse(this)[0];
        var trans = xPos-width/2;
        d3.select(".verticalLine").attr("transform", function () {
            return "translate(" + trans + ",0)";
        });
        if(d.trump!=d3.max(vote)&&d.trump!=d3.min(vote)){
          tooltip.transition()
               .duration(200)
               .style("opacity", 1);
          tooltip.html(d.State)
               .style("left", (d3.event.pageX - 150) + "px")
               .style("top", (d3.event.pageY - 14) + "px");}
      })
      .on("mouseout", function(d) {
        var xPos = d3.mouse(this)[0];
        var trans = xPos-width/2;
        d3.select(".verticalLine").attr("transform", function () {
            return "translate(" + trans + ",0)";
        });
          tooltip.transition()
               .duration(500)
               .style("opacity", 0);
      });
var text = svg.selectAll("text")
              .data(data)
              .enter()
              .append("text");
      //Add SVG Text Element Attributes
var textLabels = text
               .attr("x", function(d) { return xMap(d)+2; })
               .attr("y", function(d) { return yMap(d)-9; })
               .text( function (d) { if(d.trump==d3.max(vote) || d.trump==d3.min(vote)) return d.State; })
               .attr("font-family", "sans-serif")
               .attr("font-size", "10px")
               .attr("fill", "black");
vote = [];
// Add introduction
var instruction = d3.select(".state-chartNCEW").select('.description').select('p');
instruction.html("Whites without college degrees are the bedrock of Donald Trump's coalition: Mitt Romney carried them by more than 20 percentage points in 2012, and Trump is on pace to well exceed that showing. However, they turn out at lower rates than whites with degrees.");

// Verticle line move with mouse
rect.on('mousemove', function () {
    console.log("upper")
    tooltipPrompt.remove();
    var xPos = d3.mouse(this)[0];
    var trans = xPos-width/2;
    d3.select(".verticalLine").attr("transform", function () {
        return "translate(" + trans + ",0)";
    });
    var less = 0;
    var pos = Math.round(xPos/width*100);
    data.forEach(function(d) {
      if(d.trump<pos) less += 1;
    });
    tooltip.transition()
         .duration(200)
         .style("opacity", 1);
    var t = xScale(xPos);
    tooltip.html("<mark>" + less + " states have Trump vote lower than " + pos+"%."+"</mark>")
    .style("left", (d3.event.pageX-150) + "px")
    .style("top", (d3.event.pageY -1200) + "px")
         .style("color","black")
         .style("font-weight", "bold");
});


});
