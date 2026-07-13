import React from "react";
import { CpuChipIcon } from "@heroicons/react/24/solid";

function RaceTrack({ players, targetScore }) {
  return (
    <div className="relative w-full h-12 md:h-14 bg-white border-brutal shadow-brutal overflow-hidden">
      {/* Finish line pattern */}
      <div
        className="absolute right-0 top-0 bottom-0 w-12 border-l-brutal z-0 bg-white"
        style={{
          backgroundImage: 'linear-gradient(45deg, #000 25%, transparent 25%, transparent 75%, #000 75%, #000), linear-gradient(45deg, #000 25%, transparent 25%, transparent 75%, #000 75%, #000)',
          backgroundSize: '16px 16px',
          backgroundPosition: '0 0, 8px 8px',
        }}
      />

      {/* Players */}
      {players.map((player, index) => {
        const score = player.score || 0;
        const percentage = Math.min((score / targetScore) * 90, 90);

        const isHuman = player.isHuman;
        const initial = player.name ? player.name.charAt(0).toUpperCase() : "?";
        const avatarBg = player.color || (isHuman ? "#3b82f6" : "#9ca3af");

        const verticalOffset = (index % 3 - 1) * 6;
        const horizontalOffset = (index % 3) * 4;

        return (
          <div
            key={player.id}
            className="absolute transition-all duration-500 ease-out flex items-center justify-center hover:z-50"
            style={{
              left: `calc(${percentage}% + ${horizontalOffset}px)`,
              top: `calc(50% + ${verticalOffset}px)`,
              transform: 'translateY(-50%)',
              zIndex: (isHuman ? 20 : 10) + index
            }}
          >
            {/* Avatar Profile */}
            <div
              className="w-8 h-8 md:w-10 md:h-10 border-brutal flex items-center justify-center text-xs md:text-sm font-black shadow-brutal-sm overflow-hidden"
              style={{ backgroundColor: avatarBg }}
              title={`${player.name} - ${score}`}
            >
              {player.photo ? (
                <img src={player.photo} alt={initial} className="w-full h-full object-cover" />
              ) : (
                <span className={isHuman ? "text-white drop-shadow-md" : "text-neo-text drop-shadow-md"}>{isHuman ? initial : <CpuChipIcon className="w-4 h-4" />}</span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default RaceTrack;
