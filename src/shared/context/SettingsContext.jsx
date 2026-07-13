import React, { createContext, useContext, useState, useEffect } from 'react';

const SettingsContext = createContext();

export function SettingsProvider({ children }) {

  const [showHint, setShowHintState] = useState(() => {
    const saved = localStorage.getItem('handson_show_hint');
    return saved !== null ? saved === 'true' : true;
  });

  const setShowHint = (value) => {
    setShowHintState(value);
    localStorage.setItem('handson_show_hint', value ? 'true' : 'false');
  };

  return (
    <SettingsContext.Provider value={{
      showHint,
      setShowHint
    }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  return useContext(SettingsContext);
}
