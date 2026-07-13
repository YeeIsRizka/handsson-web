import React from "react";

function TimerBar({ timeProgress, timeText = null }) {
  const getBarColor = () => {
    if (timeProgress > 0.5) return "bg-neo-green";
    if (timeProgress > 0.25) return "bg-neo-yellow";
    return "bg-neo-red";
  };

  // Visually cap width to 100%
  const cappedProgress = Math.min(timeProgress, 1.0);

  return (
    <div className="px-4 md:px-8 py-4 flex flex-col items-center">
      <div className="relative w-full h-8 bg-white border-brutal shadow-brutal-sm overflow-hidden">
        <div
          className={`absolute inset-y-0 left-0 ${getBarColor()} border-r-brutal transition-all duration-100 ease-linear`}
          style={{ width: `${cappedProgress * 100}%` }}
        />
        <div
          className={`absolute inset-y-0 left-0 bg-white/30 animate-pulse`}
          style={{ width: `${cappedProgress * 100}%` }}
        />
      </div>
      {timeText && (
        <div className="text-center mt-2 font-black uppercase tracking-widest bg-white border-brutal px-4 py-1 -translate-y-2 shadow-brutal-sm">
          {timeText}
        </div>
      )}
    </div>
  );
}

export default TimerBar;
