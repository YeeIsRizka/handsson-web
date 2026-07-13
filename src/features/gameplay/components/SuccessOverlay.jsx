import React from "react";
import { SparklesIcon } from "@heroicons/react/24/solid";

function SuccessOverlay({ show, message, subMessage }) {
  if (!show) return null;

  return (
    <div className="absolute inset-0 bg-neo-green/90 flex flex-col items-center justify-center z-20">
      <div className="bg-white border-brutal shadow-brutal flex flex-col items-center p-6 -rotate-2">
        <SparklesIcon className="w-14 h-14 text-neo-yellow mb-2" />
        {message && <div className="text-3xl font-black text-neo-text uppercase tracking-widest">{message}</div>}
        {subMessage && <div className="text-lg font-bold text-neo-blue uppercase mt-1">{subMessage}</div>}
      </div>
    </div>
  );
}

export default SuccessOverlay;
