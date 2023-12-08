import {
  GET_APP_LAYOUT_DIRECTION,
  SET_APP_LAYOUT_DIRECTION,
} from "../actionCreaters/actionCreaters";

const initialState = {
  layout: "ltr",
};

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case GET_APP_LAYOUT_DIRECTION:
      return {
        ...state,
      };
    case SET_APP_LAYOUT_DIRECTION:
      return {
        ...state,
        layout: action.direction,
      };
    default:
      return state;
  }
};

export default reducer;
