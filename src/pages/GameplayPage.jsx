import React from "react";
import { RaceMode } from "../features/race";
import SurvivalMode from "../features/survival/components/SurvivalMode";
import CampaignMode from "../features/campaign/components/CampaignMode";
import BattleMode from "../features/battle/components/BattleMode";
import usePreventReload from "../shared/hooks/usePreventReload";

import { myPlayer } from "playroomkit";
import { Navigate } from "react-router-dom";

function GameplayPage({ mode = "campaign" }) {
  usePreventReload(true);

  if (!myPlayer()) {
    return <Navigate to="/" replace />;
  }

  if (mode === "survival") {
    return <SurvivalMode />;
  }

  if (mode === "campaign") {
    return <CampaignMode />;
  }

  if (mode === "battle") {
    return <BattleMode />;
  }

  return <RaceMode />;
}

export default GameplayPage;

