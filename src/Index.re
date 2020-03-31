open Webapi.Dom;

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
      mod_sq(c) > 4.0 || i > 200000
        ? i : test(mult(c, c)->add(c0), c0, i + 1)
    );
  };

  let testIterations = c => test((0., 0.), c, 0);
};

module Fractal = {
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
};

/* <App h=128 w=128 zoom=100000000. pan=(0.2799053, 0.0085857) /> */
/* <App h=256 w=256 zoom=100.0 pan=((-1.1182), (-0.27)) /> */
/* <App h=128 w=128 zoom=0.75 pan=((-2.), (-0.0)) /> */
/* <App h=256 w=256 zoom=0.75 pan=((-0.5), (-0.0)) /> */

type rect = {
  id: int,
  w: float,
  h: float,
  rot: float,
  x: float,
  y: float,
};

type tool =
  | Add
  | Select
  | Move
  | Rotate;

let toolList = [Add, Select, Move, Rotate];

let toolLabel =
  fun
  | Add => "Add"
  | Select => "Select"
  | Move => "Move"
  | Rotate => "Rotate";

let toolForKey =
  fun
  | "a" => Add->Some
  | "s" => Select->Some
  | "m" => Move->Some
  | "r" => Rotate->Some
  | _ => None;

type drag = {
  initialX: float,
  initialY: float,
  currentX: float,
  currentY: float,
};

module App = {
  type state = {
    nextId: int,
    rects: list(rect),
    stagingRect: option(rect),
    selectedRectId: option(int),
    gesture: option(drag),
    tool,
    width: int,
    height: int,
    mouse: (float, float),
  };

  type action =
    | MouseDown(float, float)
    | MouseMove(float, float)
    | MouseUp(float, float)
    | SelectTool(tool)
    | SelectRect(int);
  /* | CreateNewRect(rect) */
  /* | CommitNewRect(rect); */

  let inBounds = (state, x, y) => {
    x > 0.
    && x <= float_of_int(state.width)
    && y > 0.
    && y <= float_of_int(state.height);
  };

  let startDrag = (state, x, y) => {
    ...state,
    gesture: Some({initialX: x, initialY: y, currentX: x, currentY: y}),
  };

  let updateDrag = (state, x, y) => {
    ...state,
    gesture:
      state.gesture
      ->Option.map(gesture => {...gesture, currentX: x, currentY: y}),
  };

  let cancelDrag = state => {...state, gesture: None};

