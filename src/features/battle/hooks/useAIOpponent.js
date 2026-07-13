import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Simulates AI opponents in Battle Mode.
 * Each AI "completes" the word within a random time range.
 * There is a chance the AI will not finish (timeout).
 *
 * @param {Object} options
 * @param {number} options.playerCount - Number of AI opponents.
 * @param {number} options.roundDuration - Round duration in seconds.
 * @param {number} options.wordLength - Current word length.
 * @param {boolean} options.isSpelling - Whether the round is active.
 */
function useAIOpponents({ playerCount = 3, roundDuration = 30, wordLength = 4, isSpelling = false }) {
  const [aiSchedules, setAiSchedules] = useState([]);
  const [expectedFinishCount, setExpectedFinishCount] = useState(0);

  useEffect(() => {
    if (!isSpelling) {
      setAiSchedules([]);
      setExpectedFinishCount(0);
      return;
    }

    let finishCount = 0;
    const schedules = [];

    for (let i = 0; i < playerCount; i++) {
      const aiId = i + 1;
      const baseTime = wordLength * 4.5;
      const minTime = Math.max(baseTime, 15);
      const maxTime = 27;

      // 75% chance of finishing successfully
      const willFinish = Math.random() > 0.25;

      if (willFinish) {
        finishCount++;
        const finishTime = minTime + Math.random() * (maxTime - minTime);
        schedules.push({ playerId: aiId, finishTime });
      }
    }

    setAiSchedules(schedules);
    setExpectedFinishCount(finishCount);
  }, [isSpelling, playerCount, roundDuration, wordLength]);

  const resetAI = useCallback(() => {
    setAiSchedules([]);
    setExpectedFinishCount(0);
  }, []);

  return { aiSchedules, resetAI, expectedFinishCount };
}

export default useAIOpponents;
