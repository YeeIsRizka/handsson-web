import React, { useCallback, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useMultiplayerState, useIsHost, getRoomCode } from "playroomkit";
import { useLoading } from "../../../shared/context/LoadingContext";

import MainGameplay from "../../gameplay/components/MainGameplay";
import ReadyOverlay from "../../gameplay/components/ReadyOverlay";
import GameplayHeader from "../../gameplay/components/GameplayHeader";
import useReadyCheck from "../../gameplay/hooks/useReadyCheck";
import useTraining from "../hooks/useTraining";

function TrainingMode() {
  const {
    gameplayState,
    progressState,
    handleGestureDetected,
  } = useTraining();

  const navigate = useNavigate();
  const { navigateWithLoading } = useLoading();
  const amIHost = useIsHost();
  const [gameStarted, setGameStarted] = useMultiplayerState("gameStarted", null);
  const [started, setStarted] = useState(false);

  // If host resets gameStarted to null (meaning back to lobby), guests should follow
  useEffect(() => {
    if (!gameStarted && !amIHost) {
      window.__ALLOW_NAVIGATE__ = true;
      navigateWithLoading(getRoomCode() ? `/#r=R${getRoomCode()}` : "/", { message: "Kembali ke Lobby..." });
    }
  }, [gameStarted, amIHost, navigateWithLoading]);

  const handleEndMatch = useCallback(() => {
    if (amIHost) {
      setGameStarted(null);
    }
    window.__ALLOW_NAVIGATE__ = true;
    navigateWithLoading(getRoomCode() ? `/#r=R${getRoomCode()}` : "/", { message: "Kembali ke Lobby..." });
  }, [navigateWithLoading, amIHost, setGameStarted]);

  const handleStart = useCallback(() => {
    setStarted(true);
  }, []);

  const {
    phase,
    countdown,
    isPreGame,
    handleHandsDetected,
    playersList,
  } = useReadyCheck({ onStart: handleStart });

  return (
    <div className="min-h-screen bg-neo-bg text-neo-text flex flex-col max-h-screen overflow-hidden">
      <GameplayHeader 
        title="Mode Latihan" 
        onEndMatch={handleEndMatch}
        endMatchText="Kembali ke Lobby"
      />

      <MainGameplay
        gameplayState={gameplayState}
        progressState={progressState}
        onGestureDetected={isPreGame ? () => {} : handleGestureDetected}
        onHandsDetected={handleHandsDetected}
        isPaused={isPreGame}
        hideGameUI={isPreGame}
        successSubMessage="Menuju kata selanjutnya..."
        cameraOverlay={
          <ReadyOverlay phase={phase} countdown={countdown} playersList={playersList} />
        }
      />
    </div>
  );
}

export default TrainingMode;
