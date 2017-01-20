## threedna - draw cartoon DNA molecules

threedna is a small javascript that draws cartoon DNA molecules in 3D on a canvas.

### Usage

* include three.js and threedna.js in your html page
* set id for an element on your page, and call threedna, e.g.
```javascript
const threeDNAConfig = {
  element: "canvas",
  noOfObjects: 50,
  objectColor: 0xF47D20,
  bgColor: 0x0B0158,
  rain: true
};
var tdna = new ThreeDNA(threeDNAConfig);
```

