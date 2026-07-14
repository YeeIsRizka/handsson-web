import React, { useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useLoading } from "../../../shared/context/LoadingContext";

import MainGameplay from "../../gameplay/components/MainGameplay";
import ReadyOverlay from "../../gameplay/components/ReadyOverlay";
import GameplayHeader from "../../gameplay/components/GameplayHeader";
import useReadyCheck from "../../gameplay/hooks/useReadyCheck";
import TimerBar from "../../gameplay/components/TimerBar";
import useBattle from "../hooks/useBattle";
import { calculateDamage, ROUND_DURATION } from "../utils/battleScoring";
import PlayerHPBar from "./PlayerHPBar";
import RoundResultOverlay from "./RoundResultOverlay";
import BattleGameOverScreen from "./BattleGameOverScreen";
import { useIsHost, setState, useMultiplayerState, myPlayer, getRoomCode, usePlayersList } from "playroomkit";
import useHostDisband from "../../../shared/hooks/useHostDisband";
import EliminatedOverlay from "../../gameplay/components/EliminatedOverlay";


function BattleMode() {
  const navigate = useNavigate();
  const { navigateWithLoading } = useLoading();
  const amIHost = useIsHost();
  const { disbandLobby, DisbandWarningModal, HostDisbandConfirmModal } = useHostDisband();
  const [gameStarted, setGameStarted] = useMultiplayerState("gameStarted", null);

  useEffect(() => {
    if (!gameStarted && !amIHost) {
      window.__ALLOW_NAVIGATE__ = true;
      navigateWithLoading(getRoomCode() ? `/#r=R${getRoomCode()}` : "/", { message: "Kembali ke Lobby..." });
    }
  }, [gameStarted, amIHost, navigateWithLoading]);

  const {
    gameplayState,
    progressState,
    handleGestureDetected,
    spellingLoadNextWord,

    players,
    currentRound,
    roundPhase,
    roundTimeRemaining,
    timeProgress,
    currentWord,
    roundSummary,
    winnerId,
    isBattleStarted,
    isHumanFinished,
    finishedPlayerIds,

    startBattle,
    nextRound,
    prepareRound,
    startSpellingPhase,
    forceEndBattle,
    isFinished,

    ROUND_PHASES: PHASES,
  } = useBattle();

  const myId = myPlayer()?.id;
  const amIEliminated = players.find(p => p.id === myId)?.isEliminated ?? false;
  const eliminatedPlayerIds = players.filter(p => p.isEliminated).map(p => p.id);

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
        hp: 100,
        isHuman: true,
        isEliminated: false,
        color: p.getState("customColor") || p.getProfile().color?.hexString,
        photo: p.getState("customPhoto") || p.getProfile().photo,
      };
    });

  const displayPlayers = isBattleStarted ? players : [...previewPlayers, ...bots.map(b => ({ ...b, hp: 100, isEliminated: false }))];


  const {
    phase,
    countdown,
    isPreGame,
    handleHandsDetected,
    reset: resetReady,
    playersList,
  } = useReadyCheck({
    onStart: () => {
      if (!isBattleStarted) {
        startBattle();
      } else {
        startSpellingPhase();
      }
    },
    ignoredPlayerIds: eliminatedPlayerIds,
  });


  const prevRoundPhaseRef = React.useRef(roundPhase);
  useEffect(() => {
    if (prevRoundPhaseRef.current === PHASES.ROUND_RESULT && roundPhase === PHASES.PRE_ROUND) {
      resetReady();
    }
    prevRoundPhaseRef.current = roundPhase;
  }, [roundPhase, resetReady, PHASES]);

  const isSpelling = roundPhase === PHASES.SPELLING;
  const isResult = roundPhase === PHASES.ROUND_RESULT;
  const isGameOver = roundPhase === PHASES.GAME_OVER;


  const isPaused = isPreGame || !isSpelling || isHumanFinished || amIEliminated;


  const hideGameUI = isPreGame || amIEliminated;

  const wordLength = currentWord?.word?.length || 0;
  const minDamage = calculateDamage(wordLength, ROUND_DURATION);

  const handlePlayAgain = useCallback(() => {
    if (!amIHost) return;
    setState("battleState", null, true);
    setGameStarted(null);
    window.__ALLOW_NAVIGATE__ = true;
    navigateWithLoading(getRoomCode() ? `/#r=R${getRoomCode()}` : "/", { message: "Kembali ke Lobby..." });
  }, [amIHost, navigateWithLoading, setGameStarted]);

  const handleExit = useCallback(() => {
    if (amIHost) disbandLobby();
    else {
      window.__ALLOW_NAVIGATE__ = true;
      window.location.href = window.location.origin;
    }
  }, [amIHost, disbandLobby]);

  const handleNextRound = useCallback(() => {
    if (!amIHost) return;
    nextRound();
    resetReady();
  }, [amIHost, nextRound, resetReady]);


  const cameraOverlay = amIEliminated ? (
    <EliminatedOverlay title="Tereliminasi" message="Menunggu sisa pertempuran..." />
  ) : (
    <ReadyOverlay phase={phase} countdown={countdown} playersList={playersList} />
  );

  return (
    <div className="min-h-screen bg-neo-bg text-neo-text flex flex-col max-h-screen overflow-hidden">
      <GameplayHeader
        title="Mode Battle"
        onEndMatch={amIHost ? forceEndBattle : undefined}
      />


      <div className="bg-white border-b-brutal px-3 py-2">

        <div className="hidden md:flex flex-row items-center gap-3 w-full">
          {displayPlayers.map((player, index) => (
            <React.Fragment key={player.id}>
              <div className="flex-1">
                <PlayerHPBar 
                  player={player} 
                  isSpellingPhase={isSpelling}
                  isFinishedSpelling={finishedPlayerIds.includes(player.id)}
                />
              </div>
              {index < displayPlayers.length - 1 && (
                <div className="font-black italic text-red-500 text-xl tracking-wider drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] opacity-90 shrink-0">
                  VS
                </div>
              )}
            </React.Fragment>
          ))}
        </div>

        <div className="md:hidden flex flex-row flex-wrap items-center justify-center gap-2 w-full">
          {displayPlayers.map((player) => (
            <React.Fragment key={player.id}>
              <div className="flex-1 min-w-[45%] max-w-full">
                <PlayerHPBar 
                  player={player} 
                  isCompact 
                  isSpellingPhase={isSpelling}
                  isFinishedSpelling={finishedPlayerIds.includes(player.id)}
                />
              </div>
            </React.Fragment>
          ))}
        </div>
      </div>

      <MainGameplay
        gameplayState={gameplayState}
        progressState={progressState}
        onGestureDetected={isPaused || isGameOver ? () => { } : handleGestureDetected}
        onHandsDetected={handleHandsDetected}
        isPaused={isPaused || isGameOver}
        hideGameUI={hideGameUI}
        disableSplitOverlay={amIEliminated || isGameOver}
        successSubMessage={isHumanFinished ? "Menunggu Lawan..." : "Kata selesai!"}
        timerBar={
          (!isPreGame && !isResult && !isGameOver && !amIEliminated) ? <TimerBar timeProgress={timeProgress} /> : null
        }
        cameraOverlay={cameraOverlay}
        mobileFooterLeft={
          <div className="flex flex-col items-center justify-center w-16">
            <div className="text-lg font-black text-neo-text bg-neo-yellow border-brutal px-2 shadow-brutal-sm -rotate-3">{minDamage}</div>
            <div className="text-[9px] uppercase tracking-wider text-neo-text font-black mt-1">Min DMG</div>
          </div>
        }
        mobileFooterRight={
          <div className="flex flex-col items-center justify-center w-16">
            <div className="text-lg font-black text-white bg-neo-purple border-brutal px-2 shadow-brutal-sm rotate-3">R{currentRound}</div>
            <div className="text-[9px] uppercase tracking-wider text-neo-text font-black mt-1">Round</div>
          </div>
        }
        desktopFooterLeft={
          <div className="bg-neo-yellow border-brutal px-5 py-3 shadow-brutal flex flex-col items-center min-w-[140px] -rotate-2">
            <div className="text-[10px] sm:text-xs uppercase tracking-widest text-neo-text font-black mb-1 bg-white border-brutal px-2">Min Damage</div>
            <div className="text-2xl font-black text-neo-text">{minDamage}</div>
          </div>
        }
        desktopFooterRight={
          <div className="bg-neo-purple border-brutal px-5 py-3 shadow-brutal flex flex-col items-center min-w-[140px] rotate-2">
            <div className="text-[10px] sm:text-xs uppercase tracking-widest text-neo-text font-black mb-1 bg-white border-brutal px-2">Round</div>
            <div className="text-2xl font-black text-white">{currentRound}</div>
          </div>
        }
      />


      {isResult && (
        <RoundResultOverlay
          roundSummary={roundSummary}
          currentRound={currentRound}
          onContinue={handleNextRound}
        />
      )}


      {isGameOver && (
        <BattleGameOverScreen
          players={players}
          winnerId={winnerId}
          onPlayAgain={handlePlayAgain}
          onExit={handleExit}
        />
      )}

      <DisbandWarningModal />
      <HostDisbandConfirmModal />
    </div>
  );
}

export default BattleMode;
