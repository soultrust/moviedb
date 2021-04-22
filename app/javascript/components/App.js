import React, { useContext } from 'react';
import { Route, Switch, Link, Redirect, useHistory } from 'react-router-dom';
import { Container, ThemeProvider, Snackbar } from '@material-ui/core';
import { Alert } from '@material-ui/lab';
import { createMuiTheme } from '@material-ui/core/styles';

import Projects from './Projects/Projects';
import Persons from './Persons/Persons';
import Auth from './Auth/Auth';
import { AppContext } from './AppContext';
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
  const [global, setGlobal] = useContext(AppContext);
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
      },
      isAuthenticated: false,
      token: null
    });
  }

  const logout = () => {
    setGlobal({
      ...global,
      isAuthenticated: false
    });
    localStorage.setItem('token', null);
    history.push('/login');
  }

  let logInOutSection = null;

  if (props.location.pathname !== '/login') {
    logInOutSection = global.isAuthenticated ?
      <div onClick={logout} className="login-link">
        Logout
      </div> :
      <Link to="/login" className="login-link">
        Admin Login
      </Link>;
  }

  return (
    <ThemeProvider theme={theme}>
      <Container className="test">
        <div className="title-bar">
          <Link to="/" className="title-link">
            Soultrust Movie Database
          </Link>
          {logInOutSection}
        </div>

        <Switch>
          <Route exact path="/" component={Projects} />
          <Route path="/projects" component={Projects} />
          <Route path="/persons" component={Persons} />
          <Route exact
              path="/signup"
              render={routeProps => <Auth {...routeProps} isSignUp={true} />}
            />
          { global.isAuthenticated ?
            <Route exact
              path="/signup"
              render={routeProps => <Auth {...routeProps} isSignUp={true} />}
            />
            :
            <Route exact
              path="/login"
              render={routeProps => <Auth {...routeProps} isSignUp={false} />}
            />
          }
          <Route render={() => <Redirect to="/" />} />
        </Switch>

      </Container>
      <Snackbar open={global.flash.isOpen} autoHideDuration={6000} onClose={handleClose}>
        <Alert onClose={handleClose} severity={global.flash.type}>
          {global.flash.message}
        </Alert>
      </Snackbar>
      <div>{ global.isAuthenticated ? 'LOGGED IN' : 'LOGGED OUT' }</div>
    </ThemeProvider>
  );
};

export default App;