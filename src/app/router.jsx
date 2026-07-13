import React from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { routes } from "../shared/constants/routes";
import HomePage from "../pages/HomePage";
import GameplayPage from "../pages/GameplayPage";
import NotFoundPage from "../pages/NotFoundPage";
import usePreventReload from "../shared/hooks/usePreventReload";

function ReloadProtector() {
  const location = useLocation();
  // Prevent reload on all pages except main menu
  const shouldPrevent = location.pathname !== routes.mainMenu && location.pathname !== "/";
  usePreventReload(shouldPrevent);
  return null;
}

import { LoadingProvider } from "../shared/context/LoadingContext";

function AppRouter() {
  return (
    <BrowserRouter>
      <LoadingProvider>
        <ReloadProtector />
        <Routes>
          <Route path={routes.mainMenu} element={<HomePage />} />
          <Route path={routes.race} element={<GameplayPage mode="race" />} />
          <Route path={routes.survival} element={<GameplayPage mode="survival" />} />
          <Route path={routes.training} element={<GameplayPage mode="training" />} />
          <Route path={routes.battle} element={<GameplayPage mode="battle" />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </LoadingProvider>
    </BrowserRouter>
  );
}

export default AppRouter;
