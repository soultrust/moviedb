import React, { useState, createContext } from 'react';

const AppContext = createContext({
  flash: {
    message: '',
    type: null,
    isOpen: false
  },
  updateFlash: () => {},
  token: '',
  isLoggedIn: false,
  login: (token) => {},
  logout: () => {}
});

export default AppContext;

export const AppProvider = (props) => {
  const [token, setToken] = useState(null);
  const [flash, setFlash] = useState({
    message: '',
    type: null,
    isOpen: false
  });
  const userIsLoggedIn = !!token;

  const loginHandler = (token) => {
    setToken(token);
    setFlash({
      message: 'Great Success!!!',
      type: 'success',
      isOpen: true
    });
  };

  const logoutHandler = () => {
    setToken(null);
  };

  const updateFlash = (params) => {
    setFlash(params);
  }

  const contextValue = {
    flash: flash,
    token: token,
    isLoggedIn: userIsLoggedIn,
    login: loginHandler,
    logout: logoutHandler,
    updateFlash: updateFlash
  };

  return (
    <AppContext.Provider value={contextValue}>
      {props.children}
    </AppContext.Provider>
  );
}
