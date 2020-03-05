'use strict';

var $$Array = require("bs-platform/lib/js/array.js");
var React = require("react");
var ReactDOMRe = require("reason-react/src/ReactDOMRe.js");

function add(param, param$1) {
  return /* tuple */[
          param[0] + param$1[0],
          param[1] + param$1[1]
        ];
}

function mult(param, param$1) {
  var d = param$1[1];
  var c = param$1[0];
  var b = param[1];
  var a = param[0];
  return /* tuple */[
          a * c - b * d,
          a * d + b * c
        ];
}

function mod_(param) {
  var i = param[1];
  var r = param[0];
  return r * r + i * i;
}

var Complex = {
  add: add,
  mult: mult,
  mod_: mod_
};

function remap(low1, high1, low2, high2, value) {
  return low2 + (value - low1) * (high2 - low2) / (high1 - low1);
}

function testIterations(c) {
  var _c = /* tuple */[
    0,
    0
  ];
  var c0 = c;
  var _i = 0;
  while(true) {
    var i = _i;
    var c$1 = _c;
    var match = mod_(c$1) > 4 || i > 100;
    if (match) {
      return i;
    } else {
      _i = i + 1 | 0;
      _c = add(mult(c$1, c$1), c0);
      continue ;
    }
  };
}

var Mandelbrot = {
  testIterations: testIterations
};

function Index$App(Props) {
  var w = Props.w;
  var h = Props.h;
  var grid = $$Array.make_matrix(w, h, /* () */0);
  var w_f = w;
  var h_f = h;
  return React.createElement("table", undefined, React.createElement("tbody", undefined, $$Array.mapi((function (y, row) {
                        return React.createElement("tr", undefined, $$Array.mapi((function (x, param) {
                                          var xn = remap(0, w_f, -2, 1, x);
                                          var yn = remap(0, h_f, -1, 1, y);
                                          var iters = testIterations(/* tuple */[
                                                xn - 0.25,
                                                yn
                                              ]);
                                          var lightness = 100 - (
                                            iters < 100 ? iters : 100
                                          ) | 0;
                                          return React.createElement("td", {
                                                      style: {
                                                        backgroundColor: "hsl(0, 0%, " + (String(lightness) + "%)"),
                                                        height: "3px",
                                                        width: "3px"
                                                      }
                                                    });
                                        }), row));
                      }), grid)));
}

var App = {
  make: Index$App
};

ReactDOMRe.renderToElementWithId(React.createElement(Index$App, {
          w: 128,
          h: 128
        }), "root");

exports.Complex = Complex;
exports.remap = remap;
exports.Mandelbrot = Mandelbrot;
exports.App = App;
/*  Not a pure module */
