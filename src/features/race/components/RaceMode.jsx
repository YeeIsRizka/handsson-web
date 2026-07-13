import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { usePlayersList, useMultiplayerState, myPlayer, useIsHost, getRoomCode } from "playroomkit";
import { useLoading } from "../../../shared/context/LoadingContext";

import MainGameplay from "../../gameplay/components/MainGameplay";
import ReadyOverlay from "../../gameplay/components/ReadyOverlay";
import GameplayHeader from "../../gameplay/components/GameplayHeader";
import useReadyCheck from "../../gameplay/hooks/useReadyCheck";
import TimerBar from "../../gameplay/components/TimerBar";
import useRace from "../hooks/useRace";
import RaceTrack from "./PlayerScoreBar";
import useHostDisband from "../../../shared/hooks/useHostDisband";

import TimeUpScreen from "../../gameplay/components/TimeUpScreen";


function RaceMode() {
  const navigate = useNavigate();
  const { navigateWithLoading } = useLoading();
  const amIHost = useIsHost();
  const { disbandLobby, DisbandWarningModal, HostDisbandConfirmModal } = useHostDisband();

  const {
    gameplayState,
    progressState,
    timeProgress,
    humanScore,
    handleGestureDetected,
    startRace,
    resetRace,
    forceEndRace,
    isFinished,
    isStarted,
    botScores
  } = useRace();

  const humanPlayersState = usePlayersList(true);
  const [bots] = useMultiplayerState("bots", []);
  const [gameStarted, setGameStarted] = useMultiplayerState("gameStarted", null);


  useEffect(() => {
    if (!gameStarted && !amIHost) {
      window.__ALLOW_NAVIGATE__ = true;
      navigateWithLoading(getRoomCode() ? `/#r=R${getRoomCode()}` : "/", { message: "Kembali ke Lobby..." });
    }
  }, [gameStarted, amIHost, navigateWithLoading]);


  const nameCounts = {};
  const sortedHumans = [...humanPlayersState]
    .filter(p => p.getState("profileSetupDone") || p.id === myPlayer()?.id)
    .sort((a, b) => {
      const timeA = a.getState("joinTime") || 0;
      const timeB = b.getState("joinTime") || 0;
      return timeA - timeB;
    });

  const mappedHumans = sortedHumans.map((p, index) => {
    const profile = p.getProfile();
    const customName = p.getState("customName");
    const baseName = customName || profile.name || `Player ${index + 1}`;
    
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
      isHuman: true,
      hp: 100,
      score: p.getState("raceScore") || 0,
      playroomState: p,
      isMe: p.id === myPlayer()?.id,
      color: p.getState("customColor") || profile.color?.hexString,
      photo: p.getState("customPhoto") || profile.photo,
    };
  });

  const mappedBots = (bots || []).map(bot => {
    let finalName = bot.name;
    if (nameCounts[bot.name]) {
      nameCounts[bot.name]++;
      finalName = `${bot.name} ${nameCounts[bot.name]}`;
    } else {
      nameCounts[bot.name] = 1;
    }
    return { ...bot, name: finalName, score: botScores[bot.id] || 0 };
  });

  const players = [...mappedHumans, ...mappedBots];

  const {
    phase,
    countdown,
    isPreGame,
    handleHandsDetected,
    playersList,
  } = useReadyCheck({ onStart: startRace });


  const highestScore = Math.max(...players.map(p => p.score || 0), 100);
  const targetScore = Math.floor(highestScore * 1.15);

  const currentWordPoints =
    gameplayState?.currentWordData?.points ??
    ((gameplayState?.currentWordData?.word?.length || 0) * 5);

  const handlePlayAgain = () => {
    if (!amIHost) return;

    humanPlayersState.forEach(p => p.setState("raceScore", 0, true));
    resetRace();
    setGameStarted(null);
    window.__ALLOW_NAVIGATE__ = true;
    navigateWithLoading(getRoomCode() ? `/#r=R${getRoomCode()}` : "/", { message: "Kembali ke Lobby..." });
  };

  const handleExit = () => {
    disbandLobby();
  };

  return (
    <div className="min-h-screen bg-neo-bg text-neo-text flex flex-col max-h-screen overflow-hidden">
      <GameplayHeader 
        title="Mode Race" 
        onEndMatch={amIHost ? forceEndRace : undefined}
      />


      <div className="w-full px-3 md:px-6 pt-3 z-10">
        <RaceTrack players={players} targetScore={targetScore} />
      </div>

      <MainGameplay
        gameplayState={gameplayState}
        progressState={progressState}
        onGestureDetected={isPreGame || isFinished ? () => {} : handleGestureDetected}
        onHandsDetected={handleHandsDetected}
        isPaused={isPreGame || isFinished}
        hideGameUI={isPreGame}
        successSubMessage={`+${currentWordPoints} Poin`}
        timerBar={
          isStarted ? <TimerBar timeProgress={timeProgress} /> : null
        }
        cameraOverlay={
          <ReadyOverlay phase={phase} countdown={countdown} playersList={playersList} />
        }
        mobileFooterLeft={
          <div className="flex flex-col items-center justify-center w-16">
            <div className="text-lg font-black text-neo-text bg-neo-yellow border-brutal px-2 shadow-brutal-sm -rotate-3">+{currentWordPoints}</div>
            <div className="text-[9px] uppercase tracking-wider text-neo-text font-black mt-1">Poin</div>
          </div>
        }
        mobileFooterRight={
          <div className="flex flex-col items-center justify-center w-16">
            <div className="text-lg font-black text-white bg-neo-purple border-brutal px-2 shadow-brutal-sm rotate-3">{humanScore}</div>
            <div className="text-[9px] uppercase tracking-wider text-neo-text font-black mt-1">Skor</div>
          </div>
        }
        desktopFooterLeft={
          <div className="bg-neo-yellow border-brutal px-5 py-3 shadow-brutal flex flex-col items-center min-w-[140px] -rotate-2">
            <div className="text-[10px] sm:text-xs uppercase tracking-widest text-neo-text font-black mb-1 bg-white border-brutal px-2">Poin Kata</div>
            <div className="text-2xl font-black text-neo-text">+{currentWordPoints}</div>
          </div>
        }
        desktopFooterRight={
          <div className="bg-neo-purple border-brutal px-5 py-3 shadow-brutal flex flex-col items-center min-w-[140px] rotate-2">
            <div className="text-[10px] sm:text-xs uppercase tracking-widest text-neo-text font-black mb-1 bg-white border-brutal px-2">Skor Anda</div>
            <div className="text-2xl font-black text-white">{humanScore}</div>
          </div>
        }
      />

      {isFinished && (
        <TimeUpScreen
          players={[...players].sort((a, b) => (b.score || 0) - (a.score || 0))}
          subtitle="Sesi race telah berakhir"
          renderPlayerScore={(player) => (
            <div className="text-lg font-black text-white bg-neo-green border-brutal px-2 py-1">
              {player.score || 0}
            </div>
          )}
          onPlayAgain={handlePlayAgain}
          onExit={handleExit}
          amIHost={amIHost}
        />
      )}

      <DisbandWarningModal />
      <HostDisbandConfirmModal />
    </div>
  );
}

export default RaceMode;
