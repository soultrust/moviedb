import React, { useContext, useState } from 'react';
import axios from 'axios';
import { Button, TextField } from '@material-ui/core';

import Input from '../Forms/Input/Input';
import AppContext from '../AppContext';
import classes from './Auth.module.css';

const Auth = (props) => {
  const appCtx = useContext(AppContext);

  const signupFields = {
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
    },
    password_confirmation: {
      elementType: 'input',
      elementConfig: {
        type: 'password',
        placeholder: 'Confirm Password'
      },
      value: '',
      validation: {
        required: true,
        minLength: 6
      },
      valid: false,
      touched: false
    }
  };

  const loginFields = {
    username: {
      elementType: 'input',
      elementConfig: {
        type: 'username',
        placeholder: 'Username'
      },
      value: '',
      validation: {
        required: true
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
        required: true
      },
      valid: false,
      touched: false
    }
  }

  const [controls, setControls] = useState( props.isSignUp ? signupFields : loginFields );

  const checkValidity = (value, rules) => {
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

  const inputChangedHandler = (event, controlName) => {
    const updatedControls = {
      ...controls,
      [controlName]: {
        ...controls[controlName],
        value: event.target.value,
        valid: checkValidity(event.target.value, controls[controlName].validation),
        touched: true
      }
    };
    setControls(updatedControls);
  }

  const submitHandler = (event) => {
    event.preventDefault();
    const { username, password, password_confirmation } = controls;

    if (props.isSignUp) {
      // SignUp
      axios
        .post('/api/v1/users', {
          user: {
            username: username.value,
            password: password.value,
            password_confirmation: password_confirmation.value
          }
        })
        .then(resp => console.log(resp));
    } else {
      // Login
      axios
        .post('/api/v1/authenticate', {
          username: username.value,
          password: password.value
        })
        .then(resp => {
          const { token } = resp.data;
          appCtx.login(token);
          props.history.push('/');
        })
        .catch(err => {
          setGlobal({
            ...global,
            flash: {
              type: 'error',
              message: 'Bad news. You can\'t come in.', type: 'error', isOpen: true,
              isOpen: true
            }
          });
        });
    }
  }

  const formElementsArray = [];
  for ( let key in controls ) {
    formElementsArray.push({
      id: key,
      config: controls[key]
    });
  }

  const form = formElementsArray.map(formElement => (
    <Input
      key={formElement.id}
      elementType={formElement.config.elementType}
      elementConfig={formElement.config.elementConfig}
      value={formElement.config.value}
      invalid={!formElement.config.valid}
      shouldValidate={formElement.config.validation}
      touched={formElement.config.touched}
      changed={( event ) => inputChangedHandler( event, formElement.id )} />
  ));

  return (
    <div className={classes.Auth}>
      <div className={classes['title-bar']}>
        Soultrust Movie Database
      </div>
      <form onSubmit={submitHandler}>
        <div className={classes.fields}>
          {form}
        </div>
        <Button
          className={classes['btn-login']}
          variant="outlined"
          type="submit">
            {props.isSignUp ? 'SUBMIT' : 'LOGIN'}
        </Button>
      </form>
    </div>
  );
}

export default Auth;