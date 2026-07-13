import React, { useEffect, useState } from "react";

function SplashScreen({ onComplete }) {
  const [isSlidingOut, setIsSlidingOut] = useState(false);

  useEffect(() => {
    const holdTimer = setTimeout(() => {
      setIsSlidingOut(true);
    }, 1500);

    const removeTimer = setTimeout(() => {
      onComplete();
    }, 1500 + 800);

    return () => {
      clearTimeout(holdTimer);
      clearTimeout(removeTimer);
    };
  }, [onComplete]);

  return (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-neo-yellow overflow-hidden transition-transform duration-800 ease-in-out ${isSlidingOut ? 'translate-y-full' : 'translate-y-0'}`}
      style={{
        transitionDuration: '800ms'
      }}
    >
      {/* Background Grid Pattern for brutalist theme */}
      <div
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(var(--color-neo-border) 2px, transparent 2px)',
          backgroundSize: '30px 30px'
        }}
      />

      <div className="relative z-10 flex flex-col items-center">
        <img
          src="/assets/logo/logo.png"
          alt="Hands On Logo"
          className="w-32 h-32 md:w-48 md:h-48 object-contain mb-6 drop-shadow-lg"
        />
        <h1 className="text-5xl md:text-7xl font-black text-neo-text tracking-tight uppercase bg-white px-4 py-2 border-brutal shadow-brutal-lg -rotate-2">
          Hands On!
        </h1>
      </div>
    </div>
  );
}

export default SplashScreen;
