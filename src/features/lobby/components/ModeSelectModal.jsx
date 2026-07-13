import React, { useState } from "react";
import { routes } from "../../../shared/constants/routes";
import { BookOpenIcon, FlagIcon, ClockIcon, BoltIcon, CheckIcon } from "@heroicons/react/24/solid";

const MODE_ICONS = {
  training: BookOpenIcon,
  race: FlagIcon,
  survival: ClockIcon,
  battle: BoltIcon,
};

export const MODES = [
  {
    id: "training",
    title: "Latihan",
    description: "Belajar dan berlatih bahasa isyarat tanpa batas waktu.",
    iconId: "training",
    color: "from-purple-600 to-cyan-600",
    minPlayers: 1,
    maxPlayers: 1,
  },
  {
    id: "race",
    title: "Race",
    description: "Selesaikan kata sebanyak-banyaknya dalam 60 detik!",
    iconId: "race",
    color: "from-red-600 to-orange-600",
    minPlayers: 2,
    maxPlayers: 4,
  },
  {
    id: "survival",
    title: "Survival",
    description: "Bertahan selama mungkin! Benar = Waktu bertambah.",
    iconId: "survival",
    color: "from-purple-600 to-cyan-600",
    minPlayers: 2,
    maxPlayers: 4,
  },
  {
    id: "battle",
    title: "Battle",
    description: "Eja kata dengan cepat untuk memberikan damage.",
    iconId: "battle",
    color: "from-red-700 to-rose-600",
    minPlayers: 2,
    maxPlayers: 4,
  },
];

function ModeSelectModal({ isOpen, onClose, selectedModes, onToggleMode, playerCount = 1, readonly = false }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-3 sm:p-8 animate-fade-in">
      <div className="bg-white border-brutal shadow-[4px_4px_0px_0px_#000] sm:shadow-brutal-lg w-full max-h-[95vh] max-w-4xl flex flex-col overflow-hidden sm:max-h-[85vh]">

        {/* Header */}
        <div className="flex justify-between items-center p-6 sm:px-8 sm:py-6 border-b-brutal bg-neo-yellow">
          <h2 className="text-2xl font-black text-neo-text tracking-wide uppercase">
            Atur Mode Permainan
          </h2>
          <button
            onClick={onClose}
            className="w-10 h-10 border-brutal bg-white hover:bg-neo-red hover:text-white flex items-center justify-center text-neo-text transition-colors shadow-[2px_2px_0px_0px_#000] active:translate-y-1 active:translate-x-1 active:shadow-none"
          >
            <span className="text-2xl font-black leading-none">&times;</span>
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1 p-6 sm:p-8 custom-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {MODES.map((mode) => {
              const isSupported = playerCount >= (mode.minPlayers || 1) && playerCount <= (mode.maxPlayers || 4);
              const isSelected = isSupported && selectedModes.includes(mode.id);
              const IconComponent = MODE_ICONS[mode.iconId];

              return (
                <div
                  key={mode.id}
                  onClick={() => !readonly && isSupported && onToggleMode(mode.id)}
                  className={`relative ${readonly ? '' : 'cursor-pointer'} p-5 flex items-center gap-5 transition-all duration-300 border-brutal shadow-brutal-sm ${!readonly && 'hover:-translate-y-1 hover:-translate-x-1 hover:shadow-brutal'} ${!isSupported
                    ? "opacity-60 grayscale cursor-not-allowed bg-gray-200"
                    : isSelected
                      ? "bg-neo-purple"
                      : "bg-white hover:bg-neo-bg"
                    }`}
                >
                  <div className={`w-16 h-16 border-brutal flex items-center justify-center bg-white shadow-[2px_2px_0px_0px_#000] ${isSelected ? '-rotate-3' : ''}`}>
                    {IconComponent && <IconComponent className="w-8 h-8 text-neo-text" />}
                  </div>

                  <div className="flex-1">
                    <h3 className="text-xl font-black uppercase mb-1 text-neo-text">
                      {mode.title} {mode.maxPlayers === 1 ? " (Solo)" : ""}
                    </h3>
                    <p className="text-sm text-neo-text font-bold border-2 border-dashed border-neo-border p-2 bg-white/50">
                      {mode.description}
                    </p>
                  </div>

                  <div className={`w-8 h-8 border-brutal flex items-center justify-center flex-shrink-0 transition-colors shadow-[2px_2px_0px_0px_#000] ${isSelected ? 'bg-neo-green' : 'bg-white'
                    }`}>
                    {isSelected && <CheckIcon className="w-5 h-5 text-neo-text" />}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 sm:px-8 sm:py-6 border-t-brutal bg-white flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-neo-text font-black uppercase tracking-wider text-center sm:text-left">
            <span className="bg-neo-yellow border-brutal px-2 text-xl">{selectedModes.length}</span> mode terpilih untuk diacak
          </p>
          <button
            onClick={onClose}
            className="w-full sm:w-auto py-3 px-8 font-black text-lg tracking-wide uppercase transition-all flex items-center justify-center bg-neo-green text-white border-brutal shadow-brutal hover:-translate-y-1 hover:-translate-x-1 active:translate-y-1 active:translate-x-1 active:shadow-none"
          >
            {readonly ? "Tutup" : "Simpan"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ModeSelectModal;
