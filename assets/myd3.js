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

function updateMap(currentY) {
  map.updateChoropleth(null, {reset: true});
  let doc = {};
  let objCountry = {};
  x.open("GET", `https://stark-tor-75212.herokuapp.com/api/co2/year?year=${currentY}`, true);
  x.onreadystatechange = function () {
    if (x.readyState == 4 && x.status == 200)
    {
      doc = JSON.parse(x.responseText);
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
  };
  x.send();
}

updateMap(2014);
var slider = document.getElementById("myRange");
var output = document.getElementById("curYear");
output.innerHTML = slider.value; // Display the default slider value

// Update the current slider value (each time you drag the slider handle)
slider.oninput = function() {
    output.innerHTML = this.value;
    updateMap(this.value);
}