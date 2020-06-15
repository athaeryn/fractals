let remap = (low1, high1, low2, high2, value) => {
  low2 +. (value -. low1) *. (high2 -. low2) /. (high1 -. low1);
};
