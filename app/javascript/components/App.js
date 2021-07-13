import React, { useContext, useState } from 'react';
import { Route, Switch, Link, Redirect, useHistory } from 'react-router-dom';
import { Button, TextField, Snackbar, Container, ThemeProvider } from '@material-ui/core';
import { Alert } from '@material-ui/lab';
import { createMuiTheme } from '@material-ui/core/styles';

import Main from './Main';
import Auth from './Auth/Auth';
import Projects from './Projects/Projects';
import Persons from './Persons/Persons';
import Nav from './Nav/Nav';
import SearchProjectsPeople from './SearchProjectsPeople/SearchProjectsPeople';
import AppContext from './AppContext';
import classes from './App.css';

const theme = createMuiTheme({
  typography: {
    fontFamily: [
      'Lato',
      'Arial',
      'sans-serif'
    ].join(','),
  },
});

const App = (props) => {
  const appCtx = useContext(AppContext);
  const history = useHistory();

  const logout = () => {
    appCtx.logout();
    history.push('/login');
  }

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    appCtx.updateFlash({
      message: '',
      isOpen: false
    });
  }

  return (
    <ThemeProvider theme={theme}>
      <Switch>
        <Route exact
          path="/signup"
          render={routeProps => <Auth {...routeProps} isSignUp={true} />}
        />
        <Route exact
          path="/login"
          render={routeProps => <Auth {...routeProps} isSignUp={false} />}
        />
        <Route path="/" component={Main} />
      </Switch>
      <Snackbar
        open={appCtx.flash.isOpen}
        autoHideDuration={6000}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'center'
        }}>
        <Alert onClose={handleClose} severity={appCtx.flash.type}>
          {appCtx.flash.message}
        </Alert>
      </Snackbar>
      <div className="auth-status">{ appCtx.isLoggedIn ? 'LOGGED IN' : 'LOGGED OUT' }</div>
    </ThemeProvider>
  );
};

export default App;