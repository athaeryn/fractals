let memoizeByInt = f => {
  let map = MutableMap.Int.make();
  (id: int) => {
    switch (map->MutableMap.Int.get(id)) {
    | Some(value) => value
    | None =>
      let value = f(id);
      map->MutableMap.Int.set(id, value);
      value;
    };
  };
};

module RectState = {
  type t = Rect.t;
  let byId =
    memoizeByInt(id => {
      Recoil.atom({
        key: {j|todo.$id|j},
        default: {
          Rect.id,
          w: 0.,
          h: 0.,
          rot: 0.,
          x: 0.,
          y: 0.,
        },
      })
    });
};

type state = {
  nextId: int,
  rects: list(Rect.t),
  stagingRect: option(Rect.t),
  selectedRectId: option(int),
  gesture: option(Drag.t),
  tool: Tool.t,
  width: int,
  height: int,
  mouse: (float, float),
};

let appState =
  Recoil.atom({
    key: "appState",
    default: {
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
  });

let selectedRectId =
  Recoil.selector({
    key: "selectedRectId",
    get: ({get}) => get(appState).selectedRectId,
  });

let isDragging =
  Recoil.selector({
    key: "isDragging",
    get: ({get}) => {
      let state = get(appState);
      state.tool == Move && Option.isSome(state.gesture);
    },
  });

let toolState =
  Recoil.selectorWithWrite({
    key: "toolState",
    get: ({get}) => get(appState).tool,
    set: ({get, set}, tool: Tool.t) => {
      let currentState = get(appState);
      set(appState, {...currentState, tool});
    },
  });
