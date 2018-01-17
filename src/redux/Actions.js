import * as ActionTypes from './ActionTypes.js';

export const update = (payload) => {
  console.log("[DEBUG] enter Actions.js");
  return {
    type: ActionTypes.UPDATE_PAYLOAD,
    payload: payload
  };
};

