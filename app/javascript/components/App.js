import React from 'react';
import { Route, Switch, Link } from 'react-router-dom';
import Projects from './Projects/Projects';
import Persons from './Persons/Persons';
import Auth from './Auth/Auth';
import { Container, ThemeProvider, Typography } from '@material-ui/core';
import { createMuiTheme } from '@material-ui/core/styles';
import classes from './App.css';

const theme = createMuiTheme({
  typography: {
    fontFamily: [
      'Lato',
      'Arial',
      'sans-serif'
    ].join(','),
  },
})

const App = () => {
  return (
    <ThemeProvider theme={theme}>
      <Container className="test">
        <Link to="/" className="title">
          <Typography>Soultrust Movie DB</Typography>
        </Link>
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
    </ThemeProvider>
  )
}

export default App