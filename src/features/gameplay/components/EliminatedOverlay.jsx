import React from "react";
import { NoSymbolIcon } from "@heroicons/react/24/solid";

function EliminatedOverlay({ title = "Waktu Habis", message = "Menunggu pemain lain...", icon = null }) {
  const defaultIcon = <NoSymbolIcon className="w-14 h-14 text-white" />;

  return (
    <div className="absolute inset-0 bg-neo-bg/50 flex flex-col items-center justify-center z-50 p-4">
      <div className="bg-white border-brutal shadow-brutal flex flex-col items-center p-8 max-w-sm text-center">
        <div className="text-6xl mb-4 bg-neo-red border-brutal p-4 inline-flex items-center justify-center -rotate-6">{icon || defaultIcon}</div>
        <div className="text-3xl font-black text-neo-red uppercase tracking-widest mb-2 border-b-[3px] border-neo-red pb-1">
          {title}
        </div>
        <p className="text-sm font-bold mt-2">
          {message}
        </p>
      </div>
    </div>
  );
}

export default EliminatedOverlay;