  [@react.component]
  let make = () => {
    let (state, dispatch) =
      React.useReducer(
        (state, action) => {
          switch (action, state) {
          | (SelectTool(tool), _) => {
              ...state,
              tool,
              gesture: None,
              stagingRect: None,
            }

          | (MouseDown(x, y), {tool: Add, stagingRect: None})
              when inBounds(state, x, y) => {
              ...state->startDrag(x, y),
              stagingRect: Some({id: 0, x, y, w: 0., h: 0., rot: 0.}),
            }

          | (MouseMove(x, y), {tool: Add, stagingRect: Some(staging)}) =>
            let s = min(x -. staging.x, y -. staging.y);
            {
              ...state->updateDrag(x, y),
              stagingRect: Some({...staging, w: s, h: s}),
            };

          | (MouseUp(x, y), {tool: Add, stagingRect: Some(staging)}) =>
            let s = min(x -. staging.x, y -. staging.y);
            let newRect = {...staging, id: state.nextId, w: s, h: s};
            {
              ...state->cancelDrag,
              stagingRect: None,
              selectedRectId: Some(newRect.id),
              nextId: newRect.id + 1,
              rects: state.rects->List.add(newRect),
            };

          | (MouseDown(x, y), {tool: Move, stagingRect: None})
              when inBounds(state, x, y) =>
            let stagingRect =
              state.rects
              ->List.getBy(({id}) => state.selectedRectId == Some(id));
            {...state->startDrag(x, y), stagingRect};

          | (MouseMove(x, y), {tool: Move, stagingRect: Some(staging)}) =>
            let state' = state->updateDrag(x, y);
            let selctedRect =
              state'.rects
              ->List.getBy(({id}) => state'.selectedRectId == Some(id));
            let (x', y') =
              switch (selctedRect, state'.gesture) {
              | (Some(starting), Some(drag)) => (
                  starting.x +. drag.currentX -. drag.initialX,
                  starting.y +. drag.currentY -. drag.initialY,
                )
              | _ => (x, y)
              };
            {...state', stagingRect: Some({...staging, x: x', y: y'})};
          | (MouseUp(_), {tool: Move, stagingRect: Some(staging)}) => {
              ...state->cancelDrag,
              stagingRect: None,
              rects:
                state.rects
                ->List.map(rect => {rect.id == staging.id ? staging : rect}),
            }

          | (SelectRect(id), _) => {...state, selectedRectId: Some(id)}

          | _ => state
          }
        },
        {
          tool: Add,
          rects: [],
          nextId: 1,
          stagingRect: None,
          selectedRectId: None,
          gesture: None,
          width: 800,
          height: 800,
          mouse: (0., 0.),
        },
      );

    let svgRef = React.useRef(Js.Nullable.null);
    let svgRect =
      React.useRef(DomRect.make(~x=0., ~y=0., ~width=800., ~height=800.));
    let mouseXY = React.useRef((0., 0.));

    // Get the initial bounding rect of the svg.
    // TODO: update these bounds when necessary (e.g. after window resize).
    React.useEffect1(
      () => {
        svgRef
        ->React.Ref.current
        ->Js.Nullable.toOption
        ->Option.forEach(node => {
            let rect = Element.getBoundingClientRect(node);
            svgRect->React.Ref.setCurrent(rect);
          });
        None;
      },
      [|svgRef|],
    );

    // Tool hotkey listener
    React.useEffect0(() => {
      let handler = e => {
        e
        ->KeyboardEvent.key
        ->toolForKey
        ->Option.forEach(tool => dispatch(SelectTool(tool)));
      };
      document |> Document.addKeyDownEventListener(handler);
      Some(() => {document |> Document.removeKeyDownEventListener(handler)});
    });

    // Mouse move listener
    React.useEffect0(() => {
      let handler = e => {
        let svgRectX = svgRect->React.Ref.current->DomRect.x;
        let svgRectY = svgRect->React.Ref.current->DomRect.y;
        let x = e->MouseEvent.clientX->float_of_int -. svgRectX;
        let y = e->MouseEvent.clientY->float_of_int -. svgRectY;
        mouseXY->React.Ref.setCurrent((x, y));
        dispatch(MouseMove(x, y));
        Js.log2("mouse move", (x, y));
      };
      document |> Document.addMouseMoveEventListener(handler);
      Some(
        () => {document |> Document.removeMouseMoveEventListener(handler)},
      );
    });

    React.useEffect0(() => {
      let handler = _e => {
        let (x, y) = mouseXY->React.Ref.current;
        Js.log2("mouse down", (x, y));
        dispatch(MouseDown(x, y));
      };
      document |> Document.addMouseDownEventListener(handler);
      Some(
        () => {document |> Document.removeMouseDownEventListener(handler)},
      );
    });

    React.useEffect0(() => {
      let handler = _e => {
        let (x, y) = mouseXY->React.Ref.current;
        Js.log2("mouse up", (x, y));
        dispatch(MouseUp(x, y));
      };
      document |> Document.addMouseUpEventListener(handler);
      Some(() => {document |> Document.removeMouseUpEventListener(handler)});
    });

    <div
      className=Css.(
        style([
          display(`flex),
          flexDirection(`column),
          backgroundColor(`hex("1a1a1a")),
          color(gainsboro),
          width(`vw(100.)),
          height(`vh(100.)),
          display(`grid),
          gridTemplateColumns([`fr(1.), `rem(20.)]),
          gridTemplateRows([`rem(2.), `fr(1.)]),
          gridGap(`rem(1.)),
          padding(`rem(1.)),
        ])
      )>
      <div
        className=Css.(
          style([
            border(`px(1), `solid, purple),
            gridRowStart(1),
            gridColumn(1, -1),
            display(grid),
            gridAutoFlow(`column),
            gridAutoColumns(`maxContent),
            gridGap(`rem(1.)),
            alignItems(`center),
          ])
        )>
        {toolList
         ->List.map(tool => {
             <button
               key={toolLabel(tool)}
               className=Css.(
                 style([
                   unsafe("all", "unset"),
                   padding2(~v=`rem(0.25), ~h=`rem(0.5)),
                   border(`px(1), `solid, white),
                   borderRadius(`px(2)),
                   backgroundColor(
                     tool == state.tool ? `hex("333333") : `transparent,
                   ),
                 ])
               )
               onClick={e => {
                 ReactEvent.Synthetic.preventDefault(e);
                 ReactEvent.Synthetic.stopPropagation(e);
                 dispatch(SelectTool(tool));
               }}>
               {tool->toolLabel->React.string}
             </button>
           })
         ->List.toArray
         ->React.array}
      </div>
      <div
        className=Css.(
          style([
            border(`px(1), `solid, blueviolet),
            gridRowStart(2),
            gridColumnStart(2),
          ])
        )>
        <div> "layers"->React.string </div>
        <ul className=Css.(style([]))>
          {state.rects
           ->List.map(rect => {
               let isSelected = state.selectedRectId == Some(rect.id);
               <div
                 id={rect.id->string_of_int}
                 className=Css.(
                   style([
                     display(`flex),
                     justifyContent(`spaceBetween),
                     padding2(~h=`rem(1.), ~v=`rem(0.25)),
                   ])
                 )>
                 <span
                   className=Css.(
                     style([
                       borderBottom(
                         `px(1),
                         `solid,
                         isSelected ? goldenrod : transparent,
                       ),
                     ])
                   )>
                   {("Layer " ++ rect.id->string_of_int)->React.string}
                 </span>
                 <button
                   className=Css.(
                     style([
                       color(isSelected ? white : black),
                       backgroundColor(isSelected ? goldenrod : slategrey),
                     ])
                   )
                   onClick={e => {
                     ReactEvent.Synthetic.stopPropagation(e);
                     dispatch(SelectRect(rect.id));
                   }}>
                   "Select"->React.string
                 </button>
               </div>;
             })
           ->List.toArray
           ->React.array}
        </ul>
      </div>
      <div
        className=Css.(
          style([
            gridColumnStart(1),
            gridRowStart(2),
            display(`flex),
            justifyContent(`center),
            alignItems(`center),
          ])
        )>
        <svg
          ref={ReactDOMRe.Ref.domRef(svgRef)}
          className=Css.(
            style([
              border(`px(1), `solid, white),
              maxWidth(`percent(100.)),
              height(`auto),
            ])
          )
          width={state.width->string_of_int}
          height={state.height->string_of_int}>
          {state.stagingRect
           ->Option.map(rect =>
               <rect
                 key={rect.id->string_of_int}
                 x={rect.x->Js.Float.toString}
                 y={rect.y->Js.Float.toString}
                 width={rect.w->Js.Float.toString}
                 height={rect.h->Js.Float.toString}
                 strokeWidth="1"
                 stroke={state.tool == Move ? "goldenrod" : "limegreen"}
                 strokeDasharray="10 2"
                 fill="none"
               />
             )
           ->Option.getWithDefault(React.null)}
          {state.rects
           ->List.map(rect => {
               let selected = state.selectedRectId == Some(rect.id);
               <rect
                 key={rect.id->string_of_int}
                 x={rect.x->Js.Float.toString}
                 y={rect.y->Js.Float.toString}
                 width={rect.w->Js.Float.toString}
                 height={rect.h->Js.Float.toString}
                 strokeWidth="1"
                 stroke={selected ? "goldenrod" : "gainsboro"}
                 strokeDasharray=?{
                   selected
                   && state.tool == Move
                   && Option.isSome(state.gesture)
                     ? Some("1 2") : None
                 }
                 fill="none"
               />;
             })
           ->List.toArray
           ->React.array}
        </svg>
      </div>
    </div>;
  };
};

ReactDOMRe.renderToElementWithId(<App />, "root");
