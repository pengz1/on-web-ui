import * as ActionTypes from './ActionTypes.js';

export default (state, action) => {
  console.log("[DEBUG] enter reduce.js");
  const {payload} = action;
  console.log("[DEBUG] reduce.js action:", action);
  console.log("[DEBUG] reduce.js payload:", payload);

  switch (action.type) {
    case ActionTypes.UPDATE_PAYLOAD:
      return {...state, "options": payload["options"], "nodeId": payload["nodeId"]};
    default:
      return state
  }
}
