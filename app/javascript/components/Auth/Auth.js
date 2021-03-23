import React, { Component } from 'react';
import axios from 'axios';
import { Button, TextField, Snackbar } from '@material-ui/core'

import Input from '../Forms/Input/Input';
import FlashMessage from '../UI/FlashMessage/FlashMessage';
import classes from './Auth.module.css';

class Auth extends Component {
  state = {
    controls: {
      username: {
        elementType: 'input',
        elementConfig: {
            type: 'username',
            placeholder: 'Username'
        },
        value: '',
        validation: {
            required: true,
            minLength: 6
        },
        valid: false,
        touched: false
      },
      password: {
        elementType: 'input',
        elementConfig: {
            type: 'password',
            placeholder: 'Password'
        },
        value: '',
        validation: {
            required: true,
            minLength: 6
        },
        valid: false,
        touched: false
      }
    },
    message: {
      text: '',
      type: null,
      isOpen: false
    }
  }

  checkValidity(value, rules) {
    let isValid = true;

    if (!rules) {
      return true;
    }

    if (rules.required) {
        isValid = value.trim() !== '' && isValid;
    }

    if (rules.minLength) {
        isValid = value.length >= rules.minLength && isValid
    }

    if (rules.maxLength) {
        isValid = value.length <= rules.maxLength && isValid
    }

    if (rules.isEmail) {
        const pattern = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/;
        isValid = pattern.test(value) && isValid
    }

    if (rules.isNumeric) {
      const pattern = /^\d+$/;
      isValid = pattern.test(value) && isValid
    }

    return isValid;
  }

  inputChangedHandler = (event, controlName) => {
    const updatedControls = {
      ...this.state.controls,
      [controlName]: {
        ...this.state.controls[controlName],
        value: event.target.value,
        valid: this.checkValidity(event.target.value, this.state.controls[controlName].validation),
        touched: true
      }
    };
    this.setState({controls: updatedControls});
  }

  submitHandler = (event) => {
    event.preventDefault();
    const { username, password } = this.state.controls;

    // SignUp
    if (this.props.isSignUp) {
      axios
        .post('/api/v1/users', {
          username: username.value,
          password: password.value
        })
        .then(resp => console.log(resp));
    }
    // Login
    axios
      .post('/api/v1/authenticate', {
        username: username.value,
        password: password.value
      })
      .then(resp => {
        localStorage.setItem('token', resp.data.token);
        this.setMessage('Great Success!', 'success');
      })
      .catch(err => {
        this.setMessage('Bad news. You can\'t come in.', 'error');
      })
  }

  setMessage = (msg, type) => {
    this.setState({
      message: {
        ...this.state.message,
        text: msg,
        type,
        isOpen: true
      }
    });
  };

  render() {
    const { text, type, isOpen } = this.state.message;
    const formElementsArray = [];
    for ( let key in this.state.controls ) {
      formElementsArray.push({
        id: key,
        config: this.state.controls[key]
      });
    }

    const form = formElementsArray.map( formElement => (
      <Input
        key={formElement.id}
        elementType={formElement.config.elementType}
        elementConfig={formElement.config.elementConfig}
        value={formElement.config.value}
        invalid={!formElement.config.valid}
        shouldValidate={formElement.config.validation}
        touched={formElement.config.touched}
        changed={( event ) => this.inputChangedHandler( event, formElement.id )} />
    ));

    return (
      <div className={classes.Auth}>
        <form onSubmit={this.submitHandler}>
            {form}
          <Button type="submit">{this.props.isSignUp ? 'SUBMIT' : 'LOGIN'}</Button>
        </form>
        <FlashMessage message={text} type={type} open={isOpen}  />
      </div>
    );
  }
}

export default Auth;