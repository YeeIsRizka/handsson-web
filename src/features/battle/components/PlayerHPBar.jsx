import React from "react";
import { NoSymbolIcon, CpuChipIcon, CheckCircleIcon, EllipsisHorizontalIcon } from "@heroicons/react/24/solid";

function PlayerHPBar({ player, isCompact = false, isSpellingPhase = false, isFinishedSpelling = false }) {
  const hpPercent = Math.max(player.hp, 0);

  const getBarColor = () => {
    if (hpPercent > 60) return "bg-neo-green";
    if (hpPercent > 30) return "bg-neo-yellow";
    return "bg-neo-red";
  };

  const initial = player.name ? player.name.charAt(0).toUpperCase() : "?";

  const avatarBgClass = player.isEliminated ? "bg-gray-400" : (!player.color ? (player.isHuman ? "bg-neo-blue" : "bg-gray-400") : "");
  const avatarStyle = (!player.isEliminated && player.color) ? { backgroundColor: player.color } : {};

  const renderAvatar = (size = "normal") => {
    const iconSize = size === "compact" ? "w-4 h-4" : "w-5 h-5";
    if (player.isEliminated) {
      return <NoSymbolIcon className={`${iconSize} text-white`} />;
    }
    if (player.photo) {
      return <img src={player.photo} alt={initial} className="w-full h-full object-cover" />;
    }
    return <span className="drop-shadow-md">{player.isHuman ? initial : <CpuChipIcon className={iconSize} />}</span>;
  };

  if (isCompact) {
    return (
      <div
        className={`flex items-center gap-2 py-1 ${player.isEliminated ? "opacity-60 grayscale" : ""
          }`}
      >
        <div
          className={`w-6 h-6 md:w-8 md:h-8 ${avatarBgClass} border-brutal flex items-center justify-center text-xs font-black text-white shadow-brutal-sm flex-shrink-0 overflow-hidden relative`}
          style={avatarStyle}
        >
          {renderAvatar("compact")}
          {isSpellingPhase && !player.isEliminated && (
            <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
              {isFinishedSpelling ? (
                <CheckCircleIcon className="w-5 h-5 text-neo-green drop-shadow-md" />
              ) : (
                <EllipsisHorizontalIcon className="w-5 h-5 text-white animate-pulse drop-shadow-md" />
              )}
            </div>
          )}
        </div>
        <span className="text-xs font-black uppercase text-neo-text truncate w-12">
          {player.name}
        </span>
        <div className="flex-1 h-3 bg-neo-bg border-brutal overflow-hidden min-w-[40px] relative">
          <div
            className={`absolute top-0 bottom-0 left-0 border-r-brutal transition-all duration-500 ${getBarColor()}`}
            style={{ width: `${hpPercent}%` }}
          />
        </div>
        <span className="text-xs font-black text-neo-text flex-shrink-0">
          {player.isEliminated ? <NoSymbolIcon className="w-4 h-4 text-neo-red inline" /> : player.hp}
        </span>
      </div>
    );
  }

  return (
    <div
      className={`flex items-center gap-3 py-2 ${player.isEliminated ? "opacity-60 grayscale" : ""
        }`}
    >
      <div
        className={`w-10 h-10 ${avatarBgClass} border-brutal flex items-center justify-center text-lg md:text-xl font-black text-white shadow-brutal flex-shrink-0 overflow-hidden relative`}
        style={avatarStyle}
      >
        {renderAvatar("normal")}
        {isSpellingPhase && !player.isEliminated && (
          <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
            {isFinishedSpelling ? (
              <CheckCircleIcon className="w-6 h-6 text-neo-green drop-shadow-md" />
            ) : (
              <EllipsisHorizontalIcon className="w-6 h-6 text-white animate-pulse drop-shadow-md" />
            )}
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm font-black uppercase text-neo-text truncate">{player.name}</span>
          <span className="text-sm font-black text-neo-text">
            {player.isEliminated ? "ELIMINATED" : `${player.hp} HP`}
          </span>
        </div>
        <div className="w-full h-4 bg-neo-bg border-brutal overflow-hidden relative shadow-brutal-sm">
          <div
            className={`absolute left-0 top-0 bottom-0 border-r-brutal transition-all duration-500 ${getBarColor()}`}
            style={{ width: `${hpPercent}%` }}
          />
        </div>
      </div>
    </div>
  );
}

export default PlayerHPBar;
