function maxOf(array) {
  let max = 0;
  for (let i = 0; i < array.length; i++) {
    if (array[i].value > max) {
      max = array[i].value;
    }
  }
  return max;
}

function minOf(array, maxi) {
  let min = maxi;
  for (let i = 0; i < array.length; i++) {
    if (array[i].value < min) {
      min = array[i].value;
    }
  }
  return min;
}

const numberWithCommas = (x) => {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "'");
}

let x = new XMLHttpRequest();
const defaultC = '#F8E0E0';

let map = new Datamap({
  element: document.getElementById('map'),
  projection: 'mercator',
  fills: {
    defaultFill: "#BDBDBD",
  },
  geographyConfig: {
    borderColor: '#DEDEDE',
    highlightBorderWidth: 2,
    // don't change color on mouse hover
    highlightFillColor: function(geo) {
        return geo['fillColor'] || '#F5F5F5';
    },
    // only change border
    highlightBorderColor: '#B7B7B7',
    // show desired information in tooltip
    popupTemplate: function(geo, data) {
        // don't show tooltip if country don't present in dataset
        if (!data) { return ; }
        // tooltip content
        return ['<div class="hoverinfo">',
            '<strong>', geo.properties.name, '</strong>',
            '<br>CO2 emission (kt): <strong>', numberWithCommas(data.numberOfThings), '</strong>',
            '</div>'].join('');
    }
  }
});

dataSaver = {};

function prepareMap(doc) {
  let objCountry = {};
  const maxCo2 = maxOf(doc);
  const minCo2 = minOf(doc, maxCo2);

  // create color palette function
  // color can be whatever you wish
  if (minCo2 != 0 && maxCo2 != 0) {
    let paletteScale = d3.scale.linear()
    .domain([minCo2,maxCo2])
    .range(["#E0E0F8","#08088A"]); // blue color

    for (let i = 0; i < doc.length; i++) {
      if (doc[i].countryCode !== "" && doc[i].value !== null) {
        objCountry[doc[i].countryCode] =  { numberOfThings: doc[i].value, fillColor: paletteScale(doc[i].value) };
      }
    }
    map.updateChoropleth(objCountry);
  }
}

function updateMap(currentY) {
  let doc = {};
  map.updateChoropleth(null, {reset: true});
  if(dataSaver[`${currentY}`] === undefined) {
    x.open("GET", `https://stark-tor-75212.herokuapp.com/api/co2/year?year=${currentY}`, true);
    x.onreadystatechange = function () {
      if (x.readyState == 4 && x.status == 200)
      {
        doc = JSON.parse(x.responseText);
        dataSaver[`${currentY}`] = doc;
        prepareMap(doc);
      }
    };
    x.send();
  } else {
    prepareMap(dataSaver[`${currentY}`]);
  }
}

function prepareChart(x, y, valueline, xAxis, yAxis, svg, height, dataClean) {
  x.domain(d3.extent(dataClean, function(d) { return d.year; }));
  y.domain([0, d3.max(dataClean, function(d) { return d.value; })]);

  svg.append("path")
      .attr("class", "line")
      .attr("d", valueline(dataClean));

  svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis);

  svg.append("g")
      .attr("class", "y axis")
      .call(yAxis);
}

function createLineChart(country) {
  var margin = {top: 30, right: 20, bottom: 30, left: 50},
  width = 600 - margin.left - margin.right,
  height = 270 - margin.top - margin.bottom;


  var x = d3.time.scale().range([0, width]);
  var y = d3.scale.linear().range([height, 0]);

  var xAxis = d3.svg.axis().scale(x)
  .orient("bottom").ticks(8);

  var yAxis = d3.svg.axis().scale(y)
  .orient("left").ticks(5);

  var valueline = d3.svg.line()
  .x(function(d) { return x(d.year); })
  .y(function(d) { return y(d.value); });

  var svg = d3.select("#mysvg")
  .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
  .append("g")
      .attr("transform", 
            "translate(" + margin.left + "," + margin.top + ")");

  if (dataSaver[`${country}`] === undefined) {
    d3.json(`https://stark-tor-75212.herokuapp.com/api/co2/country?country=${country}`, function(error, data) {
      dataClean = [];
      data.forEach(function(d) {
        if(d.value !== null) {
          dataClean.push({year: d.year, value: d.value});
        }
      });
      dataSaver[`${country}`] = dataClean;
      prepareChart(x, y, valueline, xAxis, yAxis, svg, height, dataClean);
    });
  } else {
    prepareChart(x, y, valueline, xAxis, yAxis, svg, height, dataSaver[`${country}`]);
  }
}

updateMap(2014);
createLineChart("China");

var select = document.getElementById("countryChoice");
var slider = document.getElementById("myRange");
var output = document.getElementById("curYear");
output.innerHTML = slider.value; // Display the default slider value

// Update the current slider value (each time you drag the slider handle)
slider.oninput = function() {
    output.innerHTML = this.value;
    updateMap(this.value);
}

select.onchange = () => {
  document.getElementById("mysvg").innerHTML = '';
  createLineChart(select[select.selectedIndex].value);
}