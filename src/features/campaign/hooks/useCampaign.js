import { useCallback, useEffect, useRef, useState } from "react";
import useSpelling from "../../gameplay/hooks/useSpelling";
import { CAMPAIGN_LEVELS, TOTAL_LEVELS, POINTS_PER_LETTER } from "../utils/campaignConfig";
import { LOCAL_WORDS } from "../../gameplay/utils/localWords";

export const CAMPAIGN_PHASES = {
  IDLE: "IDLE",
  PRE_LEVEL: "PRE_LEVEL",
  PLAYING: "PLAYING",
  LEVEL_COMPLETE: "LEVEL_COMPLETE",
  LEVEL_FAILED: "LEVEL_FAILED",
  CAMPAIGN_COMPLETE: "CAMPAIGN_COMPLETE",
};


const shuffle = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

/**
 * Build the shuffled word list for a given level.
 * For levels 4 & 5, picks from LOCAL_WORDS based on usedIds.
 * @param {number} levelIndex  0-based index into CAMPAIGN_LEVELS
 * @param {Set<string>} usedLocalWordIds  IDs already used (Level 4 populates this, Level 5 reads it)
 * @returns {{ words: Array, usedIds: Set<string> }}
 */
const buildWordList = (levelIndex, usedLocalWordIds) => {
  const cfg = CAMPAIGN_LEVELS[levelIndex];
  const count = cfg.wordCount || 3;

  if (!cfg.useLocalWords) {
    return { words: shuffle(cfg.words).slice(0, count), usedIds: usedLocalWordIds };
  }

  const available = LOCAL_WORDS.filter((w) =>
    cfg.useLocalWordsRemainder ? !usedLocalWordIds.has(w.id) : true
  );

  const picked = shuffle(available).slice(0, count);

  const newUsedIds = new Set(usedLocalWordIds);
  picked.forEach((w) => newUsedIds.add(w.id));

  return { words: picked, usedIds: newUsedIds };
};

const initialCampaignState = {
  currentLevel: 1,
  phase: CAMPAIGN_PHASES.IDLE,
  levelResults: [],
  levelScore: 0,
  timeRemaining: 0,
  wordQueue: [],
  usedLocalWordIds: new Set(),
};

