import React, { useState, useEffect } from "react";
import Button from "../../../shared/components/ui/Button";
import { UserIcon, ArrowPathIcon } from "@heroicons/react/24/solid";

const NEO_COLORS = [
  "#FF3366", "#00C2FF", "#FFD000", "#00FF66", "#FF6B00",
  "#9D00FF", "#E5E5E5", "#FF00FF", "#2563EB", "#2DD4BF"
];

export default function ProfileSetupModal({ isOpen, onClose, onSave, isLoading }) {
  const [tempName, setTempName] = useState("");
  const [tempColor, setTempColor] = useState("");
  const [tempPhoto, setTempPhoto] = useState("");

  useEffect(() => {
    if (isOpen) {
      setTempName("Player");
      setTempColor(NEO_COLORS[Math.floor(Math.random() * NEO_COLORS.length)]);
      const initialSeed = Math.random().toString(36).substring(7);
      setTempPhoto(`https://api.dicebear.com/9.x/fun-emoji/svg?seed=${initialSeed}&backgroundColor=transparent`);
    }
  }, [isOpen]);

  const randomizeAvatar = () => {
    const seed = Math.random().toString(36).substring(7);
    setTempPhoto(`https://api.dicebear.com/9.x/fun-emoji/svg?seed=${seed}&backgroundColor=transparent`);
  };

  const handleSave = () => {
    onSave({
      name: tempName.trim() || "Player",
      color: tempColor,
      photo: tempPhoto
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[60] p-4 animate-fade-in">
      <div className="bg-white border-brutal shadow-[8px_8px_0px_0px_#000] max-w-sm w-full flex flex-col p-6 text-center relative">

        {/* Close Button (X) */}
        {onClose && (
          <button
            onClick={onClose}
            disabled={isLoading}
            className="absolute top-4 right-4 w-10 h-10 bg-neo-red border-brutal flex items-center justify-center text-xl font-black hover:scale-110 active:scale-95 transition-transform disabled:opacity-50"
            title="Tutup"
          >
            X
          </button>
        )}

        <h2 className="text-2xl font-black uppercase text-neo-text mb-6 mt-2">Profil Kamu</h2>

        <div className="flex flex-col items-center mb-6">
          <div className="relative mb-4 group">
            <div
              className="w-24 h-24 border-brutal flex items-center justify-center text-5xl overflow-hidden"
              style={{ backgroundColor: tempColor }}
            >
              {tempPhoto ? (
                <img src={tempPhoto} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <UserIcon className="w-12 h-12 text-white drop-shadow-md" />
              )}
            </div>
            <button
              onClick={randomizeAvatar}
              className="absolute -bottom-3 -right-3 bg-neo-yellow border-brutal w-10 h-10 flex items-center justify-center hover:scale-110 active:scale-95 shadow-brutal-sm transition-transform z-10"
              title="Acak Avatar"
              disabled={isLoading}
            >
              <ArrowPathIcon className="w-5 h-5 text-neo-text" />
            </button>
          </div>

          <label className="text-xs font-black uppercase tracking-wider self-start mb-2">Nama</label>
          <input
            type="text"
            value={tempName}
            onChange={(e) => setTempName(e.target.value)}
            className="w-full border-brutal p-3 font-bold text-center mb-6 focus:outline-none focus:ring-4 focus:ring-neo-blue/50 disabled:opacity-50"
            maxLength={15}
            disabled={isLoading}
          />

          <label className="text-xs font-black uppercase tracking-wider self-start mb-2">Warna</label>
          <div className="grid grid-cols-5 gap-3 mx-auto">
            {NEO_COLORS.map(color => (
              <button
                key={color}
                onClick={() => setTempColor(color)}
                disabled={isLoading}
                className={`w-10 h-10 border-brutal transition-transform ${tempColor === color ? 'scale-125 shadow-brutal-sm z-10' : 'hover:scale-110'} disabled:opacity-50`}
                style={{ backgroundColor: color }}
                title={color}
              />
            ))}
          </div>
        </div>

        <div className="flex gap-4 w-full">
          <Button variant="success" onClick={handleSave} disabled={isLoading} className="w-full py-4 text-xl">
            {isLoading ? "LOADING..." : "SIAP MAIN!"}
          </Button>
        </div>
      </div>
    </div>
  );
}
