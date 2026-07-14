import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';

const AudioContext = createContext();

export function AudioProvider({ children }) {

  const [bgmVolume, setBgmVolumeState] = useState(() => {
    const saved = localStorage.getItem('handson_bgm_volume');
    return saved !== null ? parseFloat(saved) : 0.5;
  });

  const [sfxVolume, setSfxVolumeState] = useState(() => {
    const saved = localStorage.getItem('handson_sfx_volume');
    return saved !== null ? parseFloat(saved) : 0.5;
  });

  const bgmAudioRef = useRef(null);
  const audioCtxRef = useRef(null);
  const isBgmIntendedToPlayRef = useRef(false);

  const sfxVolumeRef = useRef(sfxVolume);
  useEffect(() => { sfxVolumeRef.current = sfxVolume; }, [sfxVolume]);

  const bgmVolumeRef = useRef(bgmVolume);
  useEffect(() => { bgmVolumeRef.current = bgmVolume; }, [bgmVolume]);


  const initAudioCtx = useCallback(() => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
  }, []);


  useEffect(() => {
    const audio = new Audio('/sounds/bgm.mp3');
    audio.loop = true;

    audio.volume = bgmVolume * 0.3;
    bgmAudioRef.current = audio;

    return () => {
      audio.pause();
    };
  }, []);

  const playBgm = useCallback(() => {
    isBgmIntendedToPlayRef.current = true;
    if (bgmVolumeRef.current > 0 && bgmAudioRef.current) {
      bgmAudioRef.current.play().catch((e) => {
        console.warn("Autoplay ditolak oleh browser:", e);
      });
    }
  }, []);

  const pauseBgm = useCallback(() => {
    isBgmIntendedToPlayRef.current = false;
    if (bgmAudioRef.current) {
      bgmAudioRef.current.pause();
    }
  }, []);


  useEffect(() => {
    if (bgmAudioRef.current) {
      bgmAudioRef.current.volume = bgmVolume * 0.3;
      if (bgmVolume === 0) {
        bgmAudioRef.current.pause();
      } else if (bgmAudioRef.current.paused && isBgmIntendedToPlayRef.current) {
        bgmAudioRef.current.play().catch(() => { });
      }
    }
  }, [bgmVolume]);

  const setBgmVolume = (vol) => {
    setBgmVolumeState(vol);
    localStorage.setItem('handson_bgm_volume', vol.toString());
  };

  const setSfxVolume = (vol) => {
    setSfxVolumeState(vol);
    localStorage.setItem('handson_sfx_volume', vol.toString());
  };


  const playTone = useCallback((frequency, type, duration, volMultiplier = 1) => {
    const currentVol = sfxVolumeRef.current;
    if (currentVol === 0) return;
    initAudioCtx();
    const ctx = audioCtxRef.current;

    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);


    gainNode.gain.setValueAtTime(0, ctx.currentTime);

    const perceivedVolume = currentVol * 0.7;
    gainNode.gain.linearRampToValueAtTime(perceivedVolume * volMultiplier, ctx.currentTime + 0.05);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + duration);
  }, [initAudioCtx]);

  const playCorrectSfx = useCallback(() => {

    playTone(880, 'sine', 0.3, 1.0);
    setTimeout(() => playTone(1108.73, 'sine', 0.4, 0.8), 100);
  }, [playTone]);

  const playWordCompleteSfx = useCallback(() => {

    playTone(523.25, 'square', 0.2, 0.5);
    setTimeout(() => playTone(659.25, 'square', 0.2, 0.5), 100);
    setTimeout(() => playTone(783.99, 'square', 0.3, 0.5), 200);
    setTimeout(() => playTone(1046.50, 'square', 0.5, 0.5), 300);
  }, [playTone]);

  const playCountdownSfx = useCallback(() => {

    playTone(440, 'square', 0.1, 0.5);
  }, [playTone]);

  const playGameStartSfx = useCallback(() => {

    playTone(880, 'square', 0.4, 0.8);
  }, [playTone]);

  return (
    <AudioContext.Provider value={{
      bgmVolume,
      setBgmVolume,
      sfxVolume,
      setSfxVolume,
      playCorrectSfx,
      playWordCompleteSfx,
      playCountdownSfx,
      playGameStartSfx,
      playBgm,
      pauseBgm,
      initAudioCtx
    }}>
      {children}
    </AudioContext.Provider>
  );
}

export function useAudio() {
  return useContext(AudioContext);
}
