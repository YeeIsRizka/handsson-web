import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { insertCoin, myPlayer, useIsHost, useMultiplayerState, usePlayersList, getRoomCode, onDisconnect } from "playroomkit";
import { routes } from "../shared/constants/routes";
import useHostDisband from "../shared/hooks/useHostDisband";
import ModeSelectModal, { MODES } from "../features/lobby/components/ModeSelectModal";
import usePreventReload from "../shared/hooks/usePreventReload";
import Button from "../shared/components/ui/Button";
import Card from "../shared/components/ui/Card";
import ConfirmModal from "../shared/components/ui/ConfirmModal";
import PlayerCard from "../features/lobby/components/PlayerCard";
import ActionCard from "../features/lobby/components/ActionCard";
import SettingsModal from "../features/gameplay/components/SettingsModal";
import TutorialModal from "../shared/components/ui/TutorialModal";
import { CheckIcon, LinkIcon, ArrowPathIcon, ClipboardDocumentCheckIcon, Cog6ToothIcon, QuestionMarkCircleIcon } from "@heroicons/react/24/solid";
import { useAudio } from "../shared/context/AudioContext";
import { useLoading } from "../shared/context/LoadingContext";

const BOT_NAMES = ["Bot Budi", "Bot Siti", "Bot Udin", "Bot Wati"];

