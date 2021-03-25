import React, { Component, createContext } from 'react';

const MyContext = createContext();

class MyProvider extends Component {
  state = {
    flash: {
      message: '',
      isOpen: false,
      type: null
    }
  }
  render() {
    return (
      <MyContext.Provider value={{
        state: this.state,
        updateFlash: (message) => this.setState({
          flash: {
            ...this.state.flash,
            message: message,
            type: type,
            isOpen: true
          }
        })
      }}>
        {this.props.children}
      </MyContext.Provider>
    );
  }
}