import { combineReducers } from 'redux';
import * as actionTypes from '../actions/types';
// User Reducers.
const initialUserState = {
  currentUser: null,
  isLoading: true
};
const userReducer = (state = initialUserState, action) => {
  switch (action.type) {
    case actionTypes.SET_USER:
      return {
        ...state,
        currentUser: action.payload.currentUser,
        isLoading: false
      };
    case actionTypes.CLEAR_USER:
      return {
        ...state,
        isLoading: false
      };
    default:
      return state;
  }
};
// Channel Reducers
const initialChannel = {
  currentChannel: null
};
const channelReducer = (state = initialChannel, action) => {
  switch (action.type) {
    case actionTypes.SET_CURRENT_CHANNEl:
      return {
        ...state,
        currentChannel: action.payload.currentChannel
      };
    default:
      return state;
  }
};

const rootReducer = combineReducers({
  user: userReducer,
  channel: channelReducer
});
export default rootReducer;
