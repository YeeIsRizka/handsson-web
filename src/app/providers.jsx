import React from "react";
import ErrorBoundary from "../shared/components/ErrorBoundary";

function Providers({ children }) {
  return <ErrorBoundary>{children}</ErrorBoundary>;
}

export default Providers;
