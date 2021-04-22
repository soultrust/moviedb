import React, { useState, createContext } from 'react';

export const AppContext = createContext();

export const AppProvider = (props) => {
  const [global, setGlobal] = useState({
    ...global,
    flash: {
      message: 'hello you\'re done for today',
      type: null,
      isOpen: false
    },
    isAuthenticated: !!localStorage.getItem('token') || false,
    token: localStorage.getItem('token')
  });

  return (
    <AppContext.Provider value={[global, setGlobal]}>
      {props.children}
    </AppContext.Provider>
  );
}