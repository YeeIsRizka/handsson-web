import { useCallback, useEffect, useRef, useState } from "react";
import { myPlayer, usePlayersList, useIsHost, useMultiplayerState } from "playroomkit";
import { useAudio } from "../../../shared/context/AudioContext";

const PHASE = {
  WAITING: "WAITING",
  READY: "READY",
  COUNTDOWN: "COUNTDOWN",
  STARTED: "STARTED",
};

function useReadyCheck({ onStart, countdownFrom = 3, readyDelay = 800, ignoredPlayerIds = [] } = {}) {
  const { playCountdownSfx, playGameStartSfx } = useAudio();
  const [phase, setPhase] = useState(PHASE.WAITING);
  const [countdown, setCountdown] = useState(countdownFrom);
  const phaseRef = useRef(PHASE.WAITING);
  const readyDelayTimeoutRef = useRef(null);
  const countdownRafRef = useRef(null);
  const onStartRef = useRef(onStart);
  const lastTickRef = useRef(null);
  

  const [localReady, setLocalReady] = useState(false);
  const localReadyRef = useRef(false);
  const lastSyncedReadyRef = useRef(false);


  const amIHost = useIsHost();


  const [countdownActive, setCountdownActive] = useMultiplayerState("readyCountdownActive", false);
  const localStartTimeRef = useRef(null);


  const players = usePlayersList(true);
  const activePlayers = players
    .filter(p => !ignoredPlayerIds.includes(p.id))
    .sort((a, b) => (a.getState("joinTime") || 0) - (b.getState("joinTime") || 0));
  

  const nameCounts = {};
  const playersList = activePlayers.map((p, index) => {
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
      color: p.getState("customColor") || p.getProfile().color?.hexString,
      isReady: p.getState("isReady") || false,
      isMe: p.id === myPlayer()?.id,
    };
  });

  const allHumansReady = activePlayers.length > 0 && activePlayers.every(p => p.getState("isReady") === true);

  useEffect(() => {
    onStartRef.current = onStart;
  }, [onStart]);

  useEffect(() => {
    // Reset readiness on mount
    const me = myPlayer();
    if (me) {
      me.setState("isReady", false, true);
    }
    
    return () => {

      if (me) {
        me.setState("isReady", false, true);
      }
    };
  }, []);

  const updatePhase = useCallback((newPhase) => {
    phaseRef.current = newPhase;
    setPhase(newPhase);
  }, []);


  const handleHandsDetected = useCallback((handCount) => {
    if (phaseRef.current === PHASE.STARTED) return;

    const isCurrentlyReady = handCount >= 2;
    if (isCurrentlyReady !== localReadyRef.current) {
      localReadyRef.current = isCurrentlyReady;
      setLocalReady(isCurrentlyReady);
    }

    if (isCurrentlyReady !== lastSyncedReadyRef.current) {
      lastSyncedReadyRef.current = isCurrentlyReady;
      const me = myPlayer();
      if (me) {
        me.setState("isReady", isCurrentlyReady, true);
      }
    }
  }, []);


  useEffect(() => {
    if (!amIHost) return;
    if (phaseRef.current === PHASE.STARTED) return;

    if (allHumansReady) {

      if (!readyDelayTimeoutRef.current && !countdownActive) {
        readyDelayTimeoutRef.current = setTimeout(() => {
          setCountdownActive(true);
          readyDelayTimeoutRef.current = null;
        }, readyDelay);
      }
    } else {

      if (readyDelayTimeoutRef.current) {
        clearTimeout(readyDelayTimeoutRef.current);
        readyDelayTimeoutRef.current = null;
      }
      if (countdownActive) {
        setCountdownActive(false);
      }
    }
  }, [allHumansReady, amIHost, readyDelay, countdownActive, setCountdownActive]);


  useEffect(() => {
    if (phaseRef.current === PHASE.STARTED) return;

    if (countdownActive) {
      if (!localStartTimeRef.current) {
        localStartTimeRef.current = Date.now();
      }


      updatePhase(PHASE.COUNTDOWN);

      const tick = () => {
        const elapsed = (Date.now() - localStartTimeRef.current) / 1000;
        const remaining = Math.ceil(countdownFrom - elapsed);

        if (remaining <= 0) {

          playGameStartSfx();


          setCountdown(0);
          updatePhase(PHASE.STARTED);
          onStartRef.current?.();


          if (amIHost) {
            setCountdownActive(false);
          }
          return;
        }


        if (lastTickRef.current !== remaining) {
          lastTickRef.current = remaining;
          playCountdownSfx();
        }

        setCountdown(remaining);
        countdownRafRef.current = requestAnimationFrame(tick);
      };

      countdownRafRef.current = requestAnimationFrame(tick);

      return () => {
        if (countdownRafRef.current) {
          cancelAnimationFrame(countdownRafRef.current);
          countdownRafRef.current = null;
        }
      };
    } else if (!countdownActive && phaseRef.current === PHASE.COUNTDOWN) {

      if (countdownRafRef.current) {
        cancelAnimationFrame(countdownRafRef.current);
        countdownRafRef.current = null;
      }
      setCountdown(countdownFrom);
      lastTickRef.current = null;
      localStartTimeRef.current = null;


      if (localReady) {
        updatePhase(PHASE.READY);
      } else {
        updatePhase(PHASE.WAITING);
      }
    }
  }, [countdownActive, countdownFrom, amIHost, localReady, updatePhase, setCountdownActive]);


  useEffect(() => {
    if (phaseRef.current === PHASE.STARTED || phaseRef.current === PHASE.COUNTDOWN) return;

    if (allHumansReady) {
      updatePhase(PHASE.READY);
    } else if (localReady) {
      updatePhase(PHASE.READY);
    } else {
      updatePhase(PHASE.WAITING);
    }
  }, [allHumansReady, localReady, updatePhase]);




  useEffect(() => {
    return () => {
      if (countdownRafRef.current) cancelAnimationFrame(countdownRafRef.current);
      if (readyDelayTimeoutRef.current) clearTimeout(readyDelayTimeoutRef.current);
    };
  }, []);

  const reset = useCallback(() => {
    if (countdownRafRef.current) cancelAnimationFrame(countdownRafRef.current);
    if (readyDelayTimeoutRef.current) clearTimeout(readyDelayTimeoutRef.current);
    countdownRafRef.current = null;
    readyDelayTimeoutRef.current = null;
    lastTickRef.current = null;
    localStartTimeRef.current = null;
    

    localReadyRef.current = false;
    setLocalReady(false);
    lastSyncedReadyRef.current = false;
    const me = myPlayer();
    if (me) me.setState("isReady", false, true);


    if (amIHost) {
      setCountdownActive(false);
    }

    updatePhase(PHASE.WAITING);
    setCountdown(countdownFrom);
  }, [countdownFrom, updatePhase, amIHost, setCountdownActive]);

  const isPreGame =
    phase === PHASE.WAITING ||
    phase === PHASE.READY ||
    phase === PHASE.COUNTDOWN;

  const isStarted = phase === PHASE.STARTED;

  return {
    phase,
    countdown,
    isPreGame,
    isStarted,
    handleHandsDetected,
    reset,
    playersList,
    allHumansReady,
    localReady,
    PHASE,
  };
}

export default useReadyCheck;
export { PHASE };
