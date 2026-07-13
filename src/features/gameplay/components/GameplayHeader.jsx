import React, { useState, useEffect } from "react";
import useHostDisband from "../../../shared/hooks/useHostDisband";
import { useAudio } from "../../../shared/context/AudioContext";
import SettingsModal from "./SettingsModal";
import { Cog6ToothIcon } from "@heroicons/react/24/solid";

function GameplayHeader({ title, onEndMatch, endMatchText = "Akhiri Permainan" }) {
  const [showSettings, setShowSettings] = useState(false);
  const { disbandLobby, DisbandWarningModal, HostDisbandConfirmModal } = useHostDisband();
  const { playBgm, pauseBgm } = useAudio();

  useEffect(() => {
    playBgm();
    return () => {
      pauseBgm();
    };
  }, [playBgm, pauseBgm]);

  return (
    <>
      <header className="flex justify-between items-center px-4 py-3 bg-neo-yellow border-b-brutal relative z-10 shadow-brutal-sm">
        {/* Logo Kiri */}
        <div className="flex items-center gap-2 w-1/4">
          <img src="/assets/logo/logo.png" alt="Hands On!" className="w-8 h-8 object-contain" />
          <span className="font-black text-lg hidden sm:block text-neo-text uppercase tracking-widest">
            Hands On!
          </span>
        </div>

        {/* Title Tengah */}
        <div className="flex-1 text-center">
          <div className="text-xl font-black uppercase border-brutal inline-block px-4 py-1 bg-white shadow-brutal-sm">{title}</div>
        </div>

        {/* Gear Kanan */}
        <div className="flex justify-end w-1/4">
          <button
            onClick={() => setShowSettings(true)}
            className="bg-white border-brutal hover:bg-gray-200 active:active-brutal-sm p-1.5 transition-all shadow-brutal-sm"
            aria-label="Pengaturan"
          >
            <Cog6ToothIcon className="w-6 h-6 text-neo-text" />
          </button>
        </div>
      </header>

      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        onEndMatch={onEndMatch}
        endMatchText={endMatchText}
        onExitRoom={disbandLobby}
      />

      <DisbandWarningModal />
      <HostDisbandConfirmModal />
    </>
  );
}

export default GameplayHeader;
