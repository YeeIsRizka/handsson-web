import React from "react";
import { RaceMode } from "../features/race";
import SurvivalMode from "../features/survival/components/SurvivalMode";
import TrainingMode from "../features/training/components/TrainingMode";
import BattleMode from "../features/battle/components/BattleMode";
import usePreventReload from "../shared/hooks/usePreventReload";

import { myPlayer } from "playroomkit";
import { Navigate } from "react-router-dom";

function GameplayPage({ mode = "training" }) {
  usePreventReload(true);

  if (!myPlayer() && mode !== "training") {
    return <Navigate to="/" replace />;
  }

  if (!myPlayer() && mode === "training") {
    return <Navigate to="/" replace />;
  }

  if (mode === "survival") {
    return <SurvivalMode />;
  }

  if (mode === "training") {
    return <TrainingMode />;
  }

  if (mode === "battle") {
    return <BattleMode />;
  }

  return <RaceMode />;
}

export default GameplayPage;
