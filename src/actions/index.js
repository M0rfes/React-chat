import * as actionTypes from './types';
// User Action creator
export const setUser = user => {
  return {
    type: actionTypes.SET_USER,
    payload: {
      currentUser: user
    }
  };
};
export const clearUser = () => {
  return {
    type: actionTypes.CLEAR_USER
  };
};

// Channel Action Creator
export const setCurrentChannel = channel => {
  return {
    type: actionTypes.SET_CURRENT_CHANNEl,
    payload: {
      currentChannel: channel
    }
  };
};
