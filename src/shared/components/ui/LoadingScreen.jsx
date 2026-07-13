import React from 'react';
import { ArrowPathIcon } from '@heroicons/react/24/solid';

function LoadingScreen({ isVisible, message = "Memuat..." }) {
  if (!isVisible) return null;
  return (
    <div className="fixed inset-0 z-[9999] bg-neo-purple flex flex-col items-center justify-center animate-fade-in">
      <div className="bg-white border-brutal shadow-brutal-lg p-10 flex flex-col items-center max-w-[80vw] mx-auto group hover:-translate-y-2 transition-transform">
        <ArrowPathIcon className="w-20 h-20 text-neo-blue animate-spin mb-6" />
        <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-widest text-neo-text text-center">
          {message}
        </h2>
      </div>
    </div>
  );
}

export default LoadingScreen;
