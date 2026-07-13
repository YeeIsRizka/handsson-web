import React from "react";
import { useIsHost } from "playroomkit";
import { BoltIcon, ShieldCheckIcon, HeartIcon, ClockIcon, NoSymbolIcon } from "@heroicons/react/24/solid";
import { ROUND_DURATION } from "../utils/battleScoring";

function RoundResultOverlay({ roundSummary, currentRound, onContinue }) {
  const amIHost = useIsHost();

  const getRoleIcon = (role) => {
    if (role === "attacker") return <BoltIcon className="w-6 h-6 text-neo-text" />;
    if (role === "defender") return <ShieldCheckIcon className="w-6 h-6 text-neo-blue" />;
    return <HeartIcon className="w-6 h-6 text-neo-red" />;
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 sm:p-8 animate-fade-in">
      <div className="bg-white border-brutal shadow-brutal-lg w-full max-w-xl flex flex-col overflow-hidden">

        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b-brutal bg-neo-yellow">
          <h2 className="text-2xl font-black text-neo-text tracking-wide uppercase">Hasil Round {currentRound}</h2>
        </div>

        {/* Content */}
        <div className="p-6 sm:p-8 text-center text-neo-text font-bold overflow-y-auto flex-1">
          <div className="flex justify-center mb-6">
            <BoltIcon className="w-12 h-12 text-neo-text" />
          </div>

          <div className="space-y-4 pr-2 text-left p-2">
            {roundSummary.map((result) => (
              <div
                key={result.playerId}
                className={`flex items-center justify-between p-3 border-brutal shadow-[2px_2px_0px_0px_#000] ${result.role === "attacker"
                  ? "bg-white"
                  : result.role === "defender"
                    ? "bg-white"
                    : "bg-gray-200"
                  }`}
              >
                <div className="flex items-center gap-3">
                  <span className="drop-shadow-md border-brutal bg-white w-10 h-10 flex items-center justify-center shadow-[2px_2px_0px_0px_#000]">
                    {getRoleIcon(result.role)}
                  </span>
                  <div>
                    <div className="text-sm font-black text-neo-text uppercase mb-0.5">{result.playerName}</div>
                    <div className="text-[10px] sm:text-xs font-black uppercase tracking-wide">
                      {result.role === "attacker" && (
                        <span className="text-neo-text bg-neo-yellow border-brutal px-1 py-0.5 shadow-[1px_1px_0px_0px_#000] inline-flex items-center gap-1">
                          <ClockIcon className="w-3 h-3 inline" /> {Math.floor(Math.max(ROUND_DURATION - (result.finishTime || 0), 0))}s | ATT: {result.damageDealt}
                        </span>
                      )}
                      {result.role === "defender" && (
                        <span className="text-white bg-neo-blue border-brutal px-1 py-0.5 shadow-[1px_1px_0px_0px_#000] inline-flex items-center gap-1">
                          <ClockIcon className="w-3 h-3 inline" /> {Math.floor(Math.max(ROUND_DURATION - (result.finishTime || 0), 0))}s | DEF: {result.defend} | DMG: -{result.damage}
                        </span>
                      )}
                      {result.role === "failed" && (
                        <span className="text-white bg-neo-red border-brutal px-1 py-0.5 shadow-[1px_1px_0px_0px_#000]">
                          Gagal | DMG: -{result.damage}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="text-right border-l-brutal pl-3 py-1">
                  <div className="text-[10px] uppercase tracking-widest text-neo-text font-black mb-0.5">HP</div>
                  <div
                    className={`text-base font-black inline-flex items-center gap-1 ${result.hpAfter <= 0
                      ? "text-neo-red"
                      : result.damage > 0
                        ? "text-neo-red"
                        : "text-neo-green"
                      }`}
                  >
                    {result.hpBefore} → {Math.max(result.hpAfter, 0)}
                    {result.hpAfter <= 0 && <NoSymbolIcon className="w-4 h-4 inline text-neo-red" />}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Info Box */}
        <div className="mx-6 mb-6 bg-white border-brutal shadow-[2px_2px_0px_0px_#000] p-3 text-xs text-neo-text font-medium leading-relaxed text-left">
          <strong>Info Skor:</strong><br />
          • Nilai <strong className="text-neo-yellow drop-shadow-[1px_1px_0px_#000]">ATT</strong> / <strong className="text-neo-blue">DEF</strong> = <strong>(Jumlah Huruf × 5) + (Sisa Waktu × 5)</strong><br />
          • <strong className="text-neo-yellow drop-shadow-[1px_1px_0px_#000]">Attacker</strong> (Tercepat) memberikan <strong className="text-neo-yellow drop-shadow-[1px_1px_0px_#000]">ATT</strong> ke semua lawan.<br />
          • <strong className="text-neo-blue">Defender</strong> (Setelahnya) menahan <strong className="text-neo-yellow drop-shadow-[1px_1px_0px_#000]">ATT</strong> sebesar nilai <strong className="text-neo-blue">DEF</strong>.
        </div>

        {/* Footer */}
        <div className="p-6 border-t-brutal bg-white flex flex-col gap-3">
          {amIHost ? (
            <button
              onClick={onContinue}
              className="w-full py-3 font-black text-lg tracking-wide uppercase transition-all flex items-center justify-center bg-neo-green text-white border-brutal shadow-brutal hover:-translate-y-1 hover:-translate-x-1 active:translate-y-1 active:translate-x-1 active:shadow-none"
            >
              Round Selanjutnya →
            </button>
          ) : (
            <div className="w-full py-3 font-black text-lg tracking-wide uppercase flex items-center justify-center bg-gray-200 text-gray-500 border-brutal shadow-brutal opacity-70 cursor-not-allowed">
              Menunggu Host...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default RoundResultOverlay;
