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
        <App />
      </BrowserRouter>
    </AppProvider>,
    document.body.appendChild(root)
  )
});
