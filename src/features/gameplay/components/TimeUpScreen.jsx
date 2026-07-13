import React from "react";
import { ClockIcon, CpuChipIcon } from "@heroicons/react/24/solid";

const MEDAL_STYLES = [
  "bg-yellow-400 text-neo-text", // 1st - gold
  "bg-gray-300 text-neo-text",   // 2nd - silver
  "bg-amber-600 text-white",     // 3rd - bronze
];

function TimeUpScreen({ title = "Waktu Habis!", subtitle, players, renderPlayerScore, onPlayAgain, onExit, amIHost }) {
  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 sm:p-8 animate-fade-in">
      <div className="bg-white border-brutal shadow-brutal-lg w-full max-w-xl flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b-brutal bg-neo-yellow">
          <h2 className="text-2xl font-black text-neo-text tracking-wide uppercase">{title}</h2>
        </div>

        {/* Content */}
        <div className="p-6 sm:p-8 text-center text-neo-text font-bold overflow-y-auto flex-1">
          <div className="flex justify-center mb-4">
            <ClockIcon className="w-12 h-12 text-neo-text" />
          </div>
          <p className="text-lg font-black uppercase mb-6 bg-white border-brutal px-2 py-1 inline-block shadow-[2px_2px_0px_0px_#000]">{subtitle}</p>

          <div className="text-left mt-4">
            <div className="text-xs uppercase tracking-widest font-black mb-3 text-neo-text">
              Peringkat Akhir
            </div>
            <div className="flex flex-col gap-3">
              {players.map((player, index) => {
                const medalStyle = index < 3 ? MEDAL_STYLES[index] : null;
                return (
                  <div 
                    key={player.id} 
                    className="flex items-center justify-between p-3 border-brutal bg-white shadow-[2px_2px_0px_0px_#000]"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl font-black drop-shadow-md">
                        {medalStyle ? (
                          <span className={`w-7 h-7 inline-flex items-center justify-center border-brutal text-sm ${medalStyle}`}>
                            {index + 1}
                          </span>
                        ) : `#${index + 1}`}
                      </span>
                      <div 
                        className={`w-8 h-8 border-brutal flex items-center justify-center text-xs font-black text-white overflow-hidden flex-shrink-0 bg-cover bg-center`}
                        style={{ 
                          backgroundColor: player.color || (player.isHuman ? "#3b82f6" : "#9ca3af"),
                          backgroundImage: player.photo ? `url(${player.photo})` : undefined
                        }}
                      >
                        {!player.photo && <span className="drop-shadow-md">{player.isHuman ? (player.name.charAt(0).toUpperCase()) : <CpuChipIcon className="w-4 h-4" />}</span>}
                      </div>
                      <span className="font-black text-neo-text uppercase">{player.name}</span>
                    </div>
                    {renderPlayerScore(player)}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t-brutal bg-white flex flex-col sm:flex-row gap-3">
          <button
            onClick={onPlayAgain}
            className="flex-1 py-3 font-black text-lg tracking-wide uppercase transition-all flex items-center justify-center bg-neo-green text-white border-brutal shadow-brutal hover:-translate-y-1 hover:-translate-x-1 active:translate-y-1 active:translate-x-1 active:shadow-none"
          >
            {amIHost ? "Kembali ke Lobby" : "Menunggu Host..."}
          </button>
          <button
            onClick={onExit}
            className="flex-1 py-3 bg-white border-brutal shadow-brutal hover:bg-neo-red hover:text-white transition-colors font-black text-lg uppercase hover:-translate-y-1 hover:-translate-x-1 active:translate-y-1 active:translate-x-1 active:shadow-none"
          >
            Keluar Room
          </button>
        </div>
      </div>
    </div>
  );
}

export default TimeUpScreen;
