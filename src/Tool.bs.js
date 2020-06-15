'use strict';


function label(param) {
  switch (param) {
    case /* Add */0 :
        return "Add";
    case /* Select */1 :
        return "Select";
    case /* Move */2 :
        return "Move";
    case /* Rotate */3 :
        return "Rotate";
    
  }
}

exports.label = label;
/* No side effect */
