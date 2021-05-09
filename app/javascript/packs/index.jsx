// Run this example by adding <%= javascript_pack_tag 'hello_react' %> to the head of your layout file,
// like app/views/layouts/application.html.erb. All it does is render <div>Hello React</div> at the bottom
// of the page.

import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import App from '../components/App';
import { BrowserRouter, Switch, Route } from 'react-router-dom';
import { AppProvider } from '../components/AppContext';
import Auth from '../components/Auth/Auth';

const root = document.createElement('div');
root.classList.add('root');

document.addEventListener('DOMContentLoaded', () => {
  ReactDOM.render(
    <AppProvider>
      <BrowserRouter>
        <Switch>
          <Route exact
            path="/signup"
            render={routeProps => <Auth {...routeProps} isSignUp={true} />}
          />
          <Route exact
            path="/login"
            render={routeProps => <Auth {...routeProps} isSignUp={false} />}
          />
          <Route path="/" component={App} />
        </Switch>
      </BrowserRouter>
    </AppProvider>,
    document.body.appendChild(root)
  )
});
