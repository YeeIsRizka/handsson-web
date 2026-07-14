import React from "react";
import { PHASE } from "../hooks/useReadyCheck";
import { CheckCircleIcon, XCircleIcon, HandRaisedIcon } from "@heroicons/react/24/solid";

function ReadyOverlay({ phase, countdown, playersList = [] }) {
  const isWaitingOrReady = phase === PHASE.WAITING || phase === PHASE.READY;

  const renderPlayerList = () => {
    if (!playersList || playersList.length === 0) return null;
    return (
      <div className="absolute top-4 right-4 bg-white border-brutal shadow-brutal p-3 z-30 max-w-[200px] flex flex-col gap-2">
        <div className="text-xs font-black uppercase tracking-wider border-b-2 border-black pb-1 mb-1 text-right">
          Status Pemain
        </div>
        {playersList.map((p) => (
          <div key={p.id} className="flex items-center gap-2 text-sm font-bold truncate">
            <span className="leading-none">
              {p.isReady
                ? <CheckCircleIcon className="w-5 h-5 text-neo-green" />
                : <XCircleIcon className="w-5 h-5 text-neo-red" />
              }
            </span>
            <span className={`truncate ${p.isMe ? 'text-neo-purple' : ''}`}>{p.name}</span>
          </div>
        ))}
      </div>
    );
  };
  if (phase === PHASE.WAITING) {
    return (
      <>
        <div className="absolute inset-0 bg-neo-bg/50 flex flex-col items-center justify-center z-20">
          <div className="bg-white border-brutal shadow-brutal flex flex-col items-center p-8 max-w-sm text-center">
            <div className="mb-4 bg-neo-yellow border-brutal p-4 inline-flex gap-2 -rotate-6">
              <HandRaisedIcon className="w-12 h-12 text-neo-text" />
              <HandRaisedIcon className="w-12 h-12 text-neo-text -scale-x-100" />
            </div>
            <div className="text-3xl font-black text-neo-red uppercase tracking-widest mb-2 border-b-[3px] border-neo-red pb-1">
              Not Ready
            </div>
            <p className="text-sm font-bold mt-2">
              Tunjukkan kedua tangan terbuka ke kamera, tahan selama 3 detik
            </p>
          </div>
        </div>
        {renderPlayerList()}
      </>
    );
  }

  if (phase === PHASE.READY) {
    return (
      <>
        <div className="absolute inset-0 bg-neo-green/50 flex flex-col items-center justify-center z-20">
          <div className="bg-white border-brutal shadow-brutal flex flex-col items-center p-8 text-center max-w-sm">
            <div className="mb-4 bg-white border-brutal p-4 inline-block rotate-3">
              <CheckCircleIcon className="w-14 h-14 text-neo-green" />
            </div>
            <div className="text-3xl font-black text-neo-green uppercase tracking-widest">
              Ready!
            </div>
            <p className="text-sm font-bold mt-2 text-neo-text">
              Menunggu pemain lain...
            </p>
          </div>
        </div>
        {renderPlayerList()}
      </>
    );
  }

  if (phase === PHASE.COUNTDOWN) {
    return (
      <>
        <div className="absolute inset-0 bg-neo-blue/90 flex items-center justify-center z-20">
          <div
            className="text-[12rem] font-black text-white drop-shadow-[8px_8px_0px_#000] animate-bounce"
            key={countdown}
          >
            {countdown}
          </div>
        </div>
        {renderPlayerList()}
      </>
    );
  }

  return null;
}

export default ReadyOverlay;