function RoomLobbyPage({ onLeave }) {
  usePreventReload(true);
  const navigate = useNavigate();
  const { navigateWithLoading } = useLoading();
  const roomId = getRoomCode();
  const amIHost = useIsHost();
  const { disbandLobby, DisbandWarningModal, HostDisbandConfirmModal } = useHostDisband();

  const [isInitializing, setIsInitializing] = useState(true);
  const [isCopied, setIsCopied] = useState(false);
  const [isInviteCopied, setIsInviteCopied] = useState(false);
  const [isModeModalOpen, setIsModeModalOpen] = useState(false);
  const [playerToKick, setPlayerToKick] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const isStartingGame = React.useRef(false);
  const { playBgm, pauseBgm } = useAudio();

  const NEO_COLORS = ["#FF3366", "#00C2FF", "#FFD000", "#00FF66", "#FF6B00", "#9D00FF", "#E5E5E5", "#FF00FF"];


  const humanPlayersState = usePlayersList(true);
  const [bots, setBots] = useMultiplayerState("bots", []);
  const [botCounter, setBotCounter] = useMultiplayerState("botCounter", 1);
  const [selectedModes, setSelectedModes] = useMultiplayerState("selectedModes", ["training"]);
  const [gameStarted, setGameStarted] = useMultiplayerState("gameStarted", null);


  useEffect(() => {
    const me = myPlayer();
    if (me && !me.getState("joinTime")) {
      me.setState("joinTime", Date.now(), true);
    }
  }, [humanPlayersState]);


  const nameCounts = {};
  const sortedHumans = [...humanPlayersState]
    .filter(p => p.getState("profileSetupDone") || p.id === myPlayer()?.id)
    .sort((a, b) => {
      const timeA = a.getState("joinTime") || 0;
      const timeB = b.getState("joinTime") || 0;
      return timeA - timeB;
    });

  const mappedHumans = sortedHumans.map((p, index) => {
    const profile = p.getProfile();
    const customName = p.getState("customName");
    const baseName = customName || profile.name || `Player ${index + 1}`;

    let finalName = baseName;
    if (nameCounts[baseName]) {
      nameCounts[baseName]++;
      finalName = `${baseName} ${nameCounts[baseName]}`;
    } else {
      nameCounts[baseName] = 1;
    }

    return {
      id: p.id,
      name: finalName,
      isHuman: true,
      hp: 100,
      playroomState: p,
      isMe: p.id === myPlayer()?.id,
      isHost: index === 0,
      color: p.getState("customColor") || profile.color?.hexString,
      photo: p.getState("customPhoto") || profile.photo,
    };
  });

  const mappedBots = (bots || []).map(bot => {
    let finalName = bot.name;
    if (nameCounts[bot.name]) {
      nameCounts[bot.name]++;
      finalName = `${bot.name} ${nameCounts[bot.name]}`;
    } else {
      nameCounts[bot.name] = 1;
    }
    return { ...bot, name: finalName };
  });


  const players = [...mappedHumans, ...mappedBots];


  useEffect(() => {
    const initPlayroom = async () => {
      try {
        if (!myPlayer()) {
          await insertCoin({ skipLobby: true });
        }
        setIsInitializing(false);
      } catch (e) {
        console.error("Failed to join room directly:", e);
        alert("Gagal bergabung ke room! Pastikan kode benar.");
        if (onLeave) onLeave();
        navigate("/");
      }
    };
    initPlayroom();
  }, [navigate, onLeave]);


  useEffect(() => {
    if (gameStarted && !amIHost && !isInitializing) {
      navigateWithLoading(gameStarted.route, { message: "Mempersiapkan Arena..." });
    }
  }, [gameStarted, amIHost, isInitializing, navigateWithLoading]);

  // Reset stale gameStarted when host returns to lobby
  useEffect(() => {
    if (amIHost && gameStarted && !isStartingGame.current) {
      setGameStarted(null);
    }
  }, [amIHost, gameStarted, setGameStarted]);


  useEffect(() => {
    playBgm();
    return () => {
      pauseBgm();
    };
  }, [playBgm, pauseBgm]);


  useEffect(() => {
    if (!amIHost) return;

    const currentBots = bots || [];
    const totalPlayers = humanPlayersState.length + currentBots.length;

    if (totalPlayers > 4 && currentBots.length > 0) {
      const numBotsToRemove = totalPlayers - 4;
      const nextBots = currentBots.slice(0, Math.max(0, currentBots.length - numBotsToRemove));

      if (nextBots.length !== currentBots.length) {
        setBots(nextBots);

        const newPlayerCount = humanPlayersState.length + nextBots.length;
        const supported = selectedModes.filter(modeId => {
          const modeDef = MODES.find(m => m.id === modeId);
          return modeDef && newPlayerCount >= (modeDef.minPlayers || 1) && newPlayerCount <= (modeDef.maxPlayers || 4);
        });
        setSelectedModes(supported.length === 0 ? (newPlayerCount === 1 ? ["training"] : ["race", "survival", "battle"]) : supported);
      }
    } else {

      const supported = selectedModes.filter(modeId => {
        const modeDef = MODES.find(m => m.id === modeId);
        return modeDef && totalPlayers >= (modeDef.minPlayers || 1) && totalPlayers <= (modeDef.maxPlayers || 4);
      });
      if (supported.length !== selectedModes.length) {
        setSelectedModes(supported.length === 0 ? (totalPlayers === 1 ? ["training"] : ["race", "survival", "battle"]) : supported);
      }
    }
  }, [amIHost, humanPlayersState.length, bots, selectedModes, setBots, setSelectedModes]);

  const handleCopyCode = () => {
    if (roomId) {
      navigator.clipboard.writeText(roomId);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const handleInviteFriend = () => {
    const inviteLink = `${window.location.origin}/#r=R${roomId}`;
    const message = `Ayo main Hands On! bareng! 🤟\n\nKlik link ini buat gabung ke room aku:\n${inviteLink}\n\nAtau masukkan kode room manual: ${roomId}`;

    navigator.clipboard.writeText(message)
      .then(() => {
        setIsInviteCopied(true);
        setTimeout(() => setIsInviteCopied(false), 2000);
      })
      .catch((err) => {
        console.error("Gagal menyalin link:", err);
      });
  };

  const handleAddBot = () => {
    if (!amIHost) return;
    const currentBots = bots || [];
    const totalPlayers = humanPlayersState.length + currentBots.length;

    if (totalPlayers >= 4) {
      alert("Maksimal 4 pemain di dalam room!");
      return;
    }

    // Pick an unused bot name
    const usedNames = currentBots.map(b => b.name);
    const availableNames = BOT_NAMES.filter(name => !usedNames.includes(name));
    const botName = availableNames.length > 0 ? availableNames[0] : `Bot ${botCounter}`;

    const newBots = [
      ...currentBots,
      {
        id: `bot-${botCounter}`,
        name: botName,
        isHuman: false,
        hp: 100,
      },
    ];
    setBots(newBots);
    setBotCounter(botCounter + 1);
  };

  const handleRemovePlayer = (id) => {
    if (!amIHost) return;


    const isBot = (bots || []).some(b => b.id === id);
    if (isBot) {
      const nextBots = (bots || []).filter((b) => b.id !== id);
      setBots(nextBots);

    } else {

      const humanPlayer = humanPlayersState.find(p => p.id === id);
      if (humanPlayer) {
        setPlayerToKick(humanPlayer);
      }
    }
  };

  const confirmKickPlayer = () => {
    if (playerToKick) {
      playerToKick.kick();
      setPlayerToKick(null);
    }
  };

  const cancelKickPlayer = () => {
    setPlayerToKick(null);
  };

  const handleToggleMode = (modeId) => {
    if (!amIHost) return;
    if (selectedModes.includes(modeId)) {
      setSelectedModes(selectedModes.filter((id) => id !== modeId));
    } else {
      setSelectedModes([...selectedModes, modeId]);
    }
  };

  const handleStartGame = () => {
    if (!amIHost || selectedModes.length === 0) return;


    const randomMode = selectedModes[Math.floor(Math.random() * selectedModes.length)];
    const routeToNavigate = routes[randomMode] || routes.gameplay;

    setIsModeModalOpen(false);
    isStartingGame.current = true;


    setGameStarted({ route: routeToNavigate });


    navigateWithLoading(routeToNavigate, { message: "Mempersiapkan Arena..." });
  };

  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neo-purple">
        <h1 className="text-white text-3xl font-black animate-pulse">Menghubungkan ke Room...</h1>
      </div>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-4 sm:p-8 relative">
      <Card color="bg-neo-purple" padding="p-2" className="w-full max-w-4xl shadow-brutal-lg">
        <div className="bg-white border-brutal w-full h-full flex flex-col">


          <header className="flex justify-between items-center p-6 border-b-brutal bg-neo-yellow">
            <div className="flex items-center gap-3">
              <img src="/assets/logo/logo.png" alt="Hands On!" className="w-10 h-10 object-contain" />
              <span className="font-black text-3xl tracking-widest uppercase">
                Lobby
              </span>
              <DisbandWarningModal />
              <HostDisbandConfirmModal />
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowTutorial(true)}
                className="bg-white border-brutal hover:bg-gray-200 active:active-brutal-sm p-2 transition-all shadow-brutal-sm"
                aria-label="Cara Bermain"
              >
                <QuestionMarkCircleIcon className="w-8 h-8 text-neo-purple" />
              </button>
              <button
                onClick={() => setShowSettings(true)}
                className="bg-white border-brutal hover:bg-gray-200 active:active-brutal-sm p-2 transition-all shadow-brutal-sm"
                aria-label="Pengaturan"
              >
                <Cog6ToothIcon className="w-8 h-8 text-neo-text" />
              </button>
            </div>
          </header>


          <div className="p-8 sm:p-12 flex flex-col items-center gap-12 bg-white text-neo-text">


            <div className="text-center relative group w-full">
              <p className="font-black text-sm tracking-[0.2em] uppercase mb-2">Kode Room</p>
              <div
                onClick={handleCopyCode}
                className="relative text-3xl sm:text-7xl font-mono font-black tracking-widest bg-neo-purple border-brutal shadow-brutal px-4 py-4 sm:px-10 sm:py-6 hover:bg-purple-400 hover:-translate-y-1 hover:shadow-brutal-lg transition-all cursor-pointer active:active-brutal group flex justify-center w-full"
                title="Klik untuk menyalin"
              >
                <span className="text-white">
                  {roomId || "LOCAL"}
                </span>
                <div className="absolute -bottom-8 text-sm font-sans tracking-normal font-bold text-neo-text opacity-0 group-hover:opacity-100 transition-opacity">
                  KLIK UNTUK MENYALIN
                </div>
              </div>
              {isCopied && (
                <div className="absolute -right-6 top-1/2 -translate-y-1/2 translate-x-full bg-neo-green border-brutal text-white px-4 py-2 text-sm font-black animate-fade-in shadow-brutal-sm flex items-center gap-1">
                  <ClipboardDocumentCheckIcon className="w-4 h-4" /> TERSALIN
                </div>
              )}
            </div>


            <div className="w-full">
              <div className="flex items-center justify-center gap-4 mb-6">
                <div className="h-[3px] bg-neo-border flex-1" />
                <h2 className="font-black text-sm tracking-widest uppercase bg-neo-yellow border-brutal px-4 py-2">
                  Pemain ({players.length}/4)
                </h2>
                <div className="h-[3px] bg-neo-border flex-1" />
              </div>

              <div className="grid grid-cols-2 sm:flex sm:flex-row sm:flex-wrap justify-center gap-4 sm:gap-6 justify-items-center mx-auto">
                {players.map((player) => (
                  <PlayerCard
                    key={player.id}
                    name={player.name}
                    isHuman={player.isHuman}
                    color={player.color}
                    photo={player.photo}
                    isHost={player.isHost}
                    isMe={player.isMe}
                    onRemove={() => handleRemovePlayer(player.id)}
                    showRemoveButton={!player.isMe && amIHost}
                    removeTitle={player.isHuman ? "Tendang Pemain" : "Hapus Bot"}
                  />
                ))}

                {players.length < 4 && amIHost && (
                  <>
                    <ActionCard
                      icon="+"
                      label="Bot"
                      onClick={handleAddBot}
                    />
                    <ActionCard
                      icon={<LinkIcon className="w-8 h-8" />}
                      label="Teman"
                      onClick={handleInviteFriend}
                      hoverClasses="hover:bg-neo-blue hover:text-white"
                    >
                      {isInviteCopied && (
                        <div className="absolute inset-0 bg-neo-green text-white flex flex-col items-center justify-center border-brutal shadow-brutal animate-fade-in z-10">
                          <CheckIcon className="w-10 h-10 mb-2" />
                          <span className="text-xs font-black uppercase tracking-wider text-center">Tersalin!</span>
                        </div>
                      )}
                    </ActionCard>
                  </>
                )}
                {players.length < 4 && !amIHost && (
                  <div className="flex flex-col items-center justify-center w-full sm:w-32 h-40 bg-gray-50 border-brutal border-dashed opacity-50">
                    <span className="text-xs font-black uppercase tracking-wider text-center px-2">Menunggu Pemain...</span>
                  </div>
                )}
              </div>
            </div>


            <div className="flex flex-col sm:flex-row items-stretch justify-center gap-4 w-full pt-4">
              <Button
                variant="outline"
                onClick={() => setIsModeModalOpen(true)}
                className="flex-1 text-xl py-4 bg-gray-100 hover:bg-gray-200"
              >
                <ArrowPathIcon className="w-7 h-7 mr-2 inline-block" />
                <span>Mode ({selectedModes.length})</span>
              </Button>

              {amIHost ? (
                <Button
                  variant="success"
                  onClick={handleStartGame}
                  disabled={selectedModes.length === 0}
                  className={`flex-[2] text-xl py-4 ${selectedModes.length === 0 ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  MULAI PERMAINAN
                </Button>
              ) : (
                <div className="flex-[2] flex items-center justify-center bg-gray-200 border-brutal text-gray-500 font-black text-xl py-4">
                  MENUNGGU HOST...
                </div>
              )}
            </div>

          </div>
        </div>
      </Card>

      <ModeSelectModal
        isOpen={isModeModalOpen}
        onClose={() => setIsModeModalOpen(false)}
        selectedModes={selectedModes}
        onToggleMode={handleToggleMode}
        playerCount={players.length}
        readonly={!amIHost}
      />

      <ConfirmModal
        isOpen={!!playerToKick}
        title="Tendang Pemain?"
        description={
          <>Keluarkan <span className="text-neo-red font-black uppercase tracking-wider">{playerToKick ? (playerToKick.getState("customName") || playerToKick.getProfile().name) : 'pemain ini'}</span> dari room?</>
        }
        confirmText="TENDANG"
        onConfirm={confirmKickPlayer}
        onCancel={cancelKickPlayer}
      />

      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        onExitRoom={() => {
          if (amIHost) disbandLobby();
          else { window.__ALLOW_NAVIGATE__ = true; window.location.href = window.location.origin; }
        }}
      />

      <TutorialModal 
        isOpen={showTutorial}
        onClose={() => setShowTutorial(false)}
      />

    </main>
  );
}

export default RoomLobbyPage;
