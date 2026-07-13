import React from "react";

function HintPanel({ isLoading, currentLetter, currentHint }) {
  const hintLetter = currentHint?.letter || currentLetter || "?";
  const hintDescription =
    currentHint?.description || (hintLetter ? `Huruf ${hintLetter}` : "");
  const hasImage = Boolean(currentHint?.image_url);

  return (
    <div className="flex flex-col justify-center items-center rounded-xl h-full">
      {isLoading ? (
        <div className="flex flex-col items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-300 mb-4"></div>
          <p>Memuat petunjuk...</p>
        </div>
      ) : currentHint ? (
        <>
          <div className="w-96 h-96 bg-white border-brutal shadow-brutal flex items-center justify-center p-4 mb-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 bg-neo-yellow border-b-brutal border-r-brutal px-3 py-1 font-black text-sm uppercase">HINT</div>
            {hasImage ? (
              <img
                src={currentHint.image_url}
                alt={currentHint.description || "Petunjuk"}
                className="w-full h-full object-contain filter drop-shadow-md p-4 mt-4"
              />
            ) : (
              <div className="text-[12rem] font-black text-neo-text">
                {hintLetter}
              </div>
            )}
          </div>

          <div className="bg-white text-neo-text border-brutal shadow-brutal px-6 py-3 max-w-sm">
            <p className="text-2xl font-black text-center uppercase tracking-wider">{hintDescription}</p>
          </div>
        </>
      ) : (
        <p>Petunjuk tidak tersedia</p>
      )}
    </div>
  );
}

export default HintPanel;
