function shadeColor1(color, percent) {  // deprecated. See below.
  var num = parseInt(color.slice(1),16), amt = Math.round(2.55 * percent), R = (num >> 16) + amt, G = (num >> 8 & 0x00FF) + amt, B = (num & 0x0000FF) + amt;
  return "#" + (0x1000000 + (R<255?R<1?0:R:255)*0x10000 + (G<255?G<1?0:G:255)*0x100 + (B<255?B<1?0:B:255)).toString(16).slice(1);
}

let x = new XMLHttpRequest();
let doc = {};
x.open("GET", "assets/test.xml", true);
x.onreadystatechange = function () {
  if (x.readyState == 4 && x.status == 200)
  {
    doc = x.responseXML;
  }
};
x.send(null);

const defaultC = '#ABDDA4';

let map = new Datamap({
  element: document.getElementById('map'),
  projection: 'mercator',
  fills: {
    defaultFill: "#ABDDA4",
    authorHasTraveledTo: "#fa0fa0"
  },
  data: {
    USA: { fillKey: "authorHasTraveledTo" },
    JPN: { fillKey: "authorHasTraveledTo" },
    ITA: { fillKey: "authorHasTraveledTo" },
    CN: { fillKey: "authorHasTraveledTo" },
    KOR: { fillKey: "authorHasTraveledTo" },
    DEU: { fillKey: "authorHasTraveledTo" },
  }
});

var colors = d3.scale.category10();

window.setInterval(function() {
  map.updateChoropleth({
    USA: shadeColor1(defaultC, Math.random() * -20),
    RUS: shadeColor1(defaultC, Math.random() * -20),
    AUS: shadeColor1(defaultC, Math.random() * -20),
    BRA: shadeColor1(defaultC, Math.random() * -20),
    CAN: shadeColor1(defaultC, Math.random() * -20),
    CHN: shadeColor1(defaultC, Math.random() * -20),
    IND: shadeColor1(defaultC, Math.random() * -20)
  });
}, 2000);