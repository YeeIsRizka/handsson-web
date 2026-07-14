import React, { useState } from "react";
import { insertCoin, myPlayer } from "playroomkit";
import Button from "../shared/components/ui/Button";
import JoinRoomModal from "../features/lobby/components/JoinRoomModal";
import ProfileSetupModal from "../features/lobby/components/ProfileSetupModal";
import TutorialModal from "../shared/components/ui/TutorialModal";
import { useLoading } from "../shared/context/LoadingContext";

function MainMenuPage({ onJoin }) {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingType, setLoadingType] = useState(null);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [isTutorialModalOpen, setIsTutorialModalOpen] = useState(false);
  const { showLoading, hideLoading } = useLoading();


  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);

  const handleCreateRoomClick = () => {
    setPendingAction({ type: "create" });
    setIsProfileModalOpen(true);
  };

  const handleJoinRoomClick = () => {
    setIsJoinModalOpen(true);
  };

  const submitJoinCode = (roomCode) => {
    if (roomCode && roomCode.trim().length > 0) {
      setIsJoinModalOpen(false);
      setPendingAction({ type: "join", roomCode: roomCode.trim().toUpperCase() });
      setIsProfileModalOpen(true);
    }
  };

  const executePlayroomAction = async (profileData) => {
    try {
      setIsLoading(true);
      setLoadingType(pendingAction.type);
      showLoading(pendingAction.type === "join" ? "Bergabung ke Room..." : "Membuat Room...");

      const options = { skipLobby: true };
      if (pendingAction.type === "join") {
        options.roomCode = pendingAction.roomCode;
      }

      await insertCoin(options);

      // Save profile to Playroom state immediately after joining
      const me = myPlayer();
      if (me) {
        me.setState("customName", profileData.name, true);
        me.setState("customColor", profileData.color, true);
        me.setState("customPhoto", profileData.photo, true);
        me.setState("profileSetupDone", true, true);
      }

      setIsProfileModalOpen(false);
      onJoin();
      
      setTimeout(() => {
        hideLoading();
      }, 500);
    } catch (error) {
      console.error(`Failed to ${pendingAction.type} room:`, error);
      if (pendingAction.type === "join") {
        alert("Gagal bergabung! Pastikan kode benar, atau Anda mungkin telah diblokir/dikeluarkan dari room ini oleh Host.");
      } else {
        alert("Gagal membuat room. Periksa koneksi internet Anda.");
      }
      setIsLoading(false);
      setLoadingType(null);
      setIsProfileModalOpen(false);
      hideLoading();
    }
  };

  const cancelProfileSetup = () => {
    setIsProfileModalOpen(false);
    setPendingAction(null);
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-4 sm:p-8 relative overflow-hidden">
      <div className="w-full max-w-xl bg-neo-purple border-brutal shadow-brutal-lg flex flex-col p-1 animate-fade-in relative z-10">


        <div className="bg-white border-b-brutal border-neo-border p-10 sm:p-14 flex flex-col items-center gap-4 text-center">
          <div className="mb-2 rotate-3">
            <img src="/assets/logo/logo.png" alt="Hands On! Logo" className="w-20 h-20 object-contain" />
          </div>
          <h1 className="font-black text-5xl sm:text-6xl tracking-tighter uppercase text-neo-text">
            Hands On!
          </h1>
          <p className="text-neo-text font-bold text-base sm:text-lg max-w-sm mt-4 border-2 border-dashed border-neo-border p-3">
            Selamat datang! Buat room baru atau gabung room yang sudah ada untuk mulai bermain.
          </p>
        </div>


        <div className="bg-neo-blue p-8 sm:p-10 flex flex-col gap-5 w-full">
          <Button
            variant="primary"
            fullWidth
            onClick={handleCreateRoomClick}
            disabled={isLoading}
            className="text-xl py-4"
          >
            Buat Room
          </Button>

          <div className="flex items-center gap-4 my-2">
            <div className="h-1 bg-neo-border flex-1" />
            <span className="text-white font-black uppercase tracking-widest text-xl">ATAU</span>
            <div className="h-1 bg-neo-border flex-1" />
          </div>

          <Button
            variant="success"
            fullWidth
            onClick={handleJoinRoomClick}
            disabled={isLoading}
            className="text-xl py-4"
          >
            Gabung Room
          </Button>

          <div className="w-full h-1 bg-neo-border my-4" />
          
          <Button
            variant="outline"
            fullWidth
            onClick={() => setIsTutorialModalOpen(true)}
            disabled={isLoading}
            className="text-xl py-4 border-2 border-neo-text shadow-[4px_4px_0px_0px_#000]"
          >
            Cara Bermain
          </Button>
        </div>
      </div>

      <JoinRoomModal
        isOpen={isJoinModalOpen}
        onClose={() => setIsJoinModalOpen(false)}
        onJoin={submitJoinCode}
      />

      <ProfileSetupModal
        isOpen={isProfileModalOpen}
        onClose={cancelProfileSetup}
        onSave={executePlayroomAction}
        isLoading={isLoading}
      />

      <TutorialModal 
        isOpen={isTutorialModalOpen}
        onClose={() => setIsTutorialModalOpen(false)}
      />
    </main>
  );
}

export default MainMenuPage;
