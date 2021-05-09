import React, { useState, createContext } from 'react';

const AppContext = createContext({
  flash: {
    message: '',
    type: null,
    isOpen: false
  },
  token: '',
  isLoggedIn: false,
  login: (token) => { },
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
  };
  const logoutHandler = () => {
    setToken(null);
  };
  const contextValue = {
    flash: flash,
    token: token,
    isLoggedIn: userIsLoggedIn,
    login: loginHandler,
    logout: logoutHandler
  };

  return (
    <AppContext.Provider value={contextValue}>
      {props.children}
    </AppContext.Provider>
  );
}
