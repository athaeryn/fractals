type t = (float, float);
let add = ((ar, ai), (br, bi)) => (ar +. br, ai +. bi);
// (a+bi)(c+di) = (ac−bd) + (ad+bc)i
let mult = ((a, b), (c, d)) => (a *. c -. b *. d, a *. d +. b *. c);
let mod_sq = ((r, i)) => r *. r +. i *. i;
