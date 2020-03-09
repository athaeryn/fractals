module Complex = {
  type t = (float, float);
  let add = ((ar, ai), (br, bi)) => (ar +. br, ai +. bi);
  // (a+bi)(c+di) = (ac−bd) + (ad+bc)i
  let mult = ((a, b), (c, d)) => (a *. c -. b *. d, a *. d +. b *. c);
  let mod_sq = ((r, i)) => r *. r +. i *. i;
};

let remap = (low1, high1, low2, high2, value) => {
  low2 +. (value -. low1) *. (high2 -. low2) /. (high1 -. low1);
};

module Mandelbrot: {let testIterations: Complex.t => int;} = {
  let rec test = (c, c0, i) => {
    Complex.(
      mod_sq(c) > 4.0 || i > 20000
        ? i : test(mult(c, c)->add(c0), c0, i + 1)
    );
  };

  let testIterations = c => test((0., 0.), c, 0);
};

module App = {
  [@react.component]
  let make = (~w, ~h, ~pan, ~zoom) => {
    let grid = Array.make_matrix(w, h, ());
    let w_f = float_of_int(w);
    let h_f = float_of_int(h);
    let (pan_x, pan_y) = pan;
    <table>
      <tbody>
        {grid
         ->Array.mapi(
             (y, row) => {
               <tr>
                 {row
                  ->Array.mapi(
                      (x, _) => {
                        let xn = remap(0., w_f, -1., 1., float_of_int(x));
                        let yn = remap(0., h_f, -1., 1., float_of_int(y));
                        <td
                          style={ReactDOMRe.Style.make(
                            ~height="2px",
                            ~width="2px",
                            ~backgroundColor=
                              {let iters =
                                 Mandelbrot.testIterations((
                                   xn /. zoom +. pan_x,
                                   yn /. zoom +. pan_y,
                                 ));
                               let lightness = iters mod 100;
                               let hue = iters;
                               {j|hsl($hue, 100%, $lightness%)|j}},
                            (),
                          )}
                        />;
                      },
                      _,
                    )
                  ->React.array}
               </tr>
             },
             _,
           )
         ->React.array}
      </tbody>
    </table>;
  };
};

ReactDOMRe.renderToElementWithId(
  <>
    /* <App h=256 w=256 zoom=100.0 pan=((-1.1182), (-0.27)) /> */
    /* <App h=128 w=128 zoom=100000000. pan=(0.2799053, 0.0085857) /> */
    /* <App h=128 w=128 zoom=0.75 pan=((-2.), (-0.0)) /> */
    <App h=256 w=256 zoom=0.75 pan=((-0.5), (-0.0)) />
  </>,
  "root",
);
