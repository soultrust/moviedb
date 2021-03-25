import React, { useContext } from 'react';
import { Route, Switch, Link } from 'react-router-dom';
import { Container, ThemeProvider, Typography, Snackbar } from '@material-ui/core';
import { Alert } from '@material-ui/lab';
import { createMuiTheme } from '@material-ui/core/styles';

import Projects from './Projects/Projects';
import Persons from './Persons/Persons';
import Auth from './Auth/Auth';
// import { StateProvider } from './Store';
// import MyProvider from './MyProvider';
import { FlashContext } from './FlashContext';
import classes from './App.css';

// console.log('statep: ', StateProvider);

const theme = createMuiTheme({
  typography: {
    fontFamily: [
      'Lato',
      'Arial',
      'sans-serif'
    ].join(','),
  },
});

const App = () => {
  const [flash, setFlash] = useContext(FlashContext);

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setFlash({ ...flash, message: '', isOpen: false });
  }

  return (
      <ThemeProvider theme={theme}>
        <Container className="test">
          <div className="title-bar">
            <Link to="/" className="title-link">
              Soultrust Movie Database
            </Link>
            <Link to="/login" className="login-link">
              Admin Login
            </Link>
          </div>
          <Switch>
            <Route exact path="/" component={Projects} />
            <Route path="/projects/" component={Projects} />
            <Route path="/persons" component={Persons} />
            <Route exact
              path="/signup"
              render={routeProps => <Auth {...routeProps} isSignUp={true} />}
            />
            <Route exact
              path="/login"
              render={routeProps => <Auth {...routeProps} isSignUp={false} />}
            />
          </Switch>
        </Container>
        <Snackbar open={flash.isOpen} autoHideDuration={6000} onClose={handleClose}>
          <Alert onClose={handleClose} severity={flash.type}>
            {flash.message}
          </Alert>
        </Snackbar>
      </ThemeProvider>
  );
};

export default App;