open Webapi.Dom;

let toolbarOrder: list(Tool.t) = [Add, Select, Move, Rotate];

let toolForKey: string => option(Tool.t) =
  fun
  | "a" => Add->Some
  | "s" => Select->Some
  | "m" => Move->Some
  | "r" => Rotate->Some
  | _ => None;

module RectDisplay = {
  [@react.component]
  let make = (~id: int) => {
    let rect = Recoil.useRecoilValue(State.RectState.byId(id));
    let isDragging = Recoil.useRecoilValue(State.isDragging);
    let selected = {
      let selectedRectId = Recoil.useRecoilValue(State.selectedRectId);
      Some(id) == selectedRectId;
    };
    <rect
      key={id->string_of_int}
      x={rect.x->Js.Float.toString}
      y={rect.y->Js.Float.toString}
      width={rect.Rect.w->Js.Float.toString}
      height={rect.Rect.h->Js.Float.toString}
      strokeWidth="1"
      stroke={selected ? "goldenrod" : "gainsboro"}
      strokeDasharray=?{selected && isDragging ? Some("1 2") : None}
      fill="none"
    />;
  };
};

module App = {
  type state = State.state;

  type action =
    | MouseDown(float, float)
    | MouseMove(float, float)
    | MouseUp(float, float)
    | SelectTool(Tool.t)
    | SelectRect(int);
  /* | CreateNewRect(rect) */
  /* | CommitNewRect(rect); */

  let inBounds = (state, x, y) => {
    x > 0.
    && x <= float_of_int(state.State.width)
    && y > 0.
    && y <= float_of_int(state.height);
  };

  let startDrag = (state, x, y) => {
    ...state,
    State.gesture: Some({initialX: x, initialY: y, currentX: x, currentY: y}),
  };

  let updateDrag = (state, x, y) => {
    ...state,
    State.gesture:
      state.State.gesture
      ->Option.map(gesture => {...gesture, currentX: x, currentY: y}),
  };

  let cancelDrag = state => {...state, State.gesture: None};

  [@react.component]
  let make = () => {
    let appState = Recoil.useRecoilValue(State.appState);
    let (_state, dispatch) =
      React.useReducer(
        (state, action) => {
          switch (action, state) {
          | (SelectTool(tool), _) => {
              ...state,
              tool,
              gesture: None,
              stagingRect: None,
            }

          | (MouseDown(x, y), {State.tool: Add, stagingRect: None})
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
        svgRef.current
        ->Js.Nullable.toOption
        ->Option.forEach(node => {
            let rect = Element.getBoundingClientRect(node);
            svgRect.current = rect;
          });
        None;
      },
      [|svgRef|],
    );

    let setToolState = Recoil.useSetRecoilState(State.toolState);

    // Tool hotkey listener
    React.useEffect0(() => {
      let handler = e => {
        e
        ->KeyboardEvent.key
        ->toolForKey
        ->Option.forEach(tool => setToolState(_ => tool));
      };
      document |> Document.addKeyDownEventListener(handler);
      Some(() => {document |> Document.removeKeyDownEventListener(handler)});
    });

    // Mouse move listener
    React.useEffect0(() => {
      let handler = e => {
        let svgRectX = svgRect.current->DomRect.x;
        let svgRectY = svgRect.current->DomRect.y;
        let x = e->MouseEvent.clientX->float_of_int -. svgRectX;
        let y = e->MouseEvent.clientY->float_of_int -. svgRectY;
        mouseXY.current = (x, y);
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
        let (x, y) = mouseXY.current;
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
        let (x, y) = mouseXY.current;
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
        {toolbarOrder
         ->List.map(tool => {
             <button
               key={Tool.label(tool)}
               className=Css.(
                 style([
                   unsafe("all", "unset"),
                   padding2(~v=`rem(0.25), ~h=`rem(0.5)),
                   border(`px(1), `solid, white),
                   borderRadius(`px(2)),
                   backgroundColor(
                     tool == appState.tool ? `hex("333333") : `transparent,
                   ),
                 ])
               )
               onClick={e => {
                 ReactEvent.Synthetic.preventDefault(e);
                 ReactEvent.Synthetic.stopPropagation(e);
                 dispatch(SelectTool(tool));
               }}>
               {tool->Tool.label->React.string}
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
          {appState.rects
           ->List.map(rect => {
               let isSelected = appState.selectedRectId == Some(rect.id);
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
          width={appState.width->string_of_int}
          height={appState.height->string_of_int}>
          {appState.stagingRect
           ->Option.map(rect =>
               <rect
                 key={rect.id->string_of_int}
                 x={rect.x->Js.Float.toString}
                 y={rect.y->Js.Float.toString}
                 width={rect.w->Js.Float.toString}
                 height={rect.h->Js.Float.toString}
                 strokeWidth="1"
                 stroke={appState.tool == Move ? "goldenrod" : "limegreen"}
                 strokeDasharray="10 2"
                 fill="none"
               />
             )
           ->Option.getWithDefault(React.null)}
          {appState.rects
           ->List.map(rect => {
               <RectDisplay id={rect.id} key={rect.id->string_of_int} />
             })
           ->List.toArray
           ->React.array}
        </svg>
      </div>
    </div>;
  };
};

ReactDOMRe.renderToElementWithId(
  <Recoil.RecoilRoot> <App /> </Recoil.RecoilRoot>,
  "root",
);
