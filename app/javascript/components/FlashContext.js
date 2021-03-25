import React, { useState, createContext } from 'react';

export const FlashContext = createContext();

export const FlashProvider = (props) => {
  const [flash, setFlash] = useState({
    message: 'hello you\'re done for today',
    type: null,
    isOpen: false
  });
  return (
    <FlashContext.Provider value={[flash, setFlash]}>
      {props.children}
    </FlashContext.Provider>
  );
}