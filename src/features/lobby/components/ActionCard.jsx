import React from "react";

export default function ActionCard({ 
  icon, 
  label, 
  onClick, 
  hoverClasses = "hover:bg-neo-yellow hover:text-neo-text",
  children 
}) {
  return (
    <button
      onClick={onClick}
      className={`relative group flex flex-col items-center justify-center w-full sm:w-32 h-40 bg-white border-brutal border-dashed hover:border-solid ${hoverClasses} shadow-brutal hover:-translate-y-1 transition-all overflow-hidden`}
    >
      <div className="w-12 h-12 bg-white border-brutal text-neo-text flex items-center justify-center text-2xl mb-3 font-black">
        {icon}
      </div>
      <span className="text-xs font-black uppercase tracking-wider">{label}</span>
      {children}
    </button>
  );
}
