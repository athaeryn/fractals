'use strict';


function remap(low1, high1, low2, high2, value) {
  return low2 + (value - low1) * (high2 - low2) / (high1 - low1);
}

exports.remap = remap;
/* No side effect */
