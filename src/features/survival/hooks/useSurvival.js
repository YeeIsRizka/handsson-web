import { useCallback, useEffect, useRef, useState } from "react";
import { useMultiplayerState, useIsHost, myPlayer, usePlayersList } from "playroomkit";
import useSpelling from "../../gameplay/hooks/useSpelling";
import { getRandomLocalWord, resetWordCycle } from "../../gameplay/utils/localWords";

const INITIAL_DURATION = 60;
const EXTRA_TIME_PER_LETTER = 3;

function useSurvival() {
  const amIHost = useIsHost();
  const humanPlayersState = usePlayersList(true);
  const [bots] = useMultiplayerState("bots", []);

  const [survivalState, setSurvivalState] = useMultiplayerState("survivalState", {
    isFinished: false,
    isStarted: false,
    players: [],
  });

  const timerRef = useRef(null);
  const lastTickTimeRef = useRef(null);
  const botTimersRef = useRef({});

  const survivalStateRef = useRef(survivalState);
  useEffect(() => {
    survivalStateRef.current = survivalState;
  }, [survivalState]);


  const [syncedWords, setSyncedWords] = useMultiplayerState("survivalSyncedWords", []);
  const [wordIndex, setWordIndex] = useState(0);

  useEffect(() => {
    if (amIHost && (!syncedWords || syncedWords.length === 0)) {
      resetWordCycle();
      const generated = Array.from({ length: 50 }, () => getRandomLocalWord());
      setSyncedWords(generated);
    }
  }, [amIHost, syncedWords, setSyncedWords]);

  const getNextWord = useCallback(() => {
    if (syncedWords && syncedWords.length > 0) {
      const nextWord = syncedWords[wordIndex % syncedWords.length];
      setWordIndex((prev) => prev + 1);
      return nextWord;
    }
    return getRandomLocalWord();
  }, [syncedWords, wordIndex]);


  const handleWordCompleted = useCallback((wordData) => {
    if (!survivalStateRef.current?.isStarted || survivalStateRef.current?.isFinished) return;

    const wordLength = wordData?.word?.length || 0;
    const earnedTime = wordLength * EXTRA_TIME_PER_LETTER;

    const me = myPlayer();
    if (me) {
      const currentWords = me.getState("survivalTotalWordsCompleted") || 0;
      const currentEarnedTime = me.getState("survivalTotalEarnedTime") || 0;

      me.setState("survivalTotalWordsCompleted", currentWords + 1, true);
      me.setState("survivalTotalEarnedTime", currentEarnedTime + earnedTime, true);
    }
  }, []);

  const {
    gameplayState,
    progressState,
    handleGestureDetected,
    loadNextWord,
  } = useSpelling({
    getNextWord: getNextWord,
    onWordCompleted: handleWordCompleted,
  });


  const prevWordsCompletedRef = useRef({});
  useEffect(() => {
    if (!amIHost || !survivalStateRef.current?.isStarted || survivalStateRef.current?.isFinished) return;

    let stateChanged = false;
    let nextPlayers = [...survivalStateRef.current.players];

    humanPlayersState.forEach((hp) => {
      const currentEarnedTime = hp.getState("survivalTotalEarnedTime") || 0;
      const currentWords = hp.getState("survivalTotalWordsCompleted") || 0;
      
      const prevEarnedTime = prevWordsCompletedRef.current[hp.id]?.earnedTime || 0;

      if (currentEarnedTime > prevEarnedTime) {
        const timeDiff = currentEarnedTime - prevEarnedTime;
        prevWordsCompletedRef.current[hp.id] = { earnedTime: currentEarnedTime, words: currentWords };

        const pIndex = nextPlayers.findIndex(p => p.id === hp.id);
        if (pIndex !== -1 && !nextPlayers[pIndex].isEliminated) {
          nextPlayers[pIndex] = {
            ...nextPlayers[pIndex],
            timeRemaining: nextPlayers[pIndex].timeRemaining + timeDiff,
            wordsCompleted: currentWords,
            timeMultiplier: 1.0 + Math.floor(currentWords / 5) * 0.2,
            lastAddedTime: timeDiff,
            lastAddedAt: Date.now()
          };
          stateChanged = true;
        }
      }
    });

    if (stateChanged) {
      setSurvivalState({ ...survivalStateRef.current, players: nextPlayers });
    }
  }, [amIHost, humanPlayersState, setSurvivalState]);


  const scheduleBotWord = useCallback((botId) => {
    if (!amIHost) return;

    const nextWordTime = 12000 + Math.random() * 8000;
    
    botTimersRef.current[botId] = setTimeout(() => {
      const prev = survivalStateRef.current;
      if (!prev || prev.isFinished || !prev.isStarted) return;

      const newPlayers = prev.players.map(p => {
        if (p.id !== botId || p.isEliminated) return p;

        const earnedTime = Math.floor(3 + Math.random() * 4) * EXTRA_TIME_PER_LETTER;
        const newWordsCompleted = p.wordsCompleted + 1;
        const newMultiplier = 1.0 + Math.floor(newWordsCompleted / 5) * 0.2;

        return {
          ...p,
          timeRemaining: p.timeRemaining + earnedTime,
          wordsCompleted: newWordsCompleted,
          timeMultiplier: newMultiplier,
          lastAddedTime: earnedTime,
          lastAddedAt: Date.now()
        };
      });

      setSurvivalState({ ...prev, players: newPlayers });
      scheduleBotWord(botId);
    }, nextWordTime);
  }, [amIHost, setSurvivalState]);

  const startSurvival = useCallback(() => {
    if (!amIHost || survivalStateRef.current?.isStarted) return;


    const newPlayers = [];
    prevWordsCompletedRef.current = {};

    const nameCounts = {};

    const sortedHumans = [...humanPlayersState]
      .sort((a, b) => {
        const timeA = a.getState("joinTime") || 0;
        const timeB = b.getState("joinTime") || 0;
        return timeA - timeB;
      });

    sortedHumans.forEach((p, index) => {

      p.setState("survivalTotalWordsCompleted", 0, true);
      p.setState("survivalTotalEarnedTime", 0, true);

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
        isHuman: true,
        photo: p.getState("customPhoto") || p.getProfile().photo,
        color: p.getState("customColor") || p.getProfile().color?.hexString,
        timeRemaining: INITIAL_DURATION,
        survivedTime: 0,
        isEliminated: false,
        wordsCompleted: 0,
        timeMultiplier: 1.0
      });
    });

    bots.forEach((b) => {
      let finalName = b.name;
      if (nameCounts[b.name]) {
        nameCounts[b.name]++;
        finalName = `${b.name} ${nameCounts[b.name]}`;
      } else {
        nameCounts[b.name] = 1;
      }

      newPlayers.push({
        id: b.id,
        name: finalName,
        isHuman: false,
        photo: null,
        color: null,
        timeRemaining: INITIAL_DURATION,
        survivedTime: 0,
        isEliminated: false,
        wordsCompleted: 0,
        timeMultiplier: 1.0
      });
    });

    setSurvivalState({
      isFinished: false,
      isStarted: true,
      players: newPlayers
    });

    lastTickTimeRef.current = Date.now();


    newPlayers.forEach(p => {
      if (!p.isHuman && !botTimersRef.current[p.id]) {
        scheduleBotWord(p.id);
      }
    });

    timerRef.current = setInterval(() => {
      const now = Date.now();
      const deltaSeconds = (now - lastTickTimeRef.current) / 1000;
      lastTickTimeRef.current = now;

      const currentSurvival = survivalStateRef.current;
      if (!currentSurvival || currentSurvival.isFinished || !currentSurvival.players || currentSurvival.players.length === 0) return;

      let humanAlive = false;

      const nextPlayers = currentSurvival.players.map(p => {
        if (p.isEliminated) return p;

        const timeToDeduct = deltaSeconds * p.timeMultiplier;
        const remaining = Math.max(p.timeRemaining - timeToDeduct, 0);
        const newSurvivedTime = p.survivedTime + deltaSeconds;

        if (remaining <= 0) {
          if (!p.isHuman && botTimersRef.current[p.id]) {
            clearTimeout(botTimersRef.current[p.id]);
          }
          return { ...p, timeRemaining: 0, survivedTime: newSurvivedTime, isEliminated: true };
        }

        if (p.isHuman) humanAlive = true;

        return { ...p, timeRemaining: remaining, survivedTime: newSurvivedTime };
      });

      if (!humanAlive) {
        clearInterval(timerRef.current);
        timerRef.current = null;
        Object.values(botTimersRef.current).forEach(clearTimeout);
        botTimersRef.current = {};

        setSurvivalState({ ...currentSurvival, players: nextPlayers, isFinished: true });
        return;
      }

      setSurvivalState({ ...currentSurvival, players: nextPlayers });
    }, 1000);
  }, [amIHost, humanPlayersState, bots, setSurvivalState, scheduleBotWord]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      Object.values(botTimersRef.current).forEach(clearTimeout);
    };
  }, []);

  const resetSurvival = useCallback(() => {
    if (!amIHost) return;
    const prev = survivalStateRef.current;
    if (!prev) return;
    setSurvivalState({
      isFinished: false,
      isStarted: false,
      players: []
    });
    setSyncedWords([]);
  }, [amIHost, setSurvivalState, setSyncedWords]);

  const forceEndSurvival = useCallback(() => {
    if (!amIHost) return;
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    Object.values(botTimersRef.current).forEach(clearTimeout);
    botTimersRef.current = {};

    const prev = survivalStateRef.current;
    if (!prev) return;
    setSurvivalState({
      ...prev,
      isFinished: true,
      players: prev.players.map(p => ({ ...p, timeRemaining: 0, isEliminated: true })),
    });
  }, [amIHost, setSurvivalState]);

  const meId = myPlayer()?.id;
  const safePlayers = survivalState?.players || [];
  const humanPlayer = safePlayers.find(p => p.id === meId) || safePlayers.find(p => p.isHuman);
  const timeProgress = Math.min((humanPlayer?.timeRemaining || 0) / INITIAL_DURATION, 1.0);

  return {
    gameplayState,
    progressState,
    survivalState,
    timeProgress,
    humanPlayer,
    handleGestureDetected,
    loadNextWord,
    startSurvival,
    resetSurvival,
    forceEndSurvival,
    initialDuration: INITIAL_DURATION,
  };
}

export default useSurvival;
