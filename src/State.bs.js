'use strict';

var Curry = require("bs-platform/lib/js/curry.js");
var Recoil = require("recoil");
var Belt_Option = require("bs-platform/lib/js/belt_Option.js");
var Caml_option = require("bs-platform/lib/js/caml_option.js");
var Belt_MutableMapInt = require("bs-platform/lib/js/belt_MutableMapInt.js");

function memoizeByInt(f) {
  var map = Belt_MutableMapInt.make(undefined);
  return (function (id) {
      var value = Belt_MutableMapInt.get(map, id);
      if (value !== undefined) {
        return Caml_option.valFromOption(value);
      }
      var value$1 = Curry._1(f, id);
      Belt_MutableMapInt.set(map, id, value$1);
      return value$1;
    });
}

var byId = memoizeByInt((function (id) {
        return Recoil.atom({
                    key: "todo." + (String(id) + ""),
                    default: {
                      id: id,
                      w: 0,
                      h: 0,
                      rot: 0,
                      x: 0,
                      y: 0
                    }
                  });
      }));

var RectState = {
  byId: byId
};

var appState = Recoil.atom({
      key: "appState",
      default: {
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
      }
    });

var selectedRectId = Recoil.selector({
      key: "selectedRectId",
      get: (function (param) {
          return Curry._1(param.get, appState).selectedRectId;
        })
    });

var isDragging = Recoil.selector({
      key: "isDragging",
      get: (function (param) {
          var state = Curry._1(param.get, appState);
          if (state.tool === /* Move */2) {
            return Belt_Option.isSome(state.gesture);
          } else {
            return false;
          }
        })
    });

var toolState = Recoil.selector({
      key: "toolState",
      get: (function (param) {
          return Curry._1(param.get, appState).tool;
        }),
      set: (function (param, tool) {
          var currentState = Curry._1(param.get, appState);
          return Curry._2(param.set, appState, {
                      nextId: currentState.nextId,
                      rects: currentState.rects,
                      stagingRect: currentState.stagingRect,
                      selectedRectId: currentState.selectedRectId,
                      gesture: currentState.gesture,
                      tool: tool,
                      width: currentState.width,
                      height: currentState.height,
                      mouse: currentState.mouse
                    });
        })
    });

exports.memoizeByInt = memoizeByInt;
exports.RectState = RectState;
exports.appState = appState;
exports.selectedRectId = selectedRectId;
exports.isDragging = isDragging;
exports.toolState = toolState;
/* byId Not a pure module */
