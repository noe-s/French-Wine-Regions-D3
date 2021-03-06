/* Wine region map
Author: Noé Schultz
Date started: 4/21/20


Things to do:
-Sub region zoom
  - possible new zoom layer with on-hover and on-click functions
  - outline grape varieties, label sub-regions (on-hover?)
-Write wine text
  -Write text outlining characteristics & history of various regions
  -Change text value based on active region clicked.


*/

var width = 500,
height = 500,
centered;

var projection = d3.geo.conicConformalFrance()
  .translate([width, height/2]);

var path = d3.geo.path()
  .projection(projection);

var svg = d3.select("#map_container").append("svg")
.attr("width", width)
.attr("height", height);

//Background
svg.append("rect")
  .attr("class", "background")
  .attr("fill", "white")
  .attr("width", width)
  .attr("height", height)
  .on("click", clicked)

var g = svg.append("g");
var regions = svg.append("g");
var labels = svg.append("g").attr("class", "region-labels");

const regionsLabeled = [];
const labelRegion = (label) => {
  if (regionsLabeled.includes(label)) {
    return '';
  }

  regionsLabeled.push(label);
  return label;
};


d3.json("https://raw.githubusercontent.com/gregoiredavid/france-geojson/master/regions-version-simplifiee.geojson", function(error, data) {
if(error) { throw error };
//console.log(data.features[0].properties.nom)
g.append("g")
  .attr("id", "nom")
  .selectAll("path")
  .data(data.features)
  .enter()
  .append("path")
  .attr("d", path)
  // .on("click", clicked)
  .style("stroke","#fff")
  .style("stroke-width",".1px")
  .style("fill","#aca");
  // .on("mouseover", function(d,i) {
  //   d3.select(this)
  //     .transition()
  //     .style("fill", "red");
  //   })
  // .on("mouseout", function(d,i) {
  //   d3.select(this)
  //     .transition()
  //     .style("fill", "#aca");
  //   });

});
/*
TO DO

-Colour region by data.features.region (?)


*/
d3.json("../data/regions.geojson", function(error, data) {
  if(error) { throw error };

    g.append("g")
      .attr("id", "wine-regions")
      .selectAll("path")
        .data(data.features)
      .enter().append("path")
        .attr("d", path)
        // .on("click", clicked)
      .style("fill", function(d) {
        if(d.properties.region === "Rhône") {
          //console.log(d.geometry.coordinates)
          return "pink";
        } else if (d.properties.region === "Bordeaux") {
          return "#5F021F"
        } else if(d.properties.region === "Champagne") {
          return "F7E7CE"
        } else if(d.properties.region === "Bourgogne") {
          return "purple"
        } else if(d.properties.region === "Languedoc-Roussillon") {
          return "green"
        } else if(d.properties.region === "Alsace") {
          return "red"
        } else if(d.properties.region === "Loire") {
          return "#34eba8"
        } else if(d.properties.region === "Provence") {
          return "orange"
        } else if(d.properties.region === "Dordogne") {
          return "grey"
        }
      })
      .style("stroke","#ffffff")
      .style("stroke-width",".1px");
      // .style("fill", "#")
    g.append("path")
      .datum(topojson.mesh(data, data.features, function(a, b) { return a !== b; }))
      //.attr("id", "wine-regions")
      .attr("id","wine-regions")
      .attr("d", path);

    g.selectAll(".region-labels")
      .data(data.features)
      .enter().append("text")
      .attr("class","region-labels")
      .attr("transform", function(d) { 
        return "translate(" + projection(d.geometry.coordinates[0][0]) + ")"; })
      .attr("dy",".35em")
      .attr("font-size", "10px")
      // .attr("stroke", "#ffffff")
      // .attr("stroke-width",".05px")
      .attr("text-anchor", function(d) {
        if(labelRegion(d.properties.region === 'Languedoc-Roussillon')) {
          return "end"
        } else {
          return "left"
        }
      })
      .on("click", clicked)
      //.attr("onclick","loadText()")
      .text(function(d,i) { return labelRegion(d.properties.region); });


    //Button Events Work in progress, only zooms to Bordeaux for now...
    // d3.select("#bordeaux")
    // .on("click", function() {
    //   console.log("Bordeaux!" + data.features.region)

    //   clicked(data)
    // });
    // d3.select("#loire")
    // .on("click", function() {
    //   console.  ("Loire!")
    //   clicked(data)
    // });
    // d3.select("#languedoc")
    // .on("click", function() {
    //   console.log("Lang!")
    //   clicked(data)
    // });


});

function clicked(d) {
  var x, y, k;

  if (d && centered !== d) {
    var centroid = path.centroid(d);
    x = centroid[0];
    y = centroid[1];
    k = 4;
    centered = d;
  } else {
    x = width / 2;
    y = height / 2;
    k = 1;
    centered = null;
  }

  g.selectAll("path")
      .classed("active", centered && function(d) { return d === centered; });

  g.transition()
      .duration(750)
      .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")scale(" + k + ")translate(" + -x + "," + -y + ")")
      .style("stroke-width", 1.5 / k + "px");

  if(document.getElementById("region-header").innerText.length < 1) {
    document.getElementById("region-header").innerText = d.properties.region;
  } else {
    document.getElementById("region-header").innerText = '';
  }

  //console.log(d.properties)

    //Select appropriate text file for wine region info.
    var xhr = new XMLHttpRequest;
    xhr.open('GET', '../text/' + d.properties.region, true);
    xhr.onload = function (){
      if(document.getElementById("description").innerText.length < 1 ) {
        document.getElementById("description").innerText = xhr.responseText;
      } else {
        document.getElementById("description").innerText = ''
      }
    };
    xhr.send(null);

  /* TO DO
  -Make function to adapt text elem (class="region-header") in html to equal d.properties.regions

  */
}

//NEEDS functionality for reading region with class .active, and showing appropriate text file
//Also if .active is true, disappear on the next click
// function loadText(){ 
//     var xhr = new XMLHttpRequest;
//   xhr.open('GET', '../text/Bordeaux', true);
//   xhr.onload = function (){
//       if(document.getElementById("description").innerText.length < 1) { //if innerHTML for <p/> is lt 1, input bdx.text
//         document.getElementById("description").innerText = xhr.responseText; 
//       } else {
//         document.getElementById("description").innerText = ''
//       } 
//   };
//   xhr.send(null);
//   console.log("Text loaded")
// }
