import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { useMultiplayerState, usePlayersList, myPlayer, useIsHost } from "playroomkit";
import useSpelling from "../../gameplay/hooks/useSpelling";
import { getRandomLocalWord, resetWordCycle } from "../../gameplay/utils/localWords";
import useAIOpponents from "./useAIOpponent";
import { applyRoundResults, ROUND_DURATION } from "../utils/battleScoring";

const ROUND_PHASES = {
  PRE_ROUND: "PRE_ROUND",
  COUNTDOWN: "COUNTDOWN",
  SPELLING: "SPELLING",
  ROUND_RESULT: "ROUND_RESULT",
  GAME_OVER: "GAME_OVER",
};

function useBattle() {
  const amIHost = useIsHost();
  const humanPlayersState = usePlayersList(true);
  const [lobbyBots] = useMultiplayerState("bots", []);

  const [battleState, setBattleState] = useMultiplayerState("battleState", {
    isStarted: false,
    isFinished: false,
    players: [],
    currentRound: 1,
    roundPhase: ROUND_PHASES.PRE_ROUND,
    roundStartTime: null,
    currentWord: null,
    roundSummary: [],
    winnerId: null
  });


  useEffect(() => {
    if (amIHost) {
      if (!battleState || !battleState.currentWord) {
        setBattleState({
          ...(battleState || {
            isStarted: false,
            isFinished: false,
            players: [],
            currentRound: 1,
            roundPhase: ROUND_PHASES.PRE_ROUND,
            roundStartTime: null,
            roundSummary: [],
            winnerId: null
          }),
          currentWord: getRandomLocalWord()
        });
      }
    }
  }, [amIHost, battleState, setBattleState]);

  const battleStateRef = useRef(battleState);
  useEffect(() => {
    battleStateRef.current = battleState;
  }, [battleState]);

  const [localTimeRemaining, setLocalTimeRemaining] = useState(ROUND_DURATION);
  const [isHumanFinished, setIsHumanFinished] = useState(false);
  const humanFinishedRef = useRef(false);
  const endRoundTimeoutRef = useRef(null);


  useEffect(() => {
    return () => {
      if (endRoundTimeoutRef.current) clearTimeout(endRoundTimeoutRef.current);
    };
  }, []);


  // We will handle the local timer inside the main interval to avoid re-render loops


  const activeAiCount = battleState?.players?.filter((p) => !p.isHuman && !p.isEliminated).length || 0;
  const wordLength = battleState?.currentWord?.word?.length || 4;

  const isSpellingPhase = battleState?.roundPhase === ROUND_PHASES.SPELLING;

  const { aiSchedules, resetAI, expectedFinishCount } = useAIOpponents({
    playerCount: activeAiCount,
    roundDuration: ROUND_DURATION,
    wordLength,
    isSpelling: amIHost && isSpellingPhase,
  });


  const handleWordCompleted = useCallback(() => {
    if (humanFinishedRef.current) return;

    const elapsed = battleStateRef.current?.roundStartTime
      ? (Date.now() - battleStateRef.current.roundStartTime) / 1000
      : ROUND_DURATION;

    const finishTime = Math.min(elapsed, ROUND_DURATION);

    const me = myPlayer();
    if (me) {
      me.setState("battleFinishTime", finishTime, true);
    }

    humanFinishedRef.current = true;
    setIsHumanFinished(true);
  }, []);

  const getNextWordForBattle = useCallback(() => {
    return battleStateRef.current?.currentWord || getRandomLocalWord();
  }, []);

  const {
    gameplayState,
    progressState,
    handleGestureDetected,
    loadNextWord: spellingLoadNextWord,
  } = useSpelling({
    getNextWord: getNextWordForBattle,
    onWordCompleted: handleWordCompleted,
    successDelay: 500,
    autoLoadNextWord: false,
  });


  useEffect(() => {
    if (battleState?.currentWord && battleState.currentWord.id !== gameplayState.currentWordData?.id) {
      spellingLoadNextWord();
    }
  }, [battleState?.currentWord, gameplayState.currentWordData?.id, spellingLoadNextWord]);


  const prepareRound = useCallback(() => {
    if (!amIHost) return;
    const currentState = battleStateRef.current;
    if (!currentState) return;


    humanPlayersState.forEach((p) => {
      p.setState("battleFinishTime", null, true);
    });

    const word = getRandomLocalWord(currentState.currentWord?.id);
    resetAI();

    setBattleState({
      ...currentState,
      currentWord: word,
      roundPhase: ROUND_PHASES.PRE_ROUND,
      roundSummary: [],
    });
  }, [amIHost, humanPlayersState, resetAI, setBattleState]);


  const startBattle = useCallback(() => {
    if (!amIHost) return;
    resetWordCycle();

    let newPlayers = [];
    const nameCounts = {};


    const sortedHumans = [...humanPlayersState].sort((a, b) => (a.getState("joinTime") || 0) - (b.getState("joinTime") || 0));

    sortedHumans.forEach((p, index) => {
      p.setState("battleFinishTime", null, true);
      const baseName = p.getState("customName") || p.getProfile().name || `Player ${index + 1}`;
      let finalName = baseName;
      if (nameCounts[baseName]) {
        nameCounts[baseName]++;
        finalName = `${baseName} ${nameCounts[baseName]}`;
      } else {
        nameCounts[baseName] = 1;
      }
      newPlayers.push({
        id: p.id,
        name: finalName,
        hp: 100,
        isHuman: true,
        isEliminated: false,
        color: p.getState("customColor") || p.getProfile().color?.hexString,
        photo: p.getState("customPhoto") || p.getProfile().photo,
      });
    });


    lobbyBots.forEach(bot => {
      let finalName = bot.name;
      if (nameCounts[bot.name]) {
        nameCounts[bot.name]++;
        finalName = `${bot.name} ${nameCounts[bot.name]}`;
      } else {
        nameCounts[bot.name] = 1;
      }
      newPlayers.push({
        id: bot.id || Math.random().toString(36).substring(7),
        name: finalName,
        hp: 100,
        isHuman: false,
        isEliminated: false,
      });
    });

    const word = battleStateRef.current?.currentWord || getRandomLocalWord();
    resetAI();

    setBattleState({
      isStarted: true,
      isFinished: false,
      players: newPlayers,
      currentRound: 1,
      roundPhase: ROUND_PHASES.SPELLING,
      roundStartTime: Date.now(),
      currentWord: word,
      roundSummary: [],
      winnerId: null
    });
  }, [amIHost, humanPlayersState, lobbyBots, resetAI, setBattleState]);


  const endRound = useCallback(() => {
    if (!amIHost) return;
    const currentState = battleStateRef.current;
    if (!currentState || currentState.roundPhase !== ROUND_PHASES.SPELLING) return;

    const currentPlayers = currentState.players;
    const allResults = [];
    const elapsed = currentState.roundStartTime ? (Date.now() - currentState.roundStartTime) / 1000 : ROUND_DURATION;

    humanPlayersState.forEach((hp) => {
      const finishTime = hp.getState("battleFinishTime");
      if (finishTime !== undefined && finishTime !== null) {
        allResults.push({ playerId: hp.id, finishTime });
      }
    });


    const activeAIs = currentPlayers.filter((p) => !p.isHuman && !p.isEliminated);

    const finishedBots = aiSchedules.filter(schedule => elapsed >= schedule.finishTime);
    finishedBots.forEach((result, index) => {
      if (index < activeAIs.length) {
        allResults.push({
          playerId: activeAIs[index].id,
          finishTime: result.finishTime,
        });
      }
    });

    const { updatedPlayers, roundSummary } = applyRoundResults(
      currentPlayers,
      allResults,
      currentState.currentWord?.word?.length || 4
    );

    const alivePlayers = updatedPlayers.filter((p) => !p.isEliminated);
    let nextPhase = ROUND_PHASES.ROUND_RESULT;
    let winnerId = null;
    let isFinished = false;

    if (alivePlayers.length <= 1) {
      nextPhase = ROUND_PHASES.GAME_OVER;
      winnerId = alivePlayers.length === 1 ? alivePlayers[0].id : null;
      isFinished = true;
    }

    setBattleState({
      ...currentState,
      players: updatedPlayers,
      roundSummary,
      roundPhase: nextPhase,
      winnerId,
      isFinished
    });
  }, [amIHost, humanPlayersState, aiSchedules, setBattleState]);


  const startSpellingPhase = useCallback(() => {
    if (!amIHost) return;
    const currentState = battleStateRef.current;
    if (!currentState) return;
    setBattleState({
      ...currentState,
      roundPhase: ROUND_PHASES.SPELLING,
      roundStartTime: Date.now()
    });
  }, [amIHost, setBattleState]);


  const nextRound = useCallback(() => {
    if (!amIHost) return;
    const currentState = battleStateRef.current;
    if (!currentState) return;

    humanPlayersState.forEach((p) => p.setState("battleFinishTime", null, true));

    const word = getRandomLocalWord(currentState.currentWord?.id);
    resetAI();

    setBattleState({
      ...currentState,
      currentRound: currentState.currentRound + 1,
      currentWord: word,
      roundPhase: ROUND_PHASES.PRE_ROUND,
      roundSummary: []
    });
  }, [amIHost, humanPlayersState, resetAI, setBattleState]);

  const humanPlayersRef = useRef(humanPlayersState);
  useEffect(() => {
    humanPlayersRef.current = humanPlayersState;
  }, [humanPlayersState]);

  const aiSchedulesRef = useRef(aiSchedules);
  useEffect(() => {
    aiSchedulesRef.current = aiSchedules;
  }, [aiSchedules]);

  useEffect(() => {
    if (!battleState?.isStarted || battleState?.roundPhase !== ROUND_PHASES.SPELLING) {
      setLocalTimeRemaining(ROUND_DURATION);
      return;
    }

    const interval = setInterval(() => {
      const elapsed = (Date.now() - battleState.roundStartTime) / 1000;
      const remaining = Math.max(ROUND_DURATION - elapsed, 0);
      setLocalTimeRemaining(remaining);

      if (!amIHost) return;

      const timeIsUp = elapsed >= ROUND_DURATION;

      const activePlayers = battleState.players.filter(p => !p.isEliminated);
      const activeHumans = activePlayers.filter(p => p.isHuman);

      const allHumansDone = activeHumans.every(p => {
        const hpState = humanPlayersRef.current.find(h => h.id === p.id);
        if (!hpState) return true;
        const ft = hpState.getState("battleFinishTime");
        return ft !== undefined && ft !== null;
      });

      const finishedBots = aiSchedulesRef.current.filter(schedule => elapsed >= schedule.finishTime);
      const allAiDone = finishedBots.length >= expectedFinishCount;

      const shouldEndEarly = allHumansDone && allAiDone;

      if (timeIsUp || shouldEndEarly) {
        clearInterval(interval);
        endRound();
      }
    }, 100);

    return () => clearInterval(interval);
  }, [amIHost, battleState, expectedFinishCount, endRound]);


  useEffect(() => {
    if (battleState?.roundPhase === ROUND_PHASES.PRE_ROUND) {
      humanFinishedRef.current = false;
      setIsHumanFinished(false);
    }
  }, [battleState?.roundPhase]);


  const forceEndBattle = useCallback(() => {
    if (!amIHost) return;
    const currentState = battleStateRef.current;
    if (!currentState) return;

    const alivePlayers = currentState.players.filter(p => !p.isEliminated);
    let winnerId = null;

    if (alivePlayers.length > 0) {
      const sortedPlayers = [...alivePlayers].sort((a, b) => b.hp - a.hp);
      winnerId = sortedPlayers[0].id;
    }

    setBattleState({
      ...currentState,
      roundPhase: ROUND_PHASES.GAME_OVER,
      winnerId,
      isFinished: true
    });
  }, [amIHost, setBattleState]);
  const timeProgress = localTimeRemaining / ROUND_DURATION;


  const finishedPlayerIds = [];
  if (battleState?.players) {
    const activeAIs = battleState.players.filter(p => !p.isHuman && !p.isEliminated);
    battleState.players.forEach(p => {
      if (p.isEliminated) return;
      if (p.isHuman) {
        const hp = humanPlayersState.find(hpState => hpState.id === p.id);
        const ft = hp?.getState("battleFinishTime");
        if (ft !== undefined && ft !== null) finishedPlayerIds.push(p.id);
      } else {
        const aiIndex = activeAIs.findIndex(ai => ai.id === p.id);
        const elapsed = battleState?.roundStartTime ? (Date.now() - battleState.roundStartTime) / 1000 : 0;
        const finishedBots = aiSchedules.filter(schedule => elapsed >= schedule.finishTime);
        if (aiIndex >= 0 && aiIndex < finishedBots.length) {
          finishedPlayerIds.push(p.id);
        }
      }
    });
  }

  return {
    gameplayState,
    progressState,
    handleGestureDetected,
    spellingLoadNextWord,

    players: battleState?.players || [],
    currentRound: battleState?.currentRound || 1,
    roundPhase: battleState?.roundPhase || ROUND_PHASES.PRE_ROUND,
    roundTimeRemaining: localTimeRemaining,
    timeProgress,
    currentWord: battleState?.currentWord,
    roundSummary: battleState?.roundSummary || [],
    winnerId: battleState?.winnerId,
    countdownValue: 3,
    isBattleStarted: battleState?.isStarted || false,
    isHumanFinished,
    finishedPlayerIds,
    isFinished: battleState?.isFinished || false,

    startBattle,
    nextRound,
    prepareRound,
    startSpellingPhase,
    forceEndBattle,

    ROUND_PHASES,
    ROUND_DURATION,
  };
}

export default useBattle;
export { ROUND_PHASES };
