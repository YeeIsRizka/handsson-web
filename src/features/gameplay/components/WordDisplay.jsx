import React from "react";

function WordDisplay({
  letters,
  currentIndex,
  animatingLetterIndex,
  isTransitioning = false,
}) {
  return (
    <div className="flex gap-2 text-4xl md:text-5xl font-black tracking-widest px-2 flex-wrap">
      {letters.map((char, index) => (
        <div
          key={index}
          className={`flex items-center justify-center w-12 h-14 md:w-16 md:h-20 border-brutal transition-all duration-300 transform
            ${
              index === currentIndex
                ? "bg-neo-yellow text-neo-text shadow-[4px_4px_0px_0px_#000] -translate-y-2"
                : index < currentIndex
                ? "bg-neo-green text-neo-text shadow-[2px_2px_0px_0px_#000] translate-y-1 opacity-80"
                : "bg-white text-neo-text shadow-[4px_4px_0px_0px_#000]"
            }
            ${
              animatingLetterIndex === index
                ? "scale-110 bg-neo-purple text-white"
                : "scale-100"
            }
            ${isTransitioning ? "opacity-30 scale-95" : ""}
          `}
        >
          {char}
        </div>
      ))}
    </div>
  );
}

export default WordDisplay;
