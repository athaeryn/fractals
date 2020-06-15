'use strict';

var Css = require("bs-css-emotion/src/Css.js");
var Block = require("bs-platform/lib/js/block.js");
var Curry = require("bs-platform/lib/js/curry.js");
var React = require("react");
var Recoil = require("recoil");
var Caml_obj = require("bs-platform/lib/js/caml_obj.js");
var Belt_List = require("bs-platform/lib/js/belt_List.js");
var ReactDOMRe = require("reason-react/src/legacy/ReactDOMRe.bs.js");
var Belt_Option = require("bs-platform/lib/js/belt_Option.js");
var Caml_option = require("bs-platform/lib/js/caml_option.js");
var Caml_primitive = require("bs-platform/lib/js/caml_primitive.js");
var Tool$ReasonReactExamples = require("./Tool.bs.js");
var State$ReasonReactExamples = require("./State.bs.js");

var toolbarOrder = /* :: */[
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

function Index$RectDisplay(Props) {
  var id = Props.id;
  var rect = Recoil.useRecoilValue(Curry._1(State$ReasonReactExamples.RectState.byId, id));
  var isDragging = Recoil.useRecoilValue(State$ReasonReactExamples.isDragging);
  var selectedRectId = Recoil.useRecoilValue(State$ReasonReactExamples.selectedRectId);
  var selected = Caml_obj.caml_equal(id, selectedRectId);
  var tmp = {
    key: String(id),
    height: rect.h.toString(),
    width: rect.w.toString(),
    fill: "none",
    stroke: selected ? "goldenrod" : "gainsboro",
    strokeWidth: "1",
    x: rect.x.toString(),
    y: rect.y.toString()
  };
  var tmp$1 = selected && isDragging ? "1 2" : undefined;
  if (tmp$1 !== undefined) {
    tmp.strokeDasharray = Caml_option.valFromOption(tmp$1);
  }
  return React.createElement("rect", tmp);
}

var RectDisplay = {
  make: Index$RectDisplay
};

function inBounds(state, x, y) {
  if (x > 0 && x <= state.width && y > 0) {
    return y <= state.height;
  } else {
    return false;
  }
}

function startDrag(state, x, y) {
  return {
          nextId: state.nextId,
          rects: state.rects,
          stagingRect: state.stagingRect,
          selectedRectId: state.selectedRectId,
          gesture: {
            initialX: x,
            initialY: y,
            currentX: x,
            currentY: y
          },
          tool: state.tool,
          width: state.width,
          height: state.height,
          mouse: state.mouse
        };
}

function updateDrag(state, x, y) {
  return {
          nextId: state.nextId,
          rects: state.rects,
          stagingRect: state.stagingRect,
          selectedRectId: state.selectedRectId,
          gesture: Belt_Option.map(state.gesture, (function (gesture) {
                  return {
                          initialX: gesture.initialX,
                          initialY: gesture.initialY,
                          currentX: x,
                          currentY: y
                        };
                })),
          tool: state.tool,
          width: state.width,
          height: state.height,
          mouse: state.mouse
        };
}

function cancelDrag(state) {
  return {
          nextId: state.nextId,
          rects: state.rects,
          stagingRect: state.stagingRect,
          selectedRectId: state.selectedRectId,
          gesture: undefined,
          tool: state.tool,
          width: state.width,
          height: state.height,
          mouse: state.mouse
        };
}

function Index$App(Props) {
  var appState = Recoil.useRecoilValue(State$ReasonReactExamples.appState);
  var match = React.useReducer((function (state, action) {
          switch (action.tag | 0) {
            case /* MouseDown */0 :
                if (state.stagingRect !== undefined) {
                  return state;
                }
                var match = state.tool;
                if (match >= 3) {
                  return state;
                }
                var y = action[1];
                var x = action[0];
                switch (match) {
                  case /* Add */0 :
                      if (!inBounds(state, x, y)) {
                        return state;
                      }
                      var init = startDrag(state, x, y);
                      return {
                              nextId: init.nextId,
                              rects: init.rects,
                              stagingRect: {
                                id: 0,
                                w: 0,
                                h: 0,
                                rot: 0,
                                x: x,
                                y: y
                              },
                              selectedRectId: init.selectedRectId,
                              gesture: init.gesture,
                              tool: init.tool,
                              width: init.width,
                              height: init.height,
                              mouse: init.mouse
                            };
                  case /* Select */1 :
                      return state;
                  case /* Move */2 :
                      if (!inBounds(state, x, y)) {
                        return state;
                      }
                      var stagingRect = Belt_List.getBy(state.rects, (function (param) {
                              return Caml_obj.caml_equal(state.selectedRectId, param.id);
                            }));
                      var init$1 = startDrag(state, x, y);
                      return {
                              nextId: init$1.nextId,
                              rects: init$1.rects,
                              stagingRect: stagingRect,
                              selectedRectId: init$1.selectedRectId,
                              gesture: init$1.gesture,
                              tool: init$1.tool,
                              width: init$1.width,
                              height: init$1.height,
                              mouse: init$1.mouse
                            };
                  
                }
            case /* MouseMove */1 :
                var staging = state.stagingRect;
                if (staging === undefined) {
                  return state;
                }
                var match$1 = state.tool;
                if (match$1 >= 3) {
                  return state;
                }
                var y$1 = action[1];
                var x$1 = action[0];
                switch (match$1) {
                  case /* Add */0 :
                      var s = Caml_primitive.caml_float_min(x$1 - staging.x, y$1 - staging.y);
                      var init$2 = updateDrag(state, x$1, y$1);
                      return {
                              nextId: init$2.nextId,
                              rects: init$2.rects,
                              stagingRect: {
                                id: staging.id,
                                w: s,
                                h: s,
                                rot: staging.rot,
                                x: staging.x,
                                y: staging.y
                              },
                              selectedRectId: init$2.selectedRectId,
                              gesture: init$2.gesture,
                              tool: init$2.tool,
                              width: init$2.width,
                              height: init$2.height,
                              mouse: init$2.mouse
                            };
                  case /* Select */1 :
                      return state;
                  case /* Move */2 :
                      var state$prime = updateDrag(state, x$1, y$1);
                      var selctedRect = Belt_List.getBy(state$prime.rects, (function (param) {
                              return Caml_obj.caml_equal(state$prime.selectedRectId, param.id);
                            }));
                      var match$2 = state$prime.gesture;
                      var match$3 = selctedRect !== undefined && match$2 !== undefined ? /* tuple */[
                          selctedRect.x + match$2.currentX - match$2.initialX,
                          selctedRect.y + match$2.currentY - match$2.initialY
                        ] : /* tuple */[
                          x$1,
                          y$1
                        ];
                      return {
                              nextId: state$prime.nextId,
                              rects: state$prime.rects,
                              stagingRect: {
                                id: staging.id,
                                w: staging.w,
                                h: staging.h,
                                rot: staging.rot,
                                x: match$3[0],
                                y: match$3[1]
                              },
                              selectedRectId: state$prime.selectedRectId,
                              gesture: state$prime.gesture,
                              tool: state$prime.tool,
                              width: state$prime.width,
                              height: state$prime.height,
                              mouse: state$prime.mouse
                            };
                  
                }
            case /* MouseUp */2 :
                var staging$1 = state.stagingRect;
                if (staging$1 === undefined) {
                  return state;
                }
                var match$4 = state.tool;
                if (match$4 >= 3) {
                  return state;
                }
                switch (match$4) {
                  case /* Add */0 :
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
                      var init$3 = cancelDrag(state);
                      return {
                              nextId: newRect_id + 1 | 0,
                              rects: Belt_List.add(state.rects, newRect),
                              stagingRect: undefined,
                              selectedRectId: newRect_id,
                              gesture: init$3.gesture,
                              tool: init$3.tool,
                              width: init$3.width,
                              height: init$3.height,
                              mouse: init$3.mouse
                            };
                  case /* Select */1 :
                      return state;
                  case /* Move */2 :
                      var init$4 = cancelDrag(state);
                      return {
                              nextId: init$4.nextId,
                              rects: Belt_List.map(state.rects, (function (rect) {
                                      if (rect.id === staging$1.id) {
                                        return staging$1;
                                      } else {
                                        return rect;
                                      }
                                    })),
                              stagingRect: undefined,
                              selectedRectId: init$4.selectedRectId,
                              gesture: init$4.gesture,
                              tool: init$4.tool,
                              width: init$4.width,
                              height: init$4.height,
                              mouse: init$4.mouse
                            };
                  
                }
            case /* SelectTool */3 :
                return {
                        nextId: state.nextId,
                        rects: state.rects,
                        stagingRect: undefined,
                        selectedRectId: state.selectedRectId,
                        gesture: undefined,
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
                        gesture: state.gesture,
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
        gesture: undefined,
        tool: /* Add */0,
        width: 800,
        height: 800,
        mouse: /* tuple */[
          0,
          0
        ]
      });
  var dispatch = match[1];
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
                  
                }));
          
        }), [svgRef]);
  var setToolState = Recoil.useSetRecoilState(State$ReasonReactExamples.toolState);
  React.useEffect((function () {
          var handler = function (e) {
            return Belt_Option.forEach(toolForKey(e.key), (function (tool) {
                          return Curry._1(setToolState, (function (param) {
                                        return tool;
                                      }));
                        }));
          };
          document.addEventListener("keydown", handler);
          return (function (param) {
                    document.removeEventListener("keydown", handler);
                    
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
            
          };
          document.addEventListener("mousemove", handler);
          return (function (param) {
                    document.removeEventListener("mousemove", handler);
                    
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
                }, Belt_List.toArray(Belt_List.map(toolbarOrder, (function (tool) {
                            return React.createElement("button", {
                                        key: Tool$ReasonReactExamples.label(tool),
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
                                                      Css.backgroundColor(tool === appState.tool ? /* `hex */[
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
                                      }, Tool$ReasonReactExamples.label(tool));
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
                    }, Belt_List.toArray(Belt_List.map(appState.rects, (function (rect) {
                                var isSelected = Caml_obj.caml_equal(appState.selectedRectId, rect.id);
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
                      height: String(appState.height),
                      width: String(appState.width)
                    }, Belt_Option.getWithDefault(Belt_Option.map(appState.stagingRect, (function (rect) {
                                return React.createElement("rect", {
                                            key: String(rect.id),
                                            height: rect.h.toString(),
                                            width: rect.w.toString(),
                                            fill: "none",
                                            stroke: appState.tool === /* Move */2 ? "goldenrod" : "limegreen",
                                            strokeDasharray: "10 2",
                                            strokeWidth: "1",
                                            x: rect.x.toString(),
                                            y: rect.y.toString()
                                          });
                              })), null), Belt_List.toArray(Belt_List.map(appState.rects, (function (rect) {
                                return React.createElement(Index$RectDisplay, {
                                            id: rect.id,
                                            key: String(rect.id)
                                          });
                              }))))));
}

var App = {
  inBounds: inBounds,
  startDrag: startDrag,
  updateDrag: updateDrag,
  cancelDrag: cancelDrag,
  make: Index$App
};

ReactDOMRe.renderToElementWithId(React.createElement(Recoil.RecoilRoot, {
          children: React.createElement(Index$App, { })
        }), "root");

exports.toolbarOrder = toolbarOrder;
exports.toolForKey = toolForKey;
exports.RectDisplay = RectDisplay;
exports.App = App;
/*  Not a pure module */
