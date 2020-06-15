'use strict';

var React = require("react");
var Belt_Array = require("bs-platform/lib/js/belt_Array.js");
var Math$ReasonReactExamples = require("./Math.bs.js");
var Complex$ReasonReactExamples = require("./Complex.bs.js");

function testIterations(c) {
  var _c = /* tuple */[
    0,
    0
  ];
  var _i = 0;
  while(true) {
    var i = _i;
    var c$1 = _c;
    if (Complex$ReasonReactExamples.mod_sq(c$1) > 4.0 || i > 200000) {
      return i;
    }
    _i = i + 1 | 0;
    _c = Complex$ReasonReactExamples.add(Complex$ReasonReactExamples.mult(c$1, c$1), c);
    continue ;
  };
}

var Mandelbrot = {
  testIterations: testIterations
};

function Fractal(Props) {
  var w = Props.w;
  var h = Props.h;
  var pan = Props.pan;
  var zoom = Props.zoom;
  var grid = Belt_Array.map(Belt_Array.make(w, undefined), (function (param) {
          return Belt_Array.make(h, undefined);
        }));
  var w_f = w;
  var h_f = h;
  var pan_y = pan[1];
  var pan_x = pan[0];
  return React.createElement("table", undefined, React.createElement("tbody", undefined, Belt_Array.mapWithIndex(grid, (function (y, row) {
                        return React.createElement("tr", undefined, Belt_Array.mapWithIndex(row, (function (x, param) {
                                          var xn = Math$ReasonReactExamples.remap(0, w_f, -1, 1, x);
                                          var yn = Math$ReasonReactExamples.remap(0, h_f, -1, 1, y);
                                          var iters = testIterations(/* tuple */[
                                                xn / zoom + pan_x,
                                                yn / zoom + pan_y
                                              ]);
                                          var lightness = iters * 20 % 100;
                                          var hue = iters / 1.618;
                                          return React.createElement("td", {
                                                      style: {
                                                        backgroundColor: "hsl(" + (String(hue) + (", 100%, " + (String(lightness) + "%)"))),
                                                        height: "2px",
                                                        width: "2px"
                                                      }
                                                    });
                                        })));
                      }))));
}

var make = Fractal;

exports.Mandelbrot = Mandelbrot;
exports.make = make;
/* react Not a pure module */
