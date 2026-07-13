import React from "react";
import Modal from "../../../shared/components/ui/Modal";
import Button from "../../../shared/components/ui/Button";
import { useAudio } from "../../../shared/context/AudioContext";
import { useSettings } from "../../../shared/context/SettingsContext";
import { SpeakerWaveIcon, BellIcon, CheckIcon } from "@heroicons/react/24/solid";
import { SpeakerWaveIcon as SpeakerWaveOutline } from "@heroicons/react/24/outline";

function SettingsModal({ isOpen, onClose, onEndMatch, endMatchText = "Akhiri Permainan", onExitRoom }) {
  const { bgmVolume, setBgmVolume, sfxVolume, setSfxVolume, playCorrectSfx } = useAudio();
  const { showHint, setShowHint } = useSettings();

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Pengaturan"
      footer={
        <div className="flex flex-col gap-3 w-full">
          {onEndMatch && (
            <Button variant="primary" fullWidth onClick={() => {
              onEndMatch();
              onClose();
            }}>
              {endMatchText}
            </Button>
          )}
          <Button variant="danger" fullWidth onClick={() => {
            onExitRoom();
            onClose();
          }}>
            Keluar Room
          </Button>
        </div>
      }
    >
      <div className="p-4 sm:p-8 text-center text-neo-text font-bold">
        <div className="flex flex-col gap-6 text-left">
          <div className="bg-neo-bg border-brutal p-4 shadow-brutal-sm relative">
            <label className="flex items-center gap-3 cursor-pointer">
              <div className="relative flex items-center">
                <input
                  type="checkbox"
                  checked={showHint}
                  onChange={(e) => setShowHint(e.target.checked)}
                  className="w-6 h-6 border-brutal appearance-none bg-white checked:bg-neo-blue cursor-pointer"
                />
                {showHint && (
                  <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                    <CheckIcon className="w-4 h-4 text-white" />
                  </span>
                )}
              </div>
              <div>
                <div className="text-sm font-black uppercase tracking-wider">Tampilkan Petunjuk Visual (Gambar)</div>
              </div>
            </label>
          </div>

          <div className="bg-neo-bg border-brutal p-4 shadow-brutal-sm relative">
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-black uppercase tracking-wider flex items-center gap-1.5">
                <SpeakerWaveIcon className="w-4 h-4" /> Musik Latar (BGM)
              </label>
              <button
                onClick={() => setBgmVolume(0.5)}
                className="text-xs bg-neo-yellow border-brutal px-2 py-0.5 hover:bg-white active:translate-y-0.5 shadow-brutal-sm font-bold uppercase tracking-wider"
              >
                Reset Default
              </button>
            </div>
            <div className="flex items-center gap-3">
              <SpeakerWaveOutline className="w-5 h-5 flex-shrink-0" />
              <input
                type="range"
                min="0" max="1" step="0.05"
                value={bgmVolume}
                onChange={(e) => setBgmVolume(parseFloat(e.target.value))}
                className="w-full h-3 bg-white border-brutal accent-neo-blue cursor-pointer appearance-none"
                style={{
                  WebkitAppearance: "none",
                  background: `linear-gradient(to right, #3b82f6 ${bgmVolume * 100}%, white ${bgmVolume * 100}%)`
                }}
              />
              <SpeakerWaveIcon className="w-5 h-5 flex-shrink-0" />
            </div>
          </div>

          <div className="bg-neo-bg border-brutal p-4 shadow-brutal-sm relative">
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-black uppercase tracking-wider flex items-center gap-1.5">
                <BellIcon className="w-4 h-4" /> Efek Suara (SFX)
              </label>
              <button
                onClick={() => {
                  setSfxVolume(0.5);
                  setTimeout(() => playCorrectSfx(), 50);
                }}
                className="text-xs bg-neo-yellow border-brutal px-2 py-0.5 hover:bg-white active:translate-y-0.5 shadow-brutal-sm font-bold uppercase tracking-wider"
              >
                Reset Default
              </button>
            </div>
            <div className="flex items-center gap-3">
              <SpeakerWaveOutline className="w-5 h-5 flex-shrink-0" />
              <input
                type="range"
                min="0" max="1" step="0.05"
                value={sfxVolume}
                onChange={(e) => {
                  setSfxVolume(parseFloat(e.target.value));
                }}
                onMouseUp={() => {
                  // Play a test sound when releasing the slider
                  if (sfxVolume > 0) playCorrectSfx();
                }}
                onTouchEnd={() => {
                  if (sfxVolume > 0) playCorrectSfx();
                }}
                className="w-full h-3 bg-white border-brutal accent-neo-purple cursor-pointer appearance-none"
                style={{
                  WebkitAppearance: "none",
                  background: `linear-gradient(to right, #9D4EDD ${sfxVolume * 100}%, white ${sfxVolume * 100}%)`
                }}
              />
              <SpeakerWaveIcon className="w-5 h-5 flex-shrink-0" />
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}

export default SettingsModal;
