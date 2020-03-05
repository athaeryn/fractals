module Complex = {
  type t = (float, float);
  let add = ((ar, ai), (br, bi)) => (ar +. br, ai +. bi);
  // (a+bi)(c+di) = (ac−bd) + (ad+bc)i
  let mult = ((a, b), (c, d)) => (a *. c -. b *. d, a *. d +. b *. c);
  let mod_ = ((r, i)) => r *. r +. i *. i;
};

let remap = (low1, high1, low2, high2, value) => {
  low2 +. (value -. low1) *. (high2 -. low2) /. (high1 -. low1);
};

module Mandelbrot: {let testIterations: Complex.t => int;} = {
  let rec test = (c, c0, i) => {
    Complex.mod_(c) > 4. || i > 100
      ? i : test(Complex.mult(c, c)->Complex.add(c0), c0, i + 1);
  };

  let testIterations = c => test((0., 0.), c, 0);
};

module App = {
  [@react.component]
  let make = (~w, ~h) => {
    let grid = Array.make_matrix(w, h, ());
    let w_f = float_of_int(w);
    let h_f = float_of_int(h);
    <table>
      <tbody>
        {grid
         ->Array.mapi(
             (y, row) => {
               <tr>
                 {row
                  ->Array.mapi(
                      (x, _) => {
                        let xn = remap(0., w_f, -2., 1., float_of_int(x));
                        let yn = remap(0., h_f, -1., 1., float_of_int(y));
                        <td
                          style={ReactDOMRe.Style.make(
                            ~height="3px",
                            ~width="3px",
                            ~backgroundColor=
                              {let iters =
                                 Mandelbrot.testIterations((xn -. 0.25, yn));
                               let lightness = 100 - min(iters, 100);
                               {j|hsl(0, 0%, $lightness%)|j}},
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

ReactDOMRe.renderToElementWithId(<App h=128 w=128 />, "root");