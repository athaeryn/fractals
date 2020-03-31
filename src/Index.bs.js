'use strict';

var Css = require("bs-css-emotion/src/Css.js");
var Block = require("bs-platform/lib/js/block.js");
var Curry = require("bs-platform/lib/js/curry.js");
var React = require("react");
var Caml_obj = require("bs-platform/lib/js/caml_obj.js");
var Belt_List = require("bs-platform/lib/js/belt_List.js");
var Belt_Array = require("bs-platform/lib/js/belt_Array.js");
var ReactDOMRe = require("reason-react/src/ReactDOMRe.js");
var Belt_Option = require("bs-platform/lib/js/belt_Option.js");
var Caml_option = require("bs-platform/lib/js/caml_option.js");
var Caml_primitive = require("bs-platform/lib/js/caml_primitive.js");

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

function mod_sq(param) {
  var i = param[1];
  var r = param[0];
  return r * r + i * i;
}

var Complex = {
  add: add,
  mult: mult,
  mod_sq: mod_sq
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
    var match = mod_sq(c$1) > 4.0 || i > 200000;
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

function Index$Fractal(Props) {
  var w = Props.w;
  var h = Props.h;
  var pan = Props.pan;
  var zoom = Props.zoom;
  var grid = Belt_Array.map(Belt_Array.make(w, /* () */0), (function (param) {
          return Belt_Array.make(h, /* () */0);
        }));
  var w_f = w;
  var h_f = h;
  var pan_y = pan[1];
  var pan_x = pan[0];
  return React.createElement("table", undefined, React.createElement("tbody", undefined, Belt_Array.mapWithIndex(grid, (function (y, row) {
                        return React.createElement("tr", undefined, Belt_Array.mapWithIndex(row, (function (x, param) {
                                          var xn = remap(0, w_f, -1, 1, x);
                                          var yn = remap(0, h_f, -1, 1, y);
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

var Fractal = {
  make: Index$Fractal
};

var toolList = /* :: */[
  /* Add */0,
  /* :: */[
    /* Select */1,
    /* :: */[
      /* Move */2,
      /* :: */[
        /* Rotate */3,
        /* [] */0
      ]
    ]
  ]
];

function toolLabel(param) {
  switch (param) {
    case /* Add */0 :
        return "Add";
    case /* Select */1 :
        return "Select";
    case /* Move */2 :
        return "Move";
    case /* Rotate */3 :
        return "Rotate";
    
  }
}

function toolForKey(param) {
  switch (param) {
    case "a" :
        return /* Add */0;
    case "m" :
        return /* Move */2;
    case "r" :
        return /* Rotate */3;
    case "s" :
        return /* Select */1;
    default:
      return ;
  }
}

function inBounds(state, x, y) {
  if (x > 0 && x <= state.width && y > 0) {
    return y <= state.height;
  } else {
    return false;
  }
}

function Index$App(Props) {
  var match = React.useReducer((function (state, action) {
          switch (action.tag | 0) {
            case /* MouseDown */0 :
                if (state.stagingRect !== undefined || state.tool !== 0) {
                  return state;
                } else {
                  var y = action[1];
                  var x = action[0];
                  if (inBounds(state, x, y)) {
                    return {
                            nextId: state.nextId,
                            rects: state.rects,
                            stagingRect: {
                              id: 0,
                              w: 0,
                              h: 0,
                              rot: 0,
                              x: x,
                              y: y
                            },
                            selectedRectId: state.selectedRectId,
                            tool: state.tool,
                            width: state.width,
                            height: state.height,
                            mouse: state.mouse
                          };
                  } else {
                    return state;
                  }
                }
            case /* MouseMove */1 :
                var match = state.stagingRect;
                if (match !== undefined && state.tool === 0) {
                  var staging = match;
                  var s = Caml_primitive.caml_float_min(action[0] - staging.x, action[1] - staging.y);
                  return {
                          nextId: state.nextId,
                          rects: state.rects,
                          stagingRect: {
                            id: staging.id,
                            w: s,
                            h: s,
                            rot: staging.rot,
                            x: staging.x,
                            y: staging.y
                          },
                          selectedRectId: state.selectedRectId,
                          tool: state.tool,
                          width: state.width,
                          height: state.height,
                          mouse: state.mouse
                        };
                } else {
                  return state;
                }
            case /* MouseUp */2 :
                var match$1 = state.stagingRect;
                if (match$1 !== undefined && state.tool === 0) {
                  var staging$1 = match$1;
                  var s$1 = Caml_primitive.caml_float_min(action[0] - staging$1.x, action[1] - staging$1.y);
                  var newRect_id = state.nextId;
                  var newRect_rot = staging$1.rot;
                  var newRect_x = staging$1.x;
                  var newRect_y = staging$1.y;
                  var newRect = {
                    id: newRect_id,
                    w: s$1,
                    h: s$1,
                    rot: newRect_rot,
                    x: newRect_x,
                    y: newRect_y
                  };
                  return {
                          nextId: newRect_id + 1 | 0,
                          rects: Belt_List.add(state.rects, newRect),
                          stagingRect: undefined,
                          selectedRectId: newRect_id,
                          tool: state.tool,
                          width: state.width,
                          height: state.height,
                          mouse: state.mouse
                        };
                } else {
                  return state;
                }
            case /* SelectTool */3 :
                return {
                        nextId: state.nextId,
                        rects: state.rects,
                        stagingRect: state.stagingRect,
                        selectedRectId: state.selectedRectId,
                        tool: action[0],
                        width: state.width,
                        height: state.height,
                        mouse: state.mouse
                      };
            case /* SelectRect */4 :
                return {
                        nextId: state.nextId,
                        rects: state.rects,
                        stagingRect: state.stagingRect,
                        selectedRectId: action[0],
                        tool: state.tool,
                        width: state.width,
                        height: state.height,
                        mouse: state.mouse
                      };
            
          }
        }), {
        nextId: 1,
        rects: /* [] */0,
        stagingRect: undefined,
        selectedRectId: undefined,
        tool: /* Add */0,
        width: 800,
        height: 800,
        mouse: /* tuple */[
          0,
          0
        ]
      });
  var dispatch = match[1];
  var state = match[0];
  var svgRef = React.useRef(null);
  var svgRect = React.useRef(new DOMRect(0, 0, 800, 800));
  var mouseXY = React.useRef(/* tuple */[
        0,
        0
      ]);
  React.useEffect((function () {
          Belt_Option.forEach(Caml_option.nullable_to_opt(svgRef.current), (function (node) {
                  var rect = node.getBoundingClientRect();
                  svgRect.current = rect;
                  return /* () */0;
                }));
          return ;
        }), /* array */[svgRef]);
  React.useEffect((function () {
          var handler = function (e) {
            return Belt_Option.forEach(toolForKey(e.key), (function (tool) {
                          return Curry._1(dispatch, /* SelectTool */Block.__(3, [tool]));
                        }));
          };
          document.addEventListener("keydown", handler);
          return (function (param) {
                    document.removeEventListener("keydown", handler);
                    return /* () */0;
                  });
        }), ([]));
  React.useEffect((function () {
          var handler = function (e) {
            var svgRectX = svgRect.current.x;
            var svgRectY = svgRect.current.y;
            var x = e.clientX - svgRectX;
            var y = e.clientY - svgRectY;
            mouseXY.current = /* tuple */[
              x,
              y
            ];
            Curry._1(dispatch, /* MouseMove */Block.__(1, [
                    x,
                    y
                  ]));
            console.log("mouse move", /* tuple */[
                  x,
                  y
                ]);
            return /* () */0;
          };
          document.addEventListener("mousemove", handler);
          return (function (param) {
                    document.removeEventListener("mousemove", handler);
                    return /* () */0;
                  });
        }), ([]));
  React.useEffect((function () {
          var handler = function (_e) {
            var match = mouseXY.current;
            var y = match[1];
            var x = match[0];
            console.log("mouse down", /* tuple */[
                  x,
                  y
                ]);
            return Curry._1(dispatch, /* MouseDown */Block.__(0, [
                          x,
                          y
                        ]));
          };
          document.addEventListener("mousedown", handler);
          return (function (param) {
                    document.removeEventListener("mousedown", handler);
                    return /* () */0;
                  });
        }), ([]));
  React.useEffect((function () {
          var handler = function (_e) {
            var match = mouseXY.current;
            var y = match[1];
            var x = match[0];
            console.log("mouse up", /* tuple */[
                  x,
                  y
                ]);
            return Curry._1(dispatch, /* MouseUp */Block.__(2, [
                          x,
                          y
                        ]));
          };
          document.addEventListener("mouseup", handler);
          return (function (param) {
                    document.removeEventListener("mouseup", handler);
                    return /* () */0;
                  });
        }), ([]));
  return React.createElement("div", {
              className: Curry._1(Css.style, /* :: */[
                    Css.display(/* flex */-1010954439),
                    /* :: */[
                      Css.flexDirection(/* column */-963948842),
                      /* :: */[
                        Css.backgroundColor(/* `hex */[
                              5194459,
                              "1a1a1a"
                            ]),
                        /* :: */[
                          Css.color(Css.gainsboro),
                          /* :: */[
                            Css.width(/* `vw */[
                                  26433,
                                  100
                                ]),
                            /* :: */[
                              Css.height(/* `vh */[
                                    26418,
                                    100
                                  ]),
                              /* :: */[
                                Css.display(/* grid */-999565626),
                                /* :: */[
                                  Css.gridTemplateColumns(/* :: */[
                                        /* `fr */[
                                          22860,
                                          1
                                        ],
                                        /* :: */[
                                          /* `rem */[
                                            5691738,
                                            20
                                          ],
                                          /* [] */0
                                        ]
                                      ]),
                                  /* :: */[
                                    Css.gridTemplateRows(/* :: */[
                                          /* `rem */[
                                            5691738,
                                            2
                                          ],
                                          /* :: */[
                                            /* `fr */[
                                              22860,
                                              1
                                            ],
                                            /* [] */0
                                          ]
                                        ]),
                                    /* :: */[
                                      Css.gridGap(/* `rem */[
                                            5691738,
                                            1
                                          ]),
                                      /* :: */[
                                        Css.padding(/* `rem */[
                                              5691738,
                                              1
                                            ]),
                                        /* [] */0
                                      ]
                                    ]
                                  ]
                                ]
                              ]
                            ]
                          ]
                        ]
                      ]
                    ]
                  ])
            }, React.createElement("div", {
                  className: Curry._1(Css.style, /* :: */[
                        Css.border(/* `px */[
                              25096,
                              1
                            ], /* solid */12956715, Css.purple),
                        /* :: */[
                          Css.gridRowStart(1),
                          /* :: */[
                            Css.gridColumn(1, -1),
                            /* :: */[
                              Css.display(Css.grid),
                              /* :: */[
                                Css.gridAutoFlow(/* column */-963948842),
                                /* :: */[
                                  Css.gridAutoColumns(/* maxContent */60557045),
                                  /* :: */[
                                    Css.gridGap(/* `rem */[
                                          5691738,
                                          1
                                        ]),
                                    /* :: */[
                                      Css.alignItems(/* center */98248149),
                                      /* [] */0
                                    ]
                                  ]
                                ]
                              ]
                            ]
                          ]
                        ]
                      ])
                }, Belt_List.toArray(Belt_List.map(toolList, (function (tool) {
                            var match = tool === state.tool;
                            return React.createElement("button", {
                                        key: toolLabel(tool),
                                        className: Curry._1(Css.style, /* :: */[
                                              Css.unsafe("all", "unset"),
                                              /* :: */[
                                                Css.padding2(/* `rem */[
                                                      5691738,
                                                      0.25
                                                    ], /* `rem */[
                                                      5691738,
                                                      0.5
                                                    ]),
                                                /* :: */[
                                                  Css.border(/* `px */[
                                                        25096,
                                                        1
                                                      ], /* solid */12956715, Css.white),
                                                  /* :: */[
                                                    Css.borderRadius(/* `px */[
                                                          25096,
                                                          2
                                                        ]),
                                                    /* :: */[
                                                      Css.backgroundColor(match ? /* `hex */[
                                                              5194459,
                                                              "333333"
                                                            ] : /* transparent */582626130),
                                                      /* [] */0
                                                    ]
                                                  ]
                                                ]
                                              ]
                                            ]),
                                        onClick: (function (e) {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            return Curry._1(dispatch, /* SelectTool */Block.__(3, [tool]));
                                          })
                                      }, toolLabel(tool));
                          })))), React.createElement("div", {
                  className: Curry._1(Css.style, /* :: */[
                        Css.border(/* `px */[
                              25096,
                              1
                            ], /* solid */12956715, Css.blueviolet),
                        /* :: */[
                          Css.gridRowStart(2),
                          /* :: */[
                            Css.gridColumnStart(2),
                            /* [] */0
                          ]
                        ]
                      ])
                }, React.createElement("div", undefined, "layers"), React.createElement("ul", {
                      className: Curry._1(Css.style, /* [] */0)
                    }, Belt_List.toArray(Belt_List.map(state.rects, (function (rect) {
                                var isSelected = Caml_obj.caml_equal(state.selectedRectId, rect.id);
                                return React.createElement("div", {
                                            className: Curry._1(Css.style, /* :: */[
                                                  Css.display(/* flex */-1010954439),
                                                  /* :: */[
                                                    Css.justifyContent(/* spaceBetween */516682146),
                                                    /* :: */[
                                                      Css.padding2(/* `rem */[
                                                            5691738,
                                                            0.25
                                                          ], /* `rem */[
                                                            5691738,
                                                            1
                                                          ]),
                                                      /* [] */0
                                                    ]
                                                  ]
                                                ]),
                                            id: String(rect.id)
                                          }, React.createElement("span", {
                                                className: Curry._1(Css.style, /* :: */[
                                                      Css.borderBottom(/* `px */[
                                                            25096,
                                                            1
                                                          ], /* solid */12956715, isSelected ? Css.goldenrod : Css.transparent),
                                                      /* [] */0
                                                    ])
                                              }, "Layer " + String(rect.id)), React.createElement("button", {
                                                className: Curry._1(Css.style, /* :: */[
                                                      Css.color(isSelected ? Css.white : Css.black),
                                                      /* :: */[
                                                        Css.backgroundColor(isSelected ? Css.goldenrod : Css.slategrey),
                                                        /* [] */0
                                                      ]
                                                    ]),
                                                onClick: (function (e) {
                                                    e.stopPropagation();
                                                    return Curry._1(dispatch, /* SelectRect */Block.__(4, [rect.id]));
                                                  })
                                              }, "Select"));
                              }))))), React.createElement("div", {
                  className: Curry._1(Css.style, /* :: */[
                        Css.gridColumnStart(1),
                        /* :: */[
                          Css.gridRowStart(2),
                          /* :: */[
                            Css.display(/* flex */-1010954439),
                            /* :: */[
                              Css.justifyContent(/* center */98248149),
                              /* :: */[
                                Css.alignItems(/* center */98248149),
                                /* [] */0
                              ]
                            ]
                          ]
                        ]
                      ])
                }, React.createElement("svg", {
                      ref: svgRef,
                      className: Curry._1(Css.style, /* :: */[
                            Css.border(/* `px */[
                                  25096,
                                  1
                                ], /* solid */12956715, Css.white),
                            /* :: */[
                              Css.maxWidth(/* `percent */[
                                    -119887163,
                                    100
                                  ]),
                              /* :: */[
                                Css.height(/* auto */-1065951377),
                                /* [] */0
                              ]
                            ]
                          ]),
                      height: String(state.height),
                      width: String(state.width)
                    }, Belt_Option.getWithDefault(Belt_Option.map(state.stagingRect, (function (rect) {
                                return React.createElement("rect", {
                                            key: String(rect.id),
                                            height: rect.h.toString(),
                                            width: rect.w.toString(),
                                            fill: "none",
                                            stroke: "cadetblue",
                                            strokeWidth: "1",
                                            x: rect.x.toString(),
                                            y: rect.y.toString()
                                          });
                              })), null), Belt_List.toArray(Belt_List.map(state.rects, (function (rect) {
                                var match = Caml_obj.caml_equal(state.selectedRectId, rect.id);
                                return React.createElement("rect", {
                                            key: String(rect.id),
                                            height: rect.h.toString(),
                                            width: rect.w.toString(),
                                            fill: "none",
                                            stroke: match ? "goldenrod" : "gainsboro",
                                            strokeWidth: "1",
                                            x: rect.x.toString(),
                                            y: rect.y.toString()
                                          });
                              }))))));
}

var App = {
  inBounds: inBounds,
  make: Index$App
};

ReactDOMRe.renderToElementWithId(React.createElement(Index$App, { }), "root");

exports.Complex = Complex;
exports.remap = remap;
exports.Mandelbrot = Mandelbrot;
exports.Fractal = Fractal;
exports.toolList = toolList;
exports.toolLabel = toolLabel;
exports.toolForKey = toolForKey;
exports.App = App;
/*  Not a pure module */
