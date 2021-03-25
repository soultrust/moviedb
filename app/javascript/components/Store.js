import React, { createContext, useReducer } from 'react';

const initialState = {
  flashMessage: null
};

const store = createContext(initialState);

const { Provider } = store;

export const StateProvider = ({ children }) => {
  const [state, dispatch] = useReducer((state, action) => {
    const currentState = { ...state };

    switch (action.type) {
      case 'SET_FLASH_MESSAGE':
        currentState.flashMessage = action.payload;
        return currentState;
      default:
        throw new Error();
    }
  }, initialState);

  return <Provider value={{ state, dispatch }}>{children}</Provider>;
};