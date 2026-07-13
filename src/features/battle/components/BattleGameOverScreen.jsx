import React from "react";
import { useIsHost } from "playroomkit";
import { TrophyIcon, CpuChipIcon, NoSymbolIcon } from "@heroicons/react/24/solid";

const MEDAL_STYLES = [
  "bg-yellow-400 text-neo-text",
  "bg-gray-300 text-neo-text",
  "bg-amber-600 text-white",
];

function BattleGameOverScreen({ players, winnerId, onPlayAgain, onExit }) {
  const amIHost = useIsHost();
  const winner = players.find((p) => p.id === winnerId);
  const sortedPlayers = [...players].sort((a, b) => b.hp - a.hp);
  const displayPlayers = winner ? sortedPlayers.filter(p => p.id !== winnerId) : sortedPlayers;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 sm:p-8 animate-fade-in">
      <div className="bg-white border-brutal shadow-brutal-lg w-full max-w-xl flex flex-col overflow-hidden max-h-[90vh]">
        

        <div className="flex justify-between items-center p-6 border-b-brutal bg-neo-yellow">
          <h2 className="text-2xl font-black text-neo-text tracking-wide uppercase">Battle Selesai!</h2>
        </div>


        <div className="p-6 sm:p-8 text-center text-neo-text font-bold overflow-y-auto flex-1">
          <div className="flex justify-center mb-4">
            <TrophyIcon className="w-14 h-14 text-neo-yellow drop-shadow-[2px_2px_0px_#000]" />
          </div>

          {winner ? (
            <div className="mb-6">
              <p className="text-neo-text mb-3 text-sm tracking-widest uppercase font-black bg-white border-brutal px-2 py-1 inline-block">Pemenang</p>
              <br/>
              <div className="bg-neo-green border-brutal p-4 inline-block shadow-[4px_4px_0px_0px_#000] -rotate-2">
                <div 
                  className="w-12 h-12 border-brutal flex items-center justify-center text-2xl mb-2 mx-auto shadow-[2px_2px_0px_0px_#000] overflow-hidden bg-cover bg-center"
                  style={{ 
                    backgroundColor: winner.color || (winner.isHuman ? "#3b82f6" : "#9ca3af"),
                    backgroundImage: winner.photo ? `url(${winner.photo})` : undefined
                  }}
                >
                  {!winner.photo && <span className="drop-shadow-md font-black text-white">{winner.isHuman ? (winner.name.charAt(0).toUpperCase()) : <CpuChipIcon className="w-6 h-6" />}</span>}
                </div>
                <div className="text-3xl font-black text-white drop-shadow-[2px_2px_0px_#000] uppercase tracking-wider">{winner.name}</div>
                <div className="text-sm text-neo-text font-black mt-1 bg-white border-brutal px-2 py-1">{winner.hp} HP tersisa</div>
              </div>
            </div>
          ) : (
            <div className="mb-6 py-6 bg-gray-200 border-brutal">
              <p className="text-neo-text font-black uppercase tracking-wider">Tidak ada pemenang!</p>
            </div>
          )}

          <div className="space-y-3 mt-4">
              {displayPlayers.map((player) => {
                const rank = sortedPlayers.findIndex(p => p.id === player.id) + 1;
                const medalStyle = rank <= 3 ? MEDAL_STYLES[rank - 1] : null;
                const medal = medalStyle ? (
                  <span className={`w-6 h-6 inline-flex items-center justify-center border-brutal text-xs ${medalStyle}`}>
                    {rank}
                  </span>
                ) : `#${rank}`;
                return (
                  <div
                    key={player.id}
                    className="flex items-center justify-between p-3 border-brutal bg-white shadow-[2px_2px_0px_0px_#000] text-sm"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg w-6 text-left drop-shadow-md">
                        {medal}
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
                    <span
                      className={`font-black text-right border-brutal px-2 py-1 text-xs inline-flex items-center gap-1 ${
                        player.isEliminated ? "bg-neo-red text-white" : "bg-neo-green text-white"
                      }`}
                    >
                      {player.isEliminated ? <><NoSymbolIcon className="w-3 h-3 inline" /> ELIMINATED</> : `${player.hp} HP`}
                    </span>
                  </div>
                );
              })}
          </div>
        </div>


        <div className="p-6 border-t-brutal bg-white flex flex-col sm:flex-row gap-3">
          {amIHost ? (
            <button
              onClick={onPlayAgain}
              className="flex-1 py-3 font-black text-lg tracking-wide uppercase transition-all flex items-center justify-center bg-neo-green text-white border-brutal shadow-brutal hover:-translate-y-1 hover:-translate-x-1 active:translate-y-1 active:translate-x-1 active:shadow-none"
            >
              Kembali ke Lobby
            </button>
          ) : (
            <div className="flex-1 py-3 font-black text-lg tracking-wide uppercase flex items-center justify-center bg-gray-200 text-gray-500 border-brutal shadow-brutal opacity-70 cursor-not-allowed">
              Menunggu Host...
            </div>
          )}
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

export default BattleGameOverScreen;
