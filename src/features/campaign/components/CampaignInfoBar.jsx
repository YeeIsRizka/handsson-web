import React from "react";
import { TOTAL_LEVELS } from "../utils/campaignConfig";
import { TrophyIcon } from "@heroicons/react/24/solid";

function CampaignInfoBar({ currentLevel, levelScore }) {
  return (
    <div className="bg-white border-b-brutal px-3 py-2 flex items-center justify-between gap-3">
      {/* Level badge */}
      <div className="flex items-center gap-2">
        <div className="bg-neo-purple border-brutal px-3 py-1 shadow-brutal-sm -rotate-1">
          <span className="text-white font-black text-sm uppercase tracking-widest">
            Level {currentLevel}
          </span>
          <span className="text-white/60 font-black text-xs ml-1">
            / {TOTAL_LEVELS}
          </span>
        </div>

        {/* Level progress dots */}
        <div className="hidden sm:flex gap-1 items-center">
          {Array.from({ length: TOTAL_LEVELS }, (_, i) => (
            <div
              key={i}
              className={`w-3 h-3 border-brutal transition-colors ${
                i + 1 < currentLevel
                  ? "bg-neo-green"
                  : i + 1 === currentLevel
                  ? "bg-neo-yellow"
                  : "bg-white"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Score */}
      <div className="flex items-center gap-2">
        <TrophyIcon className="w-5 h-5 text-neo-yellow drop-shadow-[1px_1px_0px_#000]" />
        <div className="flex flex-col items-end">
          <span className="text-[9px] uppercase tracking-widest font-black text-neo-text">
            Skor Level
          </span>
          <span className="text-lg font-black text-neo-text leading-none">
            {levelScore}
          </span>
        </div>
      </div>
    </div>
  );
}

export default CampaignInfoBar;
