'use strict';


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

exports.add = add;
exports.mult = mult;
exports.mod_sq = mod_sq;
/* No side effect */