function useCampaign() {
  const [campaignState, setCampaignState] = useState(initialCampaignState);
  const campaignStateRef = useRef(campaignState);
  useEffect(() => {
    campaignStateRef.current = campaignState;
  }, [campaignState]);

  const timerIntervalRef = useRef(null);
  const levelStartTimeRef = useRef(null);

  const clearTimer = useCallback(() => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
  }, []);

  const wordQueueRef = useRef([]);

  const getNextWord = useCallback(() => {
    const queue = wordQueueRef.current;
    if (queue.length === 0) return null;
    return queue.shift();
  }, []);

  const handleWordCompleted = useCallback((wordData) => {
    const state = campaignStateRef.current;
    if (state.phase !== CAMPAIGN_PHASES.PLAYING) return;

    const wordLength = wordData?.word?.length || 0;
    const earned = wordLength * POINTS_PER_LETTER;
    const queueEmpty = wordQueueRef.current.length === 0;

    if (!queueEmpty) {
      setCampaignState((prev) => ({
        ...prev,
        levelScore: prev.levelScore + earned,
      }));
      return;
    }

    setTimeout(() => {
      const currentState = campaignStateRef.current;
      if (currentState.phase !== CAMPAIGN_PHASES.PLAYING) return;

      clearTimer();
      const elapsed = levelStartTimeRef.current
        ? Math.round((Date.now() - levelStartTimeRef.current) / 1000)
        : 0;

      const cfg = CAMPAIGN_LEVELS[currentState.currentLevel - 1];
      const timeUsed = Math.min(elapsed, cfg.timer);
      const finalScore = currentState.levelScore + earned;

      setCampaignState((prev) => {
        if (prev.phase !== CAMPAIGN_PHASES.PLAYING) return prev;
        const newResults = [
          ...prev.levelResults,
          { level: prev.currentLevel, score: finalScore, timeUsed },
        ];
        const isLastLevel = prev.currentLevel === TOTAL_LEVELS;
        return {
          ...prev,
          levelScore: finalScore,
          levelResults: newResults,
          phase: isLastLevel
            ? CAMPAIGN_PHASES.CAMPAIGN_COMPLETE
            : CAMPAIGN_PHASES.LEVEL_COMPLETE,
        };
      });
    }, 1200);
  }, [clearTimer]);

  const getHint = useCallback((letter) => {
    const cfg = CAMPAIGN_LEVELS[campaignStateRef.current.currentLevel - 1];
    return {
      letter,
      description: `Huruf ${letter}`,
      image_url: cfg.useHint ? `/assets/hints/${letter.toUpperCase()}.png` : null,
    };
  }, []);

  const {
    gameplayState,
    progressState,
    handleGestureDetected,
    loadNextWord,
  } = useSpelling({
    getNextWord,
    getHint,
    onWordCompleted: handleWordCompleted,
    autoLoadNextWord: true,
    successDelay: 1000,
  });

  const startLevel = useCallback(
    (levelNum) => {
      clearTimer();
      const levelIndex = levelNum - 1;
      const cfg = CAMPAIGN_LEVELS[levelIndex];

      const usedIds = campaignStateRef.current.usedLocalWordIds;
      const { words, usedIds: newUsedIds } = buildWordList(levelIndex, usedIds);

      wordQueueRef.current = words;
      levelStartTimeRef.current = Date.now();

      setCampaignState((prev) => ({
        ...prev,
        currentLevel: levelNum,
        phase: CAMPAIGN_PHASES.PLAYING,
        levelScore: 0,
        timeRemaining: cfg.timer,
        wordQueue: words,
        usedLocalWordIds: newUsedIds,
      }));

      loadNextWord();
    },
    [clearTimer, loadNextWord]
  );

  useEffect(() => {
    if (campaignState.phase !== CAMPAIGN_PHASES.PLAYING) {
      clearTimer();
      return;
    }

    const cfg = CAMPAIGN_LEVELS[campaignState.currentLevel - 1];

    timerIntervalRef.current = setInterval(() => {
      const elapsed = levelStartTimeRef.current
        ? (Date.now() - levelStartTimeRef.current) / 1000
        : 0;
      const remaining = Math.max(cfg.timer - elapsed, 0);

      setCampaignState((prev) => {
        if (prev.phase !== CAMPAIGN_PHASES.PLAYING) return prev;
        return { ...prev, timeRemaining: remaining };
      });

      if (elapsed >= cfg.timer) {
        clearTimer();
        setCampaignState((prev) => {
          if (prev.phase !== CAMPAIGN_PHASES.PLAYING) return prev;
          const newResults = [
            ...prev.levelResults,
            { level: prev.currentLevel, score: prev.levelScore, timeUsed: cfg.timer, failed: true },
          ];
          return {
            ...prev,
            timeRemaining: 0,
            levelResults: newResults,
            phase: CAMPAIGN_PHASES.LEVEL_FAILED,
          };
        });
      }
    }, 100);

    return clearTimer;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [campaignState.phase, campaignState.currentLevel]);

  useEffect(() => {
    return () => clearTimer();
  }, [clearTimer]);
  const nextLevel = useCallback(() => {
    const state = campaignStateRef.current;
    const nextLevelNum = state.currentLevel + 1;
    if (nextLevelNum > TOTAL_LEVELS) return;
    setCampaignState((prev) => ({
      ...prev,
      currentLevel: nextLevelNum,
      phase: CAMPAIGN_PHASES.IDLE,
      levelScore: 0,
      timeRemaining: 0,
    }));
  }, []);

  const restartCampaign = useCallback(() => {
    clearTimer();
    wordQueueRef.current = [];
    levelStartTimeRef.current = null;
    setCampaignState({
      ...initialCampaignState,
      usedLocalWordIds: new Set(),
    });
  }, [clearTimer]);

  const failCampaign = useCallback(() => {
    clearTimer();
    setCampaignState((prev) => {
      const cfg = CAMPAIGN_LEVELS[prev.currentLevel - 1] || CAMPAIGN_LEVELS[0];
      const timeUsed = Math.max(Math.ceil(cfg.timer - prev.timeRemaining), 0);
      const existingWithoutCurrent = prev.levelResults.filter((r) => r.level !== prev.currentLevel);
      const newResults = [
        ...existingWithoutCurrent,
        { level: prev.currentLevel, score: prev.levelScore, timeUsed, failed: true },
      ];
      return {
        ...prev,
        timeRemaining: 0,
        levelResults: newResults,
        phase: CAMPAIGN_PHASES.LEVEL_FAILED,
      };
    });
  }, [clearTimer]);

  const cfg = CAMPAIGN_LEVELS[campaignState.currentLevel - 1] || CAMPAIGN_LEVELS[0];
  const timeProgress = cfg.timer > 0 ? campaignState.timeRemaining / cfg.timer : 0;

  const totalScore = campaignState.levelResults.reduce((sum, r) => sum + r.score, 0);
  const totalTime = campaignState.levelResults.reduce((sum, r) => sum + r.timeUsed, 0);

  const currentLevelConfig = cfg;

  return {
    gameplayState,
    progressState,
    handleGestureDetected,

    currentLevel: campaignState.currentLevel,
    phase: campaignState.phase,
    levelResults: campaignState.levelResults,
    levelScore: campaignState.levelScore,
    timeRemaining: Math.ceil(campaignState.timeRemaining),
    timeProgress,
    totalScore,
    totalTime,
    currentLevelConfig,

    startLevel,
    nextLevel,
    restartCampaign,
    failCampaign,

    CAMPAIGN_PHASES,
    TOTAL_LEVELS,
  };
}

export default useCampaign;
