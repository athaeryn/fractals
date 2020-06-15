type t =
  | Add
  | Select
  | Move
  | Rotate;

let label =
  fun
  | Add => "Add"
  | Select => "Select"
  | Move => "Move"
  | Rotate => "Rotate";
