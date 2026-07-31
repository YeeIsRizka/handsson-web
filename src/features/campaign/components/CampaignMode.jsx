import React, { useCallback, useEffect } from "react";
import { useMultiplayerState, useIsHost, getRoomCode } from "playroomkit";
import { useLoading } from "../../../shared/context/LoadingContext";

import MainGameplay from "../../gameplay/components/MainGameplay";
import ReadyOverlay from "../../gameplay/components/ReadyOverlay";
import GameplayHeader from "../../gameplay/components/GameplayHeader";
import TimerBar from "../../gameplay/components/TimerBar";
import useReadyCheck from "../../gameplay/hooks/useReadyCheck";
import useCampaign from "../hooks/useCampaign";
import CampaignResultScreen from "./CampaignResultScreen";

function CampaignMode() {
  const { navigateWithLoading } = useLoading();
  const amIHost = useIsHost();
  const [gameStarted, setGameStarted] = useMultiplayerState("gameStarted", null);

  const {
    gameplayState,
    progressState,
    handleGestureDetected,

    currentLevel,
    phase,
    levelResults,
    levelScore,
    timeRemaining,
    timeProgress,
    totalScore,
    totalTime,

    startLevel,
    nextLevel,
    restartCampaign,
    failCampaign,

    CAMPAIGN_PHASES,
    TOTAL_LEVELS,
  } = useCampaign();

  useEffect(() => {
    if (!gameStarted && !amIHost) {
      window.__ALLOW_NAVIGATE__ = true;
      navigateWithLoading(getRoomCode() ? `/#r=R${getRoomCode()}` : "/", {
        message: "Kembali ke Lobby...",
      });
    }
  }, [gameStarted, amIHost, navigateWithLoading]);

  const handleBackToLobby = useCallback(() => {
    if (amIHost) setGameStarted(null);
    window.__ALLOW_NAVIGATE__ = true;
    navigateWithLoading(getRoomCode() ? `/#r=R${getRoomCode()}` : "/", {
      message: "Kembali ke Lobby...",
    });
  }, [amIHost, navigateWithLoading, setGameStarted]);

  const handleEndMatch = useCallback(() => {
    failCampaign();
  }, [failCampaign]);

  const isPlaying = phase === CAMPAIGN_PHASES.PLAYING;
  const isResult =
    phase === CAMPAIGN_PHASES.LEVEL_COMPLETE ||
    phase === CAMPAIGN_PHASES.LEVEL_FAILED ||
    phase === CAMPAIGN_PHASES.CAMPAIGN_COMPLETE;

  const handleStart = useCallback(() => {
    startLevel(currentLevel);
  }, [startLevel, currentLevel]);

  const {
    phase: readyPhase,
    countdown,
    isPreGame: isReadyPreGame,
    handleHandsDetected,
    playersList,
    reset: resetReady,
  } = useReadyCheck({ onStart: handleStart });

  const handleRestartCampaign = useCallback(() => {
    restartCampaign();
    resetReady();
  }, [restartCampaign, resetReady]);

  const handleNextLevel = useCallback(() => {
    nextLevel();
    resetReady();
  }, [nextLevel, resetReady]);

  const lastResult = levelResults[levelResults.length - 1];
  const currentLevelResult = lastResult?.level === currentLevel ? lastResult : null;
  const displayedLevelScore = currentLevelResult?.score ?? levelScore;
  const displayedTimeUsed = currentLevelResult?.timeUsed ?? 0;

  const resultType =
    phase === CAMPAIGN_PHASES.CAMPAIGN_COMPLETE
      ? "campaign_complete"
      : phase === CAMPAIGN_PHASES.LEVEL_FAILED
        ? "level_failed"
        : "level_complete";

  const isPaused = isReadyPreGame || !isPlaying || isResult;
  const hideGameUI = isReadyPreGame || isResult;

  return (
    <div className="min-h-screen bg-neo-bg text-neo-text flex flex-col max-h-screen overflow-hidden">
      <GameplayHeader
        title="Mode Campaign"
        onEndMatch={handleEndMatch}
        endMatchText="Akhiri Permainan"
        lockHint={true}
      />

      <MainGameplay
        gameplayState={gameplayState}
        progressState={progressState}
        onGestureDetected={isPaused ? () => { } : handleGestureDetected}
        onHandsDetected={handleHandsDetected}
        isPaused={isPaused}
        hideGameUI={hideGameUI}
        successSubMessage="Menuju kata selanjutnya..."
        timerBar={
          isPlaying && !isResult ? (
            <TimerBar timeProgress={timeProgress} />
          ) : null
        }
        cameraOverlay={
          <ReadyOverlay
            phase={readyPhase}
            countdown={countdown}
            playersList={playersList}
          />
        }
        mobileFooterLeft={
          isPlaying ? (
            <div className="flex flex-col items-center justify-center w-16">
              <div className="text-lg font-black text-neo-text bg-neo-yellow border-brutal px-2 shadow-brutal-sm -rotate-3">
                {levelScore}
              </div>
              <div className="text-[9px] uppercase tracking-wider text-neo-text font-black mt-1">
                Skor
              </div>
            </div>
          ) : null
        }
        mobileFooterRight={
          isPlaying ? (
            <div className="flex flex-col items-center justify-center w-16">
              <div className="text-lg font-black text-white bg-neo-purple border-brutal px-2 shadow-brutal-sm rotate-3">
                L{currentLevel}/{TOTAL_LEVELS}
              </div>
              <div className="text-[9px] uppercase tracking-wider text-neo-text font-black mt-1">
                Level
              </div>
            </div>
          ) : null
        }
        desktopFooterLeft={
          isPlaying ? (
            <div className="bg-neo-yellow border-brutal px-5 py-3 shadow-brutal flex flex-col items-center min-w-[140px] -rotate-2">
              <div className="text-[10px] sm:text-xs uppercase tracking-widest text-neo-text font-black mb-1 bg-white border-brutal px-2">
                Skor Level
              </div>
              <div className="text-2xl font-black text-neo-text">{levelScore}</div>
            </div>
          ) : null
        }
        desktopFooterRight={
          isPlaying ? (
            <div className="bg-neo-purple border-brutal px-5 py-3 shadow-brutal flex flex-col items-center min-w-[140px] rotate-2">
              <div className="text-[10px] sm:text-xs uppercase tracking-widest text-neo-text font-black mb-1 bg-white border-brutal px-2">
                Level
              </div>
              <div className="text-2xl font-black text-white">{currentLevel} / {TOTAL_LEVELS}</div>
            </div>
          ) : null
        }
      />

      {/* Result screen overlay */}
      {isResult && (
        <CampaignResultScreen
          type={resultType}
          currentLevel={currentLevel}
          levelScore={displayedLevelScore}
          levelTimeUsed={displayedTimeUsed}
          levelResults={levelResults}
          totalScore={totalScore}
          totalTime={totalTime}
          onNextLevel={handleNextLevel}
          onRestartCampaign={handleRestartCampaign}
          onBackToLobby={handleBackToLobby}
        />
      )}
    </div>
  );
}

export default CampaignMode;
