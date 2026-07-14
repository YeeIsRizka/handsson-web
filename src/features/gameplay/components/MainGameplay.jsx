import React, { useState, useCallback, useEffect, useRef } from "react";
import HandGestureDetector from "../../gesture/components/HandGestureDetector";
import GestureStatusDisplay from "../../gesture/components/GestureStatusDisplay";
import SuccessOverlay from "./SuccessOverlay";
import { SparklesIcon } from "@heroicons/react/24/outline";
import HintPanel from "./HintPanel";
import WordDisplay from "./WordDisplay";

function MainGameplay({
  gameplayState,
  progressState,
  onGestureDetected,
  onHandsDetected,
  onCameraReady,
  isPaused = false,
  mobileFooterLeft = null,
  mobileFooterRight = null,
  desktopFooterLeft = null,
  desktopFooterRight = null,
  successSubMessage,
  timerBar = null,
  cameraOverlay = null,
  hideGameUI = false,
  disableSplitOverlay = false,
}) {
  const {
    letters = [],
    currentIndex = 0,
    currentHint = null,
    isLoading = false,
    currentWordData = null,
    animatingLetterIndex = null,
    isTransitioningWord = false,
  } = gameplayState;

  const {
    correctGesture,
    incorrectGesture,
    detectedGesture,
    gestureConfidence,
    isCorrectGesture,
    isIncorrectGesture,
    gestureDetectionProgress,
    showSuccessMessage,
    gameState,
    GAME_STATES,
  } = progressState;

  const hintLetter = currentHint?.letter || letters[currentIndex] || "?";

  const isCameraActive =
    !isPaused &&
    !showSuccessMessage &&
    !isTransitioningWord &&
    gameState !== GAME_STATES.TRANSITIONING;

  const [isCameraReady, setIsCameraReady] = useState(false);
  const [showLetterSuccess, setShowLetterSuccess] = useState(false);
  const [showSplitOverlay, setShowSplitOverlay] = useState(true);
  const prevIndexRef = useRef(currentIndex);
  const handTimerRef = useRef(null);

  const handleHandsDetectedWrapper = useCallback((handCount) => {
    if (handCount > 0) {
      setShowSplitOverlay(false);
      if (handTimerRef.current) {
        clearTimeout(handTimerRef.current);
        handTimerRef.current = null;
      }
    } else {
      if (!handTimerRef.current) {
        handTimerRef.current = setTimeout(() => {
          setShowSplitOverlay(true);
        }, 3000);
      }
    }
    onHandsDetected?.(handCount);
  }, [onHandsDetected]);

  useEffect(() => {
    if (currentIndex > prevIndexRef.current && currentIndex < letters.length) {
      setShowLetterSuccess(true);
      const timer = setTimeout(() => {
        setShowLetterSuccess(false);
      }, 400);

      prevIndexRef.current = currentIndex;
      return () => clearTimeout(timer);
    } else if (currentIndex === 0 || currentIndex === letters.length) {
      prevIndexRef.current = currentIndex;
    }
  }, [currentIndex, letters.length]);

  const handleCameraReady = useCallback(() => {
    setIsCameraReady(true);
    onCameraReady?.();
  }, [onCameraReady]);

  useEffect(() => {
    return () => {
      if (handTimerRef.current) clearTimeout(handTimerRef.current);
    };
  }, []);

  const word = currentWordData?.word || letters.join("");

  return (
    <>
      <main className="grid grid-cols-1 md:grid-cols-2 p-4 md:p-8 gap-4 md:gap-8 flex-1 overflow-hidden relative">

        <div
          className={`flex justify-center items-center bg-white h-full relative transition-colors duration-200 border-[3px] shadow-brutal md:shadow-brutal-lg
            ${isIncorrectGesture
              ? "border-neo-red"
              : isCorrectGesture
                ? "border-neo-green"
                : "border-neo-border"}
          `}
        >
          {isLoading ? (
            <div className="flex flex-col items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-300 mb-4" />
              <p>Memuat kamera...</p>
            </div>
          ) : (
            <>
              <HandGestureDetector
                onGestureDetected={onGestureDetected}
                onHandsDetected={handleHandsDetectedWrapper}
                onCameraReady={handleCameraReady}
                showDebugInfo={false}
                active={isCameraActive}
              />

              <GestureStatusDisplay
                detectedGesture={detectedGesture}
                gestureConfidence={gestureConfidence}
                isCorrectGesture={isCorrectGesture}
                isIncorrectGesture={isIncorrectGesture}
                gestureDetectionProgress={gestureDetectionProgress}
              />

              <SuccessOverlay
                show={showSuccessMessage}
                message="Berhasil!"
                subMessage={
                  successSubMessage ??
                  (currentWordData?.points
                    ? `+${currentWordData.points} Poin`
                    : undefined)
                }
              />

              {isTransitioningWord && (
                <div className="absolute inset-0 bg-black/30 flex flex-col items-center justify-center z-10">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-300 mb-4" />
                  <p>Memuat kata baru...</p>
                </div>
              )}

              {isCameraReady && showSplitOverlay && !disableSplitOverlay && !isTransitioningWord && !showSuccessMessage && (
                <div className="absolute inset-0 z-10 flex pointer-events-none transition-opacity duration-500">
                  <div className="w-1/2 h-full border-r-4 border-dashed border-white/50 flex flex-col items-center justify-end pb-12 md:pb-24 bg-black/10">
                    <div className="bg-white px-3 md:px-6 py-2 md:py-3 border-brutal shadow-brutal-sm font-black text-sm md:text-xl text-neo-text -rotate-3 text-center uppercase">
                      Tangan Kiri
                    </div>
                  </div>
                  <div className="w-1/2 h-full flex flex-col items-center justify-end pb-12 md:pb-24 bg-black/10">
                    <div className="bg-white px-3 md:px-6 py-2 md:py-3 border-brutal shadow-brutal-sm font-black text-sm md:text-xl text-neo-text rotate-3 text-center uppercase">
                      Tangan Kanan
                    </div>
                  </div>
                </div>
              )}

              {isCameraReady && cameraOverlay}

              {showLetterSuccess && !showSuccessMessage && (
                <div className="absolute inset-0 bg-green-500/40 flex items-center justify-center z-10 rounded-xl pointer-events-none">
                  <div className="text-8xl animate-bounce drop-shadow-2xl"><SparklesIcon className="w-20 h-20 text-white" /></div>
                </div>
              )}
            </>
          )}


          {!hideGameUI && !isTransitioningWord && (
            <div className="absolute top-4 right-4 flex justify-end items-start z-20 pointer-events-none">


              <div className="md:hidden w-40 max-w-[160px] pointer-events-auto">
                <div className="bg-white border-brutal shadow-brutal flex items-center justify-center p-2 relative overflow-hidden aspect-square">
                  {isLoading ? (
                    <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-neo-border" />
                  ) : currentHint?.image_url ? (
                    <img
                      src={currentHint.image_url}
                      alt={currentHint.description || "Petunjuk"}
                      className="w-full h-full object-contain filter drop-shadow-md"
                    />
                  ) : (
                    <div className="text-7xl font-black text-neo-text">
                      {hintLetter}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>


        {!hideGameUI && (
          <div className="hidden md:block">
            {isTransitioningWord ? (
              <div className="flex flex-col justify-center items-center rounded-xl h-full">
                <div className="flex flex-col items-center justify-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-300 mb-4" />
                  <p>Memuat petunjuk...</p>
                </div>
              </div>
            ) : (
              <HintPanel
                isLoading={isLoading}
                currentLetter={letters[currentIndex]}
                currentHint={currentHint}
              />
            )}
          </div>
        )}
      </main>

      {!hideGameUI && timerBar}

      <footer className="p-4 relative z-10">

        <div className="sm:hidden flex flex-col">
          <div className="bg-white border-brutal p-4 shadow-brutal-sm">
            {hideGameUI ? (
              <div className="flex justify-center items-center py-4">
                <p className="text-neo-text/50 text-sm font-bold">Menunggu persiapan...</p>
              </div>
            ) : (
              <>
                <div className="flex justify-center w-full mb-4 relative">
                  {isTransitioningWord && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-8 h-8 border-t-2 border-b-2 border-black rounded-full animate-spin" />
                    </div>
                  )}

                  <WordDisplay
                    letters={letters}
                    currentIndex={currentIndex}
                    animatingLetterIndex={animatingLetterIndex}
                    isTransitioning={isTransitioningWord}
                  />
                </div>

                <div className="flex items-center justify-between bg-white border-brutal p-2 mt-4 shadow-brutal-sm">
                  {mobileFooterLeft ?? <div className="w-12" />}

                  <div
                    className="w-12 h-12 border-brutal flex items-center justify-center bg-white shadow-[2px_2px_0px_0px_#000]"
                  >
                    <div className="text-xl md:text-2xl font-black text-neo-text">
                      {letters[currentIndex] || "?"}
                    </div>
                  </div>

                  {mobileFooterRight ?? <div className="w-12" />}
                </div>
              </>
            )}
          </div>
        </div>


        <div className="hidden sm:block bg-white border-brutal shadow-brutal p-5">
          {hideGameUI ? (
            <div className="flex justify-center items-center py-4">
              <p className="text-neo-text/50 text-sm">Menunggu persiapan...</p>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              {desktopFooterLeft ?? <div className="w-[170px]" />}

              <div className="relative">
                {isTransitioningWord && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-8 h-8 border-t-2 border-b-2 border-white rounded-full animate-spin" />
                  </div>
                )}

                <WordDisplay
                  letters={letters}
                  currentIndex={currentIndex}
                  animatingLetterIndex={animatingLetterIndex}
                  isTransitioning={isTransitioningWord}
                />
              </div>

              {desktopFooterRight ?? <div className="w-[170px]" />}
            </div>
          )}
        </div>
      </footer>
    </>
  );
}

export default MainGameplay;
