import React, { useEffect, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useIsHost, useMultiplayerState, getRoomCode, usePlayersList } from "playroomkit";
import { useLoading } from "../../../shared/context/LoadingContext";

import MainGameplay from "../../gameplay/components/MainGameplay";
import ReadyOverlay from "../../gameplay/components/ReadyOverlay";
import GameplayHeader from "../../gameplay/components/GameplayHeader";
import useReadyCheck from "../../gameplay/hooks/useReadyCheck";
import TimerBar from "../../gameplay/components/TimerBar";
import useSurvival from "../hooks/useSurvival";
import PlayerTimeBar from "./PlayerTimeBar";
import useHostDisband from "../../../shared/hooks/useHostDisband";
import EliminatedOverlay from "../../gameplay/components/EliminatedOverlay";

import TimeUpScreen from "../../gameplay/components/TimeUpScreen";


function SurvivalMode() {
  const navigate = useNavigate();
  const { navigateWithLoading } = useLoading();
  const location = useLocation();
  const amIHost = useIsHost();
  const { disbandLobby, DisbandWarningModal, HostDisbandConfirmModal } = useHostDisband();
  const [gameStarted, setGameStarted] = useMultiplayerState("gameStarted", null);

  const {
    gameplayState,
    progressState,
    survivalState,
    timeProgress,
    humanPlayer,
    handleGestureDetected,
    startSurvival,
    resetSurvival,
    forceEndSurvival,
    initialDuration,
  } = useSurvival();

  const {
    phase,
    countdown,
    isPreGame,
    handleHandsDetected,
    playersList,
  } = useReadyCheck({ onStart: startSurvival });

  const isFinished = survivalState?.isFinished ?? false;
  const timeMultiplier = humanPlayer?.timeMultiplier ?? 1.0;
  const amIEliminated = humanPlayer?.isEliminated ?? false;

  const currentBonusTime = (gameplayState?.currentWordData?.word?.length || 0) * 3;

  const humanPlayersState = usePlayersList(true);
  const [bots] = useMultiplayerState("bots", []);

  const nameCounts = {};
  const previewPlayers = [...humanPlayersState]
    .sort((a, b) => (a.getState("joinTime") || 0) - (b.getState("joinTime") || 0))
    .map((p, index) => {
      const baseName = p.getState("customName") || p.getProfile().name || `Player ${index + 1}`;
      let finalName = baseName;
      if (nameCounts[baseName]) {
        nameCounts[baseName]++;
        finalName = `${baseName} ${nameCounts[baseName]}`;
      } else {
        nameCounts[baseName] = 1;
      }
      return {
        id: p.id,
        name: finalName,
        survivedTime: 0,
        timeRemaining: initialDuration,
        isHuman: true,
        isEliminated: false,
        color: p.getState("customColor") || p.getProfile().color?.hexString,
        photo: p.getState("customPhoto") || p.getProfile().photo,
      };
    });

  const displayPlayers = survivalState?.isStarted ? (survivalState?.players || []) : [...previewPlayers, ...bots.map(b => ({ ...b, survivedTime: 0, timeRemaining: initialDuration, isEliminated: false }))];

  // If host resets gameStarted to null (meaning back to lobby), guests should follow
  useEffect(() => {
    if (!gameStarted && !amIHost) {
      window.__ALLOW_NAVIGATE__ = true;
      navigateWithLoading(getRoomCode() ? `/#r=R${getRoomCode()}` : "/", { message: "Kembali ke Lobby..." });
    }
  }, [gameStarted, amIHost, navigateWithLoading]);

  const handlePlayAgain = () => {
    if (!amIHost) return;
    resetSurvival();
    setGameStarted(null);
    window.__ALLOW_NAVIGATE__ = true;
    navigateWithLoading(getRoomCode() ? `/#r=R${getRoomCode()}` : "/", { message: "Kembali ke Lobby..." });
  };

  const handleExit = () => {
    disbandLobby();
  };

  const cameraOverlay = amIEliminated ? (
    <EliminatedOverlay />
  ) : (
    <ReadyOverlay phase={phase} countdown={countdown} playersList={playersList} />
  );

  return (
    <div className="min-h-screen bg-neo-bg text-neo-text flex flex-col max-h-screen overflow-hidden">
      <GameplayHeader
        title="Mode Survival"
        onEndMatch={amIHost ? forceEndSurvival : undefined}
      />

      {/* Time Bars */}
      <div className="w-full px-3 md:px-6 pt-3 z-10">
        <div className="bg-white border-brutal shadow-brutal w-full overflow-hidden p-1.5 md:p-0">
          <div className="grid grid-cols-2 gap-2 md:flex md:flex-row md:items-center w-full md:divide-x-2 md:divide-white/10 md:gap-0 py-1">
            {displayPlayers.map((player) => (
              <div key={player.id} className="w-full md:flex-1">
                <PlayerTimeBar player={player} maxTime={initialDuration} />
              </div>
            ))}
          </div>
        </div>
      </div>

      <MainGameplay
        gameplayState={gameplayState}
        progressState={progressState}
        onGestureDetected={isPreGame || isFinished || amIEliminated ? () => { } : handleGestureDetected}
        onHandsDetected={handleHandsDetected}
        isPaused={isPreGame || isFinished || amIEliminated}
        hideGameUI={isPreGame}
        disableSplitOverlay={amIEliminated || isFinished}
        successSubMessage={`+${currentBonusTime} Detik`}
        timerBar={
          (survivalState?.isStarted && !amIEliminated) ? (
            <TimerBar timeProgress={timeProgress} />
          ) : null
        }
        cameraOverlay={cameraOverlay}
        mobileFooterLeft={
          <div className="flex flex-col items-center justify-center w-16">
            <div className="text-lg font-black text-neo-text bg-neo-yellow border-brutal px-2 shadow-brutal-sm -rotate-3">+{currentBonusTime}s</div>
            <div className="text-[9px] uppercase tracking-wider text-neo-text font-black mt-1">Bonus</div>
          </div>
        }
        mobileFooterRight={
          <div className="flex flex-col items-center justify-center w-16">
            <div className="text-lg font-black text-white bg-neo-purple border-brutal px-2 shadow-brutal-sm rotate-3">{timeMultiplier.toFixed(1)}x</div>
            <div className="text-[9px] uppercase tracking-wider text-neo-text font-black mt-1">Speed</div>
          </div>
        }
        desktopFooterLeft={
          <div className="bg-neo-yellow border-brutal px-5 py-3 shadow-brutal flex flex-col items-center min-w-[140px] -rotate-2">
            <div className="text-[10px] sm:text-xs uppercase tracking-widest text-neo-text font-black mb-1 bg-white border-brutal px-2">Bonus Waktu</div>
            <div className="text-2xl font-black text-neo-text">+{currentBonusTime}s</div>
          </div>
        }
        desktopFooterRight={
          <div className="bg-neo-purple border-brutal px-5 py-3 shadow-brutal flex flex-col items-center min-w-[140px] rotate-2">
            <div className="text-[10px] sm:text-xs uppercase tracking-widest text-neo-text font-black mb-1 bg-white border-brutal px-2">Speed Waktu</div>
            <div className="text-2xl font-black text-white">{timeMultiplier.toFixed(1)}x</div>
          </div>
        }
      />

      {isFinished && (
        <TimeUpScreen
          players={[...(survivalState?.players || [])].map(p => ({
            ...p,
            effectiveSurvivedTime: (p.survivedTime || 0) + (!p.isEliminated ? (p.timeRemaining || 0) : 0)
          })).sort((a, b) => b.effectiveSurvivedTime - a.effectiveSurvivedTime)}
          subtitle="Sesi survival telah berakhir"
          renderPlayerScore={(player) => {
            const formatTime = (seconds) => {
              const m = Math.floor(seconds / 60);
              const s = Math.floor(seconds % 60);
              return m > 0 ? `${m}m ${s}s` : `${s}s`;
            };
            return (
              <div className="text-right bg-neo-green border-brutal px-2 py-1 shadow-[2px_2px_0px_0px_#000]">
                <div className="text-lg font-black text-white leading-none">
                  {formatTime(player.effectiveSurvivedTime)}
                </div>
                <div className="text-[10px] font-black text-neo-text uppercase mt-1">{player.wordsCompleted} Kata</div>
              </div>
            );
          }}
          amIHost={amIHost}
          onPlayAgain={handlePlayAgain}
          onExit={handleExit}
        />
      )}

      {/* Disband Modals */}
      <DisbandWarningModal />
      <HostDisbandConfirmModal />
    </div>
  );
}

export default SurvivalMode;
