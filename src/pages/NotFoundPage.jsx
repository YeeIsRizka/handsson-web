import React from "react";
import { Link } from "react-router-dom";
import { routes } from "../shared/constants/routes";

function NotFoundPage() {
  return (
    <main className="min-h-screen bg-neo-blue text-neo-text flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Decorative background elements*/}
      <div className="absolute top-10 left-10 w-24 h-24 bg-neo-yellow border-brutal rotate-12 shadow-[4px_4px_0px_0px_#000]" />
      <div className="absolute bottom-20 right-10 w-32 h-32 bg-neo-purple border-brutal -rotate-6 shadow-[4px_4px_0px_0px_#000]" />
      <div className="absolute top-1/4 right-1/4 w-12 h-12 bg-neo-green border-brutal rotate-45 shadow-[4px_4px_0px_0px_#000]" />

      <div className="relative z-10 flex flex-col items-center bg-white border-brutal p-10 md:p-16 shadow-brutal-lg text-center max-w-4xl w-full animate-fade-in -rotate-1">
        <h1
          className="text-[10rem] sm:text-[15rem] md:text-[20rem] leading-[0.8] font-black text-neo-yellow mb-8"
          style={{ textShadow: "8px 8px 0px #000" }}
        >
          404
        </h1>
        <h2 className="text-2xl md:text-3xl font-black text-neo-text uppercase mb-4 tracking-wide bg-neo-purple border-brutal px-4 py-2 shadow-[2px_2px_0px_0px_#000]">
          Halaman Tidak Ditemukan
        </h2>
        <p className="text-neo-text font-bold mb-10 text-lg border-2 border-dashed border-neo-border p-3 bg-gray-100">
          Maaf, halaman yang Anda cari tidak tersedia atau telah dipindahkan.
        </p>

        <Link
          to={routes.mainMenu}
          className="px-8 py-4 bg-neo-green text-black border-brutal shadow-brutal font-black text-xl uppercase transition-all duration-300 flex items-center justify-center gap-3 w-full sm:w-auto hover:-translate-y-1 hover:-translate-x-1 active:translate-y-1 active:translate-x-1 active:shadow-none"
          style={{ color: "black" }}
        >
          Menu Utama
        </Link>
      </div>
    </main>
  );
}

export default NotFoundPage;
