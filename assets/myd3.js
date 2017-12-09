function maxOf(array) {
  let max = 0;
  for (let i = 0; i < array.length; i++) {
    if (array[i].co2 > max) {
      max = array[i].co2;
    }
  }
  return max;
}

function minOf(array, maxi) {
  let max = maxi;
  for (let i = 0; i < array.length; i++) {
    if (array[i].co2 < max) {
      max = array[i].co2;
    }
  }
  return max;
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
  x.open("GET", `assets/data${currentY}.json`, true);
  x.onreadystatechange = function () {
    if (x.readyState == 4 && x.status == 200)
    {
      doc = JSON.parse(x.responseText);
      const maxCo2 = maxOf(doc.countries);
      const minCo2 = minOf(doc.countries, maxCo2);

      // create color palette function
      // color can be whatever you wish
      let paletteScale = d3.scale.linear()
      .domain([minCo2,maxCo2])
      .range(["#EFEFFF","#02386F"]); // blue color

      for (let i = 0; i < doc.countries.length; i++) {
        objCountry[doc.countries[i].countryCode] =  { numberOfThings: doc.countries[i].co2, fillColor: paletteScale(doc.countries[i].co2) };
      }
      map.updateChoropleth(objCountry);
    }
  };
  x.send();
}

updateMap(2017);
var slider = document.getElementById("myRange");
var output = document.getElementById("curYear");
output.innerHTML = slider.value; // Display the default slider value

// Update the current slider value (each time you drag the slider handle)
slider.oninput = function() {
    output.innerHTML = this.value;
    updateMap(this.value);
}