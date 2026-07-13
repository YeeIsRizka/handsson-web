import React from "react";
import { StarIcon, UserIcon, CpuChipIcon } from "@heroicons/react/24/solid";

export default function PlayerCard({ 
  name, 
  isHuman, 
  onRemove, 
  showRemoveButton,
  removeTitle = "Hapus",
  color,
  photo,
  isHost,
  isMe
}) {
  return (
    <div className="relative flex flex-col items-center p-4 border-brutal shadow-brutal w-full sm:w-32 h-40 justify-center hover:-translate-y-1 hover:shadow-brutal-lg transition-all bg-gray-100">
      
      {/* Crown badge for host */}
      {isHost && (
        <div 
          className="absolute -top-3 -right-3 z-20 select-none bg-neo-yellow border-brutal w-8 h-8 flex items-center justify-center shadow-brutal-sm"
          title="Host"
        >
          <StarIcon className="w-5 h-5 text-neo-text" />
        </div>
      )}

      {/* Avatar */}
      <div className="relative mb-3">
        <div 
          className={`relative w-16 h-16 border-brutal flex items-center justify-center text-3xl overflow-hidden ${!isHuman && !color ? 'bg-gray-400' : ''}`}
          style={color ? { backgroundColor: color } : {}}
        >
          {photo ? (
            <img src={photo} alt={name} className="w-full h-full object-cover" />
          ) : (
            isHuman ? <UserIcon className="w-8 h-8 text-white drop-shadow-md" /> : <CpuChipIcon className="w-8 h-8 text-white drop-shadow-md" />
          )}
        </div>
      </div>

      <h3 className={`font-bold text-sm text-center truncate w-full ${isMe ? 'text-neo-purple' : ''}`}>{name}</h3>
      
      {showRemoveButton && (
        <button
          onClick={onRemove}
          className="absolute -top-3 -right-3 bg-neo-red hover:bg-red-500 text-white w-8 h-8 flex items-center justify-center border-brutal shadow-brutal-sm active:active-brutal-sm transition-all text-xl font-black z-10"
          title={removeTitle}
        >
          &times;
        </button>
      )}
    </div>
  );
}
