module Mandelbrot: {let testIterations: Complex.t => int;} = {
  let rec test = (c, c0, i) => {
    Complex.(
      mod_sq(c) > 4.0 || i > 200000
        ? i : test(mult(c, c)->add(c0), c0, i + 1)
    );
  };

  let testIterations = c => test((0., 0.), c, 0);
};
[@react.component]
let make = (~w, ~h, ~pan, ~zoom) => {
  let grid = Array.make(w, ())->Array.map(_ => Array.make(h, ()));
  let w_f = float_of_int(w);
  let h_f = float_of_int(h);
  let (pan_x, pan_y) = pan;
  <table>
    <tbody>
      {grid
       ->Array.mapWithIndex((y, row) => {
           <tr>
             {row
              ->Array.mapWithIndex((x, _) => {
                  let xn = Math.remap(0., w_f, -1., 1., float_of_int(x));
                  let yn = Math.remap(0., h_f, -1., 1., float_of_int(y));
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
                         let lightness =
                           mod_float(float_of_int(iters) *. 20., 100.);
                         let hue = float_of_int(iters) /. 1.618;
                         {j|hsl($hue, 100%, $lightness%)|j}},
                      (),
                    )}
                  />;
                })
              ->React.array}
           </tr>
         })
       ->React.array}
    </tbody>
  </table>;
};
