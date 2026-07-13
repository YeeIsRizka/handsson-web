import { useEffect, useState, useRef } from "react";
import { usePlayersList, useMultiplayerState, myPlayer, useIsHost, onDisconnect } from "playroomkit";
import Modal from "../components/ui/Modal";
import Button from "../components/ui/Button";
import ConfirmModal from "../components/ui/ConfirmModal";
import { SignalSlashIcon, ExclamationTriangleIcon } from "@heroicons/react/24/solid";
import { useLoading } from "../context/LoadingContext";

let isDisbandingSelfGlobal = false;

function useHostDisband() {
  const amIHost = useIsHost();
  const players = usePlayersList(true);
  const me = myPlayer();
  const { showLoading } = useLoading();
  
  const [originalHostId, setOriginalHostId] = useMultiplayerState("originalHostId", null);
  const [lobbyDisbanded, setLobbyDisbanded] = useMultiplayerState("lobbyDisbanded", false);

  const [isDisconnected, setIsDisconnected] = useState(false);
  const [disconnectReason, setDisconnectReason] = useState("");
  
  const [showConfirmDisband, setShowConfirmDisband] = useState(false);


  useEffect(() => {
    if (amIHost && !originalHostId && me) {
      setOriginalHostId(me.id);
    }
  }, [amIHost, originalHostId, me, setOriginalHostId]);


  useEffect(() => {
    const cleanup = onDisconnect(() => {
      setDisconnectReason("Anda telah dikeluarkan dari room atau koneksi jaringan terputus.");
      setIsDisconnected(true);
    });
    return () => cleanup();
  }, []);


  useEffect(() => {
    if (!originalHostId || !me || isDisconnected) return;


    if (lobbyDisbanded) {
      if (!isDisbandingSelfGlobal) {
        setDisconnectReason("Lobby telah dibubarkan oleh Host.");
        setIsDisconnected(true);
      }
      return;
    }


    const originalHostStillHere = players.some(p => p.id === originalHostId);
    if (!originalHostStillHere) {
      if (me.id === originalHostId) {
  
        return;
      }
      

      if (amIHost) {
        setLobbyDisbanded(true);
      } else {

        setDisconnectReason("Host telah terputus. Lobby otomatis dibubarkan.");
        setIsDisconnected(true);
      }
    }
  }, [players, originalHostId, me, amIHost, lobbyDisbanded, setLobbyDisbanded, isDisconnected]);

  const requestDisband = () => {
    if (amIHost) {
      setShowConfirmDisband(true);
    } else {
      showLoading("Keluar dari Room...");
      window.__ALLOW_NAVIGATE__ = true;
      setTimeout(() => { window.location.href = window.location.origin; }, 100);
    }
  };

  const confirmDisband = () => {
    isDisbandingSelfGlobal = true;
    setLobbyDisbanded(true);
    showLoading("Keluar dari Room...");
    setTimeout(() => {
      window.__ALLOW_NAVIGATE__ = true;
      window.location.href = window.location.origin;
    }, 500);
  };

  const cancelDisband = () => {
    setShowConfirmDisband(false);
  };

  const DisbandWarningModal = () => (
    <Modal 
      isOpen={isDisconnected} 
      onClose={() => { 
        showLoading("Keluar dari Room...");
        window.__ALLOW_NAVIGATE__ = true; 
        setTimeout(() => { window.location.href = window.location.origin; }, 100);
      }}
      title="Terputus dari Room"
      footer={
        <Button onClick={() => { 
          showLoading("Keluar dari Room...");
          window.__ALLOW_NAVIGATE__ = true; 
          setTimeout(() => { window.location.href = window.location.origin; }, 100);
        }} className="w-full">
          Kembali ke Beranda
        </Button>
      }
    >
      <div className="p-6 text-center text-neo-text">
        <div className="flex justify-center mb-4">
          <SignalSlashIcon className="w-12 h-12 text-neo-red" />
        </div>
        <p className="text-lg font-bold">{disconnectReason}</p>
      </div>
    </Modal>
  );

  const HostDisbandConfirmModal = () => (
    <ConfirmModal
      isOpen={showConfirmDisband}
      title="Bubarkan Lobby?"
      description="Anda adalah Host. Jika Anda keluar, lobby akan dibubarkan dan seluruh pemain akan dikeluarkan."
      confirmText="KELUAR & BUBARKAN"
      cancelText="BATAL"
      icon={<ExclamationTriangleIcon className="w-14 h-14 text-neo-red" />}
      onConfirm={confirmDisband}
      onCancel={cancelDisband}
    />
  );

  return { disbandLobby: requestDisband, DisbandWarningModal, HostDisbandConfirmModal };
}

export default useHostDisband;
