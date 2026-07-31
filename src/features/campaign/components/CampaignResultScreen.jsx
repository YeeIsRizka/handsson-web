import React from "react";
import { TOTAL_LEVELS } from "../utils/campaignConfig";
import {
  TrophyIcon,
  ClockIcon,
  LockClosedIcon,
  ArrowPathIcon,
  ChevronRightIcon,
  ArrowLeftIcon,
  SparklesIcon,
  CheckIcon,
  XMarkIcon,
} from "@heroicons/react/24/solid";

function CampaignResultScreen({
  type,
  currentLevel,
  levelScore,
  levelTimeUsed,
  levelResults,
  totalScore,
  totalTime,
  onNextLevel,
  onRestartCampaign,
  onBackToLobby,
}) {
  const isComplete = type === "campaign_complete";
  const isFailed = type === "level_failed";
  const isLevelWin = type === "level_complete";

  // ── Header config ─────────────────────────────────────────────────────────
  const headerBg = isComplete
    ? "bg-neo-green"
    : isFailed
      ? "bg-neo-red"
      : "bg-neo-yellow";

  const headerTitle = isComplete
    ? "Campaign Complete!"
    : isFailed
      ? "Campaign Failed!"
      : `Level ${currentLevel} Complete!`;

  // ── Progress list ─────────────────────────────────────────────────────────
  const levelLines = Array.from({ length: TOTAL_LEVELS }, (_, i) => {
    const lvl = i + 1;
    const result = levelResults.find((r) => r.level === lvl);

    if (result && result.failed) {
      return { lvl, status: "failed", score: result.score || 0 };
    }
    if (result) {
      return { lvl, status: "done", score: result.score, timeUsed: result.timeUsed };
    }
    return { lvl, status: "locked" };
  });

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 sm:p-8 animate-fade-in">
      <div className="bg-white border-brutal shadow-brutal-lg w-full max-w-xl flex flex-col overflow-hidden max-h-[90vh]">

        {/* ── Header ── */}
        <div className={`flex items-center justify-center p-5 border-b-brutal ${headerBg}`}>
          <h2 className={`text-xl sm:text-2xl font-black tracking-wide uppercase text-center ${isFailed || isComplete ? "text-white" : "text-neo-text"}`}>
            {headerTitle}
          </h2>
        </div>

        {/* ── Body ── */}
        <div className="overflow-y-auto flex-1 p-5 sm:p-6 space-y-4">

          {/* Level win stat card — level score + level time */}
          {isLevelWin && (
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-neo-yellow border-brutal p-3 shadow-brutal-sm flex flex-col items-center -rotate-1">
                <TrophyIcon className="w-4 h-4 text-neo-text mb-1" />
                <span className="text-[9px] uppercase tracking-widest font-black text-neo-text mb-1">
                  Skor Level
                </span>
                <span className="text-2xl font-black text-neo-text">{levelScore}</span>
              </div>
              <div className="bg-white border-brutal p-3 shadow-brutal-sm flex flex-col items-center rotate-1">
                <ClockIcon className="w-4 h-4 text-neo-text mb-1" />
                <span className="text-[9px] uppercase tracking-widest font-black text-neo-text mb-1">
                  Waktu
                </span>
                <span className="text-2xl font-black text-neo-text">{levelTimeUsed}s</span>
              </div>
            </div>
          )}

          {/* Campaign failed stat card — total score + total time */}
          {isFailed && (
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-neo-red border-brutal p-4 shadow-brutal flex flex-col items-center -rotate-1">
                <TrophyIcon className="w-5 h-5 text-white mb-1" />
                <span className="text-[9px] uppercase tracking-widest font-black text-white mb-1">
                  Total Skor
                </span>
                <span className="text-3xl font-black text-white">{totalScore}</span>
              </div>
              <div className="bg-white border-brutal p-4 shadow-brutal flex flex-col items-center rotate-1">
                <ClockIcon className="w-5 h-5 text-neo-text mb-1" />
                <span className="text-[9px] uppercase tracking-widest font-black text-neo-text mb-1">
                  Total Waktu
                </span>
                <span className="text-3xl font-black text-neo-text">{totalTime}s</span>
              </div>
            </div>
          )}

          {/* Campaign Complete totals */}
          {isComplete && (
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-neo-green border-brutal p-4 shadow-brutal flex flex-col items-center -rotate-1">
                <TrophyIcon className="w-5 h-5 text-white mb-1" />
                <span className="text-[9px] uppercase tracking-widest font-black text-white mb-1">
                  Total Skor
                </span>
                <span className="text-3xl font-black text-white">{totalScore}</span>
              </div>
              <div className="bg-neo-purple border-brutal p-4 shadow-brutal flex flex-col items-center rotate-1">
                <ClockIcon className="w-5 h-5 text-white mb-1" />
                <span className="text-[9px] uppercase tracking-widest font-black text-white mb-1">
                  Total Waktu
                </span>
                <span className="text-3xl font-black text-white">{totalTime}s</span>
              </div>
            </div>
          )}

          {/* Campaign Progress divider */}
          <div className="flex items-center gap-3">
            <div className="h-[2px] bg-neo-border flex-1" />
            <span className="text-[10px] uppercase tracking-widest font-black text-neo-text bg-white border-brutal px-2">
              Progres Campaign
            </span>
            <div className="h-[2px] bg-neo-border flex-1" />
          </div>

          {/* Level list */}
          <div className="space-y-2">
            {levelLines.map(({ lvl, status, score, timeUsed }) => (
              <LevelRow
                key={lvl}
                level={lvl}
                status={status}
                score={score}
                timeUsed={timeUsed}
              />
            ))}
          </div>

          {/* Campaign complete bottom banner */}
          {isComplete && (
            <div className="bg-neo-yellow border-brutal p-3 shadow-brutal-sm text-center flex items-center justify-center gap-2">
              <SparklesIcon className="w-5 h-5 text-neo-text" />
              <p className="text-sm font-black uppercase tracking-wider text-neo-text">
                SEMUA LEVEL BERHASIL DISELESAIKAN!
              </p>
              <SparklesIcon className="w-5 h-5 text-neo-text" />
            </div>
          )}
        </div>

        {/* ── Footer buttons ── */}
        <div className="p-5 border-t-brutal bg-white flex flex-col sm:flex-row gap-3">
          {isLevelWin && (
            <button
              id="campaign-next-level-btn"
              onClick={onNextLevel}
              className="flex-1 py-3 font-black text-lg tracking-wide uppercase transition-all flex items-center justify-center gap-2 bg-neo-green text-white border-brutal shadow-brutal hover:-translate-y-1 hover:-translate-x-1 active:translate-y-1 active:translate-x-1 active:shadow-none"
            >
              Level Berikutnya
            </button>
          )}

          {isFailed && (
            <>
              <button
                id="campaign-restart-btn"
                onClick={onRestartCampaign}
                className="flex-1 py-3 font-black text-lg tracking-wide uppercase transition-all flex items-center justify-center gap-2 bg-neo-yellow text-neo-text border-brutal shadow-brutal hover:-translate-y-1 hover:-translate-x-1 active:translate-y-1 active:translate-x-1 active:shadow-none"
              >
                Mulai Ulang
              </button>
              <button
                id="campaign-back-lobby-failed-btn"
                onClick={onBackToLobby}
                className="flex-1 py-3 bg-white border-brutal shadow-brutal hover:bg-neo-red hover:text-white transition-colors font-black text-lg uppercase flex items-center justify-center gap-2 hover:-translate-y-1 hover:-translate-x-1 active:translate-y-1 active:translate-x-1 active:shadow-none"
              >
                Kembali ke Lobby
              </button>
            </>
          )}

          {isComplete && (
            <>
              <button
                id="campaign-play-again-btn"
                onClick={onRestartCampaign}
                className="flex-1 py-3 font-black text-lg tracking-wide uppercase transition-all flex items-center justify-center gap-2 bg-neo-green text-white border-brutal shadow-brutal hover:-translate-y-1 hover:-translate-x-1 active:translate-y-1 active:translate-x-1 active:shadow-none"
              >
                Main Lagi
              </button>
              <button
                id="campaign-back-lobby-complete-btn"
                onClick={onBackToLobby}
                className="flex-1 py-3 bg-white border-brutal shadow-brutal hover:bg-neo-red hover:text-white transition-colors font-black text-lg uppercase flex items-center justify-center gap-2 hover:-translate-y-1 hover:-translate-x-1 active:translate-y-1 active:translate-x-1 active:shadow-none"
              >
                Kembali ke Lobby
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ── LevelRow sub-component ─────────────────────────────────────────────────────
function LevelRow({ level, status, score, timeUsed }) {
  const isLocked = status === "locked";
  const isFailed = status === "failed";
  const isDone = status === "done";

  return (
    <div
      className={`flex items-center justify-between p-3 border-brutal shadow-[2px_2px_0px_0px_#000] text-sm ${isFailed ? "bg-red-50" : isDone ? "bg-green-50" : "bg-gray-100 opacity-60"
        }`}
    >
      <div className="flex items-center gap-3">
        {isDone && (
          <div className="w-8 h-8 bg-neo-green border-brutal shadow-[1px_1px_0px_0px_#000] flex items-center justify-center text-white flex-shrink-0">
            <CheckIcon className="w-5 h-5 stroke-[3]" />
          </div>
        )}
        {isFailed && (
          <div className="w-8 h-8 bg-neo-red border-brutal shadow-[1px_1px_0px_0px_#000] flex items-center justify-center text-white flex-shrink-0">
            <XMarkIcon className="w-5 h-5 stroke-[3]" />
          </div>
        )}
        {isLocked && (
          <div className="w-8 h-8 bg-gray-200 border-brutal shadow-[1px_1px_0px_0px_#000] flex items-center justify-center text-gray-500 flex-shrink-0">
            <LockClosedIcon className="w-4 h-4" />
          </div>
        )}
        <span className="font-black text-neo-text uppercase tracking-wide">
          Level {level}
        </span>
      </div>

      <div className="text-right font-bold text-neo-text text-xs">
        {isDone && (
          <span className="inline-flex items-center gap-2">
            <span className="bg-neo-yellow border-brutal px-2 py-0.5 text-neo-text font-black shadow-[1px_1px_0px_0px_#000]">
              {score} poin
            </span>
            <span className="flex items-center gap-0.5 text-neo-text/60">
              <ClockIcon className="w-3 h-3 inline" />
              {timeUsed}s
            </span>
          </span>
        )}
        {isFailed && (
          <span className="inline-flex items-center gap-2">
            <span className="bg-white border-brutal px-2 py-0.5 text-neo-text font-black shadow-[1px_1px_0px_0px_#000]">
              {score} poin
            </span>
            <span className="text-neo-red font-black uppercase tracking-wider text-xs">
              Gagal
            </span>
          </span>
        )}
        {isLocked && (
          <span className="text-neo-text/40 font-black text-xs uppercase tracking-wider">
            Terkunci
          </span>
        )}
      </div>
    </div>
  );
}

export default CampaignResultScreen;
