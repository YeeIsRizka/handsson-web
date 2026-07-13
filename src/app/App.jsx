import React, { useState } from "react";
import AppRouter from "./router";
import { AudioProvider } from "../shared/context/AudioContext";
import { SettingsProvider } from "../shared/context/SettingsContext";
import SplashScreen from "../shared/components/SplashScreen";

function App() {
  const [showSplash, setShowSplash] = useState(() => {
    return !sessionStorage.getItem("hasSeenSplash");
  });

  const handleSplashComplete = () => {
    sessionStorage.setItem("hasSeenSplash", "true");
    setShowSplash(false);
  };
  return (
    <>
      {showSplash && <SplashScreen onComplete={handleSplashComplete} />}
      <SettingsProvider>
        <AudioProvider>
          <AppRouter />
        </AudioProvider>
      </SettingsProvider>
    </>
  );
}

export default App;
