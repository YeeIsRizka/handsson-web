import useSpelling from "../../gameplay/hooks/useSpelling";
import { getRandomLocalWord } from "../../gameplay/utils/localWords";

function useTraining() {
  const {
    gameplayState,
    progressState,
    handleGestureDetected,
    loadNextWord,
  } = useSpelling({
    getNextWord: getRandomLocalWord,
  });

  return {
    gameplayState,
    progressState,
    handleGestureDetected,
    loadNextWord,
  };
}

export default useTraining;
