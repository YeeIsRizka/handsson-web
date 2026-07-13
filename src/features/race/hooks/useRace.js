import { useCallback, useEffect, useRef, useState } from "react";
import { useMultiplayerState, useIsHost, myPlayer } from "playroomkit";
import useSpelling from "../../gameplay/hooks/useSpelling";
import { getRandomLocalWord, resetWordCycle } from "../../gameplay/utils/localWords";
import { calculateRaceWordPoints } from "../utils/raceScoring";

const RACE_DURATION = 60;

function useRace() {
  const amIHost = useIsHost();
  
  const [timeRemaining, setTimeRemaining] = useMultiplayerState("raceTimeRemaining", RACE_DURATION);
  const [isFinished, setIsFinished] = useMultiplayerState("raceIsFinished", false);
  const [isStarted, setIsStarted] = useMultiplayerState("raceIsStarted", false);
  

  const [botScores, setBotScores] = useMultiplayerState("raceBotScores", {});
  const [bots] = useMultiplayerState("bots", []);

  const timerRef = useRef(null);
  const startTimeRef = useRef(null);
  const botTimersRef = useRef({});

  const isFinishedRef = useRef(isFinished);
  useEffect(() => { isFinishedRef.current = isFinished; }, [isFinished]);

  const botScoresRef = useRef(botScores);
  useEffect(() => { botScoresRef.current = botScores || {}; }, [botScores]);


  const [syncedWords, setSyncedWords] = useMultiplayerState("raceSyncedWords", []);
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
    if (isFinishedRef.current || !isStarted) return;
    
    const earnedPoints = calculateRaceWordPoints(wordData);
    const me = myPlayer();
    if (me) {
      const currentScore = me.getState("raceScore") || 0;
      me.setState("raceScore", currentScore + earnedPoints, true);
    }
  }, [isStarted]);

  const {
    gameplayState,
    progressState,
    handleGestureDetected,
    loadNextWord,
  } = useSpelling({
    getNextWord: getNextWord,
    onWordCompleted: handleWordCompleted,
  });


  const scheduleBotWord = useCallback((botId) => {
    if (!amIHost) return;

    const nextWordTime = 12000 + Math.random() * 8000;
    
    botTimersRef.current[botId] = setTimeout(() => {
      if (isFinishedRef.current) return;

      const earnedPoints = Math.floor(15 + Math.random() * 15);
      

      botScoresRef.current = {
        ...botScoresRef.current,
        [botId]: (botScoresRef.current[botId] || 0) + earnedPoints
      };
      
      setBotScores(botScoresRef.current);
      
      scheduleBotWord(botId);
    }, nextWordTime);
  }, [amIHost, setBotScores]);

  const startRace = useCallback(() => {
    if (!amIHost || isStarted) return;
    
    setIsStarted(true);
    setIsFinished(false);
    startTimeRef.current = Date.now();


    if (timerRef.current) clearInterval(timerRef.current);
    Object.values(botTimersRef.current).forEach(clearTimeout);


    const currentBots = bots || [];
    currentBots.forEach(b => {
      if (!botTimersRef.current[b.id]) {
        scheduleBotWord(b.id);
      }
    });

    timerRef.current = setInterval(() => {
      const elapsed = (Date.now() - startTimeRef.current) / 1000;
      const remaining = Math.max(Math.floor(RACE_DURATION - elapsed), 0);

      setTimeRemaining(remaining);

      if (remaining <= 0) {
        clearInterval(timerRef.current);
        timerRef.current = null;
        
        Object.values(botTimersRef.current).forEach(clearTimeout);
        botTimersRef.current = {};

        setTimeRemaining(0);
        setIsFinished(true);
      }
    }, 1000);
  }, [amIHost, isStarted, bots, scheduleBotWord, setTimeRemaining, setIsStarted, setIsFinished]);


  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      Object.values(botTimersRef.current).forEach(clearTimeout);
    };
  }, []);

  const timeProgress = timeRemaining / RACE_DURATION;
  
  const humanScore = myPlayer()?.getState("raceScore") || 0;

  const resetRace = useCallback(() => {
    if (!amIHost) return;
    setIsFinished(false);
    setIsStarted(false);
    setTimeRemaining(RACE_DURATION);
    setSyncedWords([]);
    setBotScores({});
  }, [amIHost, setIsFinished, setIsStarted, setTimeRemaining, setSyncedWords, setBotScores]);

  const forceEndRace = useCallback(() => {
    if (!amIHost) return;
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    Object.values(botTimersRef.current).forEach(clearTimeout);
    botTimersRef.current = {};

    setTimeRemaining(0);
    setIsFinished(true);
  }, [amIHost, setTimeRemaining, setIsFinished]);

  return {
    gameplayState,
    progressState,
    timeProgress,
    humanScore,
    handleGestureDetected,
    loadNextWord,
    startRace,
    resetRace,
    forceEndRace,
    raceDuration: RACE_DURATION,
    isFinished,
    isStarted,
    botScores: botScores || {},
    timeRemaining
  };
}

export default useRace;