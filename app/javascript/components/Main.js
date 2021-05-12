import React, { useContext } from 'react';
import { Container } from '@material-ui/core';
import { Link, Switch, Route } from 'react-router-dom';
import AppContext from './AppContext';
import Nav from './Nav/Nav';
import SearchProjectsPeople from './SearchProjectsPeople/SearchProjectsPeople';
import Projects from './Projects/Projects';
import Persons from './Persons/Persons';

const Main = (props) => {
  const appCtx = useContext(AppContext);
  let logInOutSection = null;

  if (location.pathname !== '/login') {
    logInOutSection = appCtx.isLoggedIn ?
      <div onClick={appCtx.logout} className="login-link">
        Logout
      </div> :
      <Link to="/login" className="login-link">
        Admin Login
      </Link>;
  }

  return (
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
        <Route exact path="/persons" component={Persons} />
        <Route exact path="/projects" component={Projects} />
        <Route path="/" component={Projects} />
      </Switch>
    </Container>
  );
}

export default Main;