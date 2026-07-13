import React, { useState, useEffect } from "react";
import MainMenuPage from "./MainMenuPage";
import RoomLobbyPage from "./RoomLobbyPage";
import ProfileSetupModal from "../features/lobby/components/ProfileSetupModal";
import { myPlayer, insertCoin } from "playroomkit";
import { useLoading } from "../shared/context/LoadingContext";

export default function HomePage() {
  const [isInRoom, setIsInRoom] = useState(!!myPlayer());
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { showLoading, hideLoading } = useLoading();

  useEffect(() => {
    // If URL contains a Playroom room code (e.g. #r=ABC), open Profile Setup first
    if (window.location.hash.includes("#r=") && !myPlayer()) {
      setIsProfileModalOpen(true);
    } else if (myPlayer()) {
      setIsInRoom(true);
    }
  }, []);

  const handleProfileSaveForUrlJoin = async (profileData) => {
    try {
      setIsLoading(true);
      showLoading("Bergabung ke Room...");
      await insertCoin({ skipLobby: true });

      const me = myPlayer();
      if (me) {
        me.setState("customName", profileData.name, true);
        me.setState("customColor", profileData.color, true);
        me.setState("customPhoto", profileData.photo, true);
        me.setState("profileSetupDone", true, true);
      }

      setIsProfileModalOpen(false);
      setIsInRoom(true);

      setTimeout(() => {
        hideLoading();
      }, 500);
    } catch (e) {
      console.error("Failed to join room directly:", e);
      alert("Gagal bergabung ke room! Pastikan kode benar.");
      window.location.href = '/';
      hideLoading();
    } finally {
      setIsLoading(false);
    }
  };

  const cancelUrlJoin = () => {
    window.location.href = '/';
  };

  if (isInRoom) {
    return <RoomLobbyPage onLeave={() => setIsInRoom(false)} />;
  }

  return (
    <>
      <MainMenuPage onJoin={() => setIsInRoom(true)} />

      <ProfileSetupModal
        isOpen={isProfileModalOpen}
        onClose={cancelUrlJoin}
        onSave={handleProfileSaveForUrlJoin}
        isLoading={isLoading}
      />
    </>
  );
}
