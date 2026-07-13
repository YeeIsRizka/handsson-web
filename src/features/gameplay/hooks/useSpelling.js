import { useCallback, useEffect, useRef, useState } from "react";
import { GAME_STATES } from "../constants/gameStates";
import { useAudio } from "../../../shared/context/AudioContext";
import { useSettings } from "../../../shared/context/SettingsContext";

const initialGameplayState = {
  word: "",
  letters: [],
  currentIndex: 0,
  currentHint: null,
  isLoading: true,
  completedWordIds: [],
  currentWordData: null,
  isTransitioningWord: false,
  animatingLetterIndex: null,
};

const initialProgressState = {
  GAME_STATES,
  gameState: GAME_STATES.IDLE,
  detectedGesture: null,
  gestureConfidence: 0,
  gestureDetectionProgress: 0,
  isCorrectGesture: false,
  isIncorrectGesture: false,
  correctGesture: false,
  incorrectGesture: false,
  showSuccessMessage: false,
};

const clearIntervalRef = (ref) => {
  if (ref.current) {
    clearInterval(ref.current);
    ref.current = null;
  }
};

const clearTimeoutRef = (ref) => {
  if (ref.current) {
    clearTimeout(ref.current);
    ref.current = null;
  }
};

function useSpelling({
  getNextWord,
  getHint,
  onWordCompleted,
  gestureDetectionTime = 1000,
  gestureThreshold = 0.8,
  successDelay = 1000,
  initialDelay = 300,
  autoLoadNextWord = true,
}) {
  const [gameplayState, setGameplayState] = useState(initialGameplayState);
  const [progressState, setProgressState] = useState(initialProgressState);

  const { playCorrectSfx, playWordCompleteSfx } = useAudio();
  const { showHint } = useSettings();


  const callbacksRef = useRef({ getNextWord, getHint, onWordCompleted });
  useEffect(() => {
    callbacksRef.current = { getNextWord, getHint, onWordCompleted };
  }, [getNextWord, getHint, onWordCompleted]);

  const stateRef = useRef({ gameplayState, progressState });
  const gestureTimerRef = useRef(null);
  const gestureDetectionStartRef = useRef(null);
  const animationTimeoutRef = useRef(null);
  const successTimeoutRef = useRef(null);
  const incorrectGestureTimeoutRef = useRef(null);
  const startTimeoutRef = useRef(null);
  const completedRef = useRef(false);

  useEffect(() => {
    stateRef.current = { gameplayState, progressState };
  }, [gameplayState, progressState]);

  const updateGameplay = useCallback((updates) => {
    setGameplayState((prev) => ({ ...prev, ...updates }));
  }, []);

  const updateProgress = useCallback((updates) => {
    setProgressState((prev) => ({
      ...prev,
      ...updates,
      GAME_STATES: prev.GAME_STATES,
    }));
  }, []);

  const stopGestureTimer = useCallback(() => {
    clearIntervalRef(gestureTimerRef);
    gestureDetectionStartRef.current = null;
  }, []);

  const resetGestureDetection = useCallback(() => {
    stopGestureTimer();

    updateProgress({
      detectedGesture: null,
      gestureConfidence: 0,
      gestureDetectionProgress: 0,
      isCorrectGesture: false,
      isIncorrectGesture: false,
      correctGesture: false,
      incorrectGesture: false,
    });
  }, [stopGestureTimer, updateProgress]);

  const resolveHint = useCallback(
    (letter) => {
      if (!letter) {
        return;
      }

      const nextHint = callbacksRef.current.getHint
        ? callbacksRef.current.getHint(letter)
        : {
          letter,
          description: `Huruf ${letter}`,
          image_url: showHint ? `/assets/hints/${letter.toUpperCase()}.png` : null,
        };

      updateGameplay({ currentHint: nextHint });
    },
    [updateGameplay, showHint]
  );


  useEffect(() => {
    const currentLetter = stateRef.current.gameplayState.letters[stateRef.current.gameplayState.currentIndex];
    if (currentLetter) {
      resolveHint(currentLetter);
    }
  }, [showHint, resolveHint]);

  const loadNextWord = useCallback(() => {
    updateGameplay({ isTransitioningWord: true });
    updateProgress({ gameState: GAME_STATES.TRANSITIONING, showSuccessMessage: false });

    const currentWordId = stateRef.current.gameplayState.currentWordData?.id;
    let wordData = callbacksRef.current.getNextWord?.(currentWordId);

    if (!wordData || !wordData.word) {
      wordData = {
        id: "local-fallback",
        word: "KATA",
      };
    }

    const wordStr = wordData.word.toUpperCase();

    updateGameplay({
      currentWordData: wordData,
      word: wordStr,
      letters: wordStr.split(""),
      currentIndex: 0,
      animatingLetterIndex: null,
      isTransitioningWord: false,
      isLoading: false,
    });

    resolveHint(wordStr[0]);

    updateProgress({ gameState: GAME_STATES.DETECTING });
    completedRef.current = false;
  }, [resolveHint, updateGameplay, updateProgress]);

  const handleWordCompletion = useCallback(() => {
    const { currentWordData } = stateRef.current.gameplayState;

    if (!currentWordData || completedRef.current) {
      return;
    }

    completedRef.current = true;

    setGameplayState((prev) => ({
      ...prev,
      completedWordIds: prev.completedWordIds.includes(currentWordData.id)
        ? prev.completedWordIds
        : prev.completedWordIds.concat(currentWordData.id),
    }));

    callbacksRef.current.onWordCompleted?.(currentWordData);

    resetGestureDetection();
    updateProgress({ showSuccessMessage: true });

    clearTimeoutRef(successTimeoutRef);

    if (autoLoadNextWord) {
      successTimeoutRef.current = setTimeout(() => {
        updateProgress({ showSuccessMessage: false });
        loadNextWord();
      }, successDelay);
    }
  }, [
    autoLoadNextWord,
    loadNextWord,
    resetGestureDetection,
    successDelay,
    updateProgress,
  ]);

  const moveToNextLetter = useCallback(() => {
    const { currentIndex } = stateRef.current.gameplayState;

    updateGameplay({ animatingLetterIndex: currentIndex });

    clearTimeoutRef(animationTimeoutRef);

    animationTimeoutRef.current = setTimeout(() => {
      const {
        isTransitioningWord,
        letters,
        currentIndex: latestIndex,
      } = stateRef.current.gameplayState;

      if (isTransitioningWord) {
        return;
      }

      updateGameplay({ animatingLetterIndex: null });

      const nextIndex = latestIndex + 1;

      if (nextIndex < letters.length) {
        updateGameplay({ currentIndex: nextIndex });
        resolveHint(letters[nextIndex]);
        playCorrectSfx();

        updateProgress({ gameState: GAME_STATES.DETECTING });
        resetGestureDetection();
      } else {
        updateGameplay({ currentIndex: nextIndex });
        updateProgress({ gameState: GAME_STATES.COMPLETED });
        playWordCompleteSfx();
        handleWordCompletion();
      }
    }, 800);
  }, [
    handleWordCompletion,
    resetGestureDetection,
    resolveHint,
    updateGameplay,
    updateProgress,
  ]);

  const showIncorrectGestureFeedback = useCallback(() => {
    updateProgress({
      isIncorrectGesture: true,
      incorrectGesture: true,
      isCorrectGesture: false,
      correctGesture: false,
    });
    
    clearTimeoutRef(incorrectGestureTimeoutRef);

    incorrectGestureTimeoutRef.current = setTimeout(() => {
      updateProgress({
        isIncorrectGesture: false,
        incorrectGesture: false,
      });
    }, 300);
  }, [updateProgress]);

  const handleGestureDetected = useCallback(
    (gesture, confidenceValue) => {
      const {
        gameplayState: currentGameplay,
        progressState: currentProgress,
      } = stateRef.current;

      if (
        currentProgress.gameState === GAME_STATES.COMPLETED ||
        completedRef.current ||
        currentGameplay.animatingLetterIndex !== null ||
        currentGameplay.isTransitioningWord
      ) {
        return;
      }

      if (gesture === null) {
        stopGestureTimer();
        resetGestureDetection();
        return;
      }

      updateProgress({
        detectedGesture: gesture,
        gestureConfidence: confidenceValue,
      });

      if (currentProgress.gameState !== GAME_STATES.DETECTING) {
        return;
      }

      const currentLetter =
        currentGameplay.letters[currentGameplay.currentIndex];

      if (gesture === currentLetter) {
        updateProgress({
          isCorrectGesture: true,
          correctGesture: true,
          isIncorrectGesture: false,
          incorrectGesture: false,
        });

        if (!gestureDetectionStartRef.current) {
          stopGestureTimer();
          gestureDetectionStartRef.current = Date.now();

          updateProgress({ gestureDetectionProgress: 0 });

          gestureTimerRef.current = setInterval(() => {
            const elapsed = Date.now() - gestureDetectionStartRef.current;
            const progress = Math.min(elapsed / gestureDetectionTime, 1);

            updateProgress({ gestureDetectionProgress: progress });

            if (progress >= 1 && confidenceValue >= gestureThreshold) {
              clearIntervalRef(gestureTimerRef);
              gestureDetectionStartRef.current = null;

              moveToNextLetter();
            }
          }, 100);
        }
      } else {
        updateProgress({
          isCorrectGesture: false,
          correctGesture: false,
          isIncorrectGesture: true,
          incorrectGesture: true,
        });

        if (gestureTimerRef.current) {
          stopGestureTimer();
          updateProgress({ gestureDetectionProgress: 0 });
          showIncorrectGestureFeedback();
        }
      }
    },
    [
      gestureDetectionTime,
      gestureThreshold,
      moveToNextLetter,
      resetGestureDetection,
      showIncorrectGestureFeedback,
      stopGestureTimer,
      updateProgress,
    ]
  );

  const loadNextWordRef = useRef(loadNextWord);
  useEffect(() => {
    loadNextWordRef.current = loadNextWord;
  }, [loadNextWord]);

  useEffect(() => {
    startTimeoutRef.current = setTimeout(() => {
      if (loadNextWordRef.current) {
        loadNextWordRef.current();
      }
    }, initialDelay);

    return () => {
      clearIntervalRef(gestureTimerRef);
      clearTimeoutRef(animationTimeoutRef);
      clearTimeoutRef(successTimeoutRef);
      clearTimeoutRef(incorrectGestureTimeoutRef);
      clearTimeoutRef(startTimeoutRef);
    };
  }, [initialDelay]);

  return {
    gameplayState,
    progressState,
    handleGestureDetected,
    loadNextWord,
  };
}

export default useSpelling;