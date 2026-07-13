import React from "react";

function GestureStatusDisplay({
  detectedGesture,
  gestureConfidence,
  isCorrectGesture,
  isIncorrectGesture,
  gestureDetectionProgress,
}) {
  return (
    <div
      className={`absolute top-4 left-4 px-4 py-2 border-brutal shadow-brutal-sm transition-all duration-300 font-black uppercase tracking-wider
        ${
          detectedGesture
            ? isCorrectGesture
              ? "bg-neo-green text-white"
              : isIncorrectGesture
              ? "bg-neo-red text-white"
              : "bg-white text-neo-text"
            : "bg-gray-200 text-gray-500"
        }`}
    >
      {detectedGesture ? (
        <>
          <div className="flex items-center justify-between gap-4">
            <span>{`Terdeteksi: ${detectedGesture}`}</span>
            <span className="bg-neo-bg text-neo-text border-brutal px-2 text-sm shadow-[2px_2px_0px_0px_#000]">
              {`${Math.round(gestureConfidence * 100)}%`}
            </span>
          </div>
          {isCorrectGesture && (
            <div className="w-full bg-white border-brutal h-4 mt-3 shadow-inner relative overflow-hidden">
              <div
                className="absolute left-0 top-0 bottom-0 bg-neo-yellow border-r-brutal transition-all duration-100"
                style={{
                  width: `${gestureDetectionProgress * 100}%`,
                }}
              ></div>
            </div>
          )}
        </>
      ) : (
        "MENCARI GERAKAN..."
      )}
    </div>
  );
}

export default GestureStatusDisplay;
