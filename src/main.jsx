import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./shared/styles/globals.css";
import App from "./app/App.jsx";
import Providers from "./app/providers.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Providers>
      <App />
    </Providers>
  </StrictMode>
);
