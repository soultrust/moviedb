import React, { useContext } from 'react';
import { Route, Switch, Link, Redirect, useHistory } from 'react-router-dom';
import { Container, ThemeProvider, Snackbar } from '@material-ui/core';
import { Alert } from '@material-ui/lab';
import { createMuiTheme } from '@material-ui/core/styles';

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

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setGlobal({
      ...global,
      flash: {
        ...global.flash,
        message: '',
        isOpen: false
      }
    });
  }

  const logout = () => {
    appCtx.logout();
    history.push('/login');
  }

  let logInOutSection = null;

  if (location.pathname !== '/login') {
    logInOutSection = appCtx.isLoggedIn ?
      <div onClick={logout} className="login-link">
        Logout
      </div> :
      <Link to="/login" className="login-link">
        Admin Login
      </Link>;
  }

  return (
    <ThemeProvider theme={theme}>
      <Container className="grid-layout">
        <div className="title-bar">
          <Link to="/" className="title-link">
            Soultrust Movie Database
          </Link>
          {logInOutSection}
        </div>

        <Nav />
        <SearchProjectsPeople />

        <Switch>
          <Route exact path="/" component={Projects} />
          <Route path="/projects" component={Projects} />
          <Route path="/persons" component={Persons} />

          {/* <Route render={() => <Redirect to="/" />} /> */}
        </Switch>

      </Container>
      <Snackbar open={appCtx.flash.isOpen} autoHideDuration={6000} onClose={handleClose}>
        <Alert onClose={handleClose} severity={appCtx.flash.type}>
          {appCtx.flash.message}
        </Alert>
      </Snackbar>
      <div className="auth-status">{ appCtx.isLoggedIn ? 'LOGGED IN' : 'LOGGED OUT' }</div>
    </ThemeProvider>
  );
};

export default App;