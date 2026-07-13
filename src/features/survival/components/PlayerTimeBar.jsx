import React, { useState, useEffect } from "react";
import { NoSymbolIcon, CpuChipIcon } from "@heroicons/react/24/solid";

function PlayerTimeBar({ player, maxTime = 60 }) {
  const [bonusAnimations, setBonusAnimations] = useState([]);

  useEffect(() => {
    if (player.lastAddedTime && player.lastAddedAt) {
      const newAnim = {
        id: player.lastAddedAt,
        time: player.lastAddedTime
      };
      setBonusAnimations(prev => [...prev, newAnim]);
      
      const timer = setTimeout(() => {
        setBonusAnimations(prev => prev.filter(a => a.id !== newAnim.id));
      }, 1500);
      
      return () => clearTimeout(timer);
    }
  }, [player.lastAddedTime, player.lastAddedAt]);

  const timeRemaining = Math.max(player.timeRemaining || 0, 0);
  const timePercent = Math.min((timeRemaining / maxTime) * 100, 100);
  const isDead = player.isEliminated || timeRemaining <= 0;

  const isHuman = player.isHuman;
  const initial = player.name ? player.name.charAt(0).toUpperCase() : "?";
  
  // Background colors
  const avatarBgClass = isDead ? "bg-gray-400" : (!player.color ? (isHuman ? "bg-neo-blue" : "bg-gray-400") : "");
  const avatarStyle = (!isDead && player.color) ? { backgroundColor: player.color } : {};

  return (
    <div className={`flex items-center gap-2 md:gap-3 w-full h-10 md:h-12 px-2 md:px-4 py-2 transition-all duration-500 border-r-brutal last:border-r-0 ${isDead ? 'opacity-60 grayscale' : ''}`}>
      {/* Avatar (The Bomb) */}
      <div className="relative flex-shrink-0">
        <div 
          className={`w-6 h-6 md:w-8 md:h-8 ${avatarBgClass} border-brutal flex items-center justify-center text-[10px] md:text-xs font-black text-white shadow-brutal-sm z-10 relative overflow-hidden`}
          title={player.name}
          style={avatarStyle}
        >
          {isDead ? <NoSymbolIcon className="w-4 h-4 text-white" /> : (player.photo ? (
            <img src={player.photo} alt={initial} className="w-full h-full object-cover" />
          ) : (
            <span className="drop-shadow-md">{isHuman ? initial : <CpuChipIcon className="w-4 h-4" />}</span>
          ))}
        </div>
      </div>
      
      {/* Fuse Track */}
      <div className="flex-1 relative h-4 md:h-6 bg-white border-brutal shadow-inner min-w-[30px] overflow-hidden">
        {/* The burning fuse line */}
        <div 
          className="absolute left-0 top-0 bottom-0 bg-neo-red border-r-brutal transition-all duration-1000 ease-linear"
          style={{ width: `${timePercent}%` }}
        />
      </div>
      
      {/* Time Display */}
      <div className="flex-shrink-0 text-left text-xs md:text-sm font-black text-neo-text w-8 md:w-10 relative">
        {Math.ceil(timeRemaining)}s

        {/* Floating Bonus Animations */}
        {bonusAnimations.map((anim) => (
          <div 
            key={anim.id} 
            className="absolute left-0 bottom-full mb-1 text-neo-green font-black text-sm md:text-base drop-shadow-md pointer-events-none z-20 animate-floatUpFade"
          >
            +{anim.time}
          </div>
        ))}
      </div>
    </div>
  );
}

export default PlayerTimeBar;
