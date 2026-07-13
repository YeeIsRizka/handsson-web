import React, { useState, useEffect } from "react";
import Modal from "../../../shared/components/ui/Modal";
import Button from "../../../shared/components/ui/Button";

export default function JoinRoomModal({ isOpen, onClose, onJoin, isLoading }) {
  const [roomCode, setRoomCode] = useState("");

  useEffect(() => {
    if (isOpen) {
      setRoomCode("");
    }
  }, [isOpen]);

  const handleJoin = () => {
    if (roomCode.trim().length > 0) {
      onJoin(roomCode.trim().toUpperCase());
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleJoin();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Gabung Room"
      maxWidth="max-w-md"
      footer={
        <div className="flex gap-4 w-full">
          <Button variant="outline" onClick={onClose} className="flex-1 bg-white">Batal</Button>
          <Button
            variant="success"
            onClick={handleJoin}
            className="flex-1"
            disabled={roomCode.trim().length === 0 || isLoading}
          >
            {isLoading ? "BERGABUNG..." : "GABUNG"}
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-4 text-center">
        <p className="text-neo-text font-bold">Masukkan kode room dari teman Anda:</p>
        <input
          type="text"
          value={roomCode}
          onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
          onKeyDown={handleKeyDown}
          placeholder="4 HURUF"
          maxLength={4}
          className="w-full border-brutal border-neo-border p-4 text-4xl font-black text-center uppercase tracking-widest bg-gray-50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-neo-blue/50 focus:border-neo-blue shadow-brutal-sm transition-all"
          autoFocus
        />
      </div>
    </Modal>
  );
}
