import React from "react";
import { ExclamationTriangleIcon } from "@heroicons/react/24/solid";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Error caught by boundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-neo-bg text-neo-text flex items-center justify-center p-8">
          <main className="flex flex-col items-center justify-center bg-white border-brutal shadow-brutal-lg p-10 max-w-lg text-center">
            <div className="text-6xl mb-6 bg-neo-red border-brutal p-4 inline-block shadow-brutal-sm rotate-3">
              <ExclamationTriangleIcon className="w-16 h-16 text-white" />
            </div>
            <div className="text-2xl font-black uppercase tracking-wider mb-2">
              Terjadi Kesalahan
            </div>
            <p className="font-bold border-2 border-dashed border-neo-border p-3 mb-6 bg-gray-100">
              Mohon refresh halaman atau coba lagi nanti.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-neo-yellow hover:bg-[#FFE833] border-brutal shadow-brutal active:active-brutal transition-all px-8 py-4 font-black text-xl uppercase tracking-wider w-full"
            >
              Refresh Halaman
            </button>
          </main>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

