const ROUND_DURATION = 30;

/**
 * Damage dealt by the first player to complete the word.
 * Formula: (word_length × 5) + (time_remaining × 5)
 */
export function calculateDamage(wordLength, finishTime, roundDuration = ROUND_DURATION) {
  const timeRemaining = Math.floor(Math.max(roundDuration - finishTime, 0));
  return (wordLength * 5) + (timeRemaining * 5);
}

/**
 * Defend (damage reduction) for players who finished but not first.
 * Formula: (word_length × 5) + (time_remaining × 5)
 */
export function calculateDefend(wordLength, finishTime, roundDuration = ROUND_DURATION) {
  const timeRemaining = Math.floor(Math.max(roundDuration - finishTime, 0));
  return (wordLength * 5) + (timeRemaining * 5);
}

/**
 * Calculate round results:
 * - First player to finish = attacker, deals damage to all opponents.
 * - Other players who finished = defenders, reduce incoming damage.
 * - Players who didn't finish = take full damage.
 *
 * @param {Array} players - List of active players (not eliminated).
 * @param {Array} finishResults - [{ playerId, finishTime }] sorted by finishTime.
 * @param {number} wordLength - Word length for this round.
 * @returns {{ updatedPlayers, roundSummary }}
 */
export function applyRoundResults(players, finishResults, wordLength) {

  const sorted = [...finishResults].sort((a, b) => a.finishTime - b.finishTime);

  const attackerId = sorted.length > 0 ? sorted[0].playerId : null;
  const attackerFinishTime = sorted.length > 0 ? sorted[0].finishTime : null;


  const damage = attackerId !== null
    ? calculateDamage(wordLength, attackerFinishTime)
    : 0;


  const finishMap = new Map();
  finishResults.forEach((r) => finishMap.set(r.playerId, r.finishTime));


  const roundSummary = [];

  const updatedPlayers = players.map((player) => {
    if (player.isEliminated) return player;


    if (player.id === attackerId) {
      roundSummary.push({
        playerId: player.id,
        playerName: player.name,
        role: "attacker",
        damage: 0,
        defend: 0,
        damageDealt: damage,
        finishTime: attackerFinishTime,
        hpBefore: player.hp,
        hpAfter: player.hp,
      });
      return player;
    }

    const playerFinishTime = finishMap.get(player.id);
    let actualDamage = damage;
    let defend = 0;

    if (playerFinishTime !== undefined) {

      defend = calculateDefend(wordLength, playerFinishTime);
      actualDamage = Math.max(damage - defend, 0);
    }


    const newHp = Math.max(player.hp - actualDamage, 0);

    roundSummary.push({
      playerId: player.id,
      playerName: player.name,
      role: playerFinishTime !== undefined ? "defender" : "failed",
      damage: actualDamage,
      defend,
      damageDealt: 0,
      finishTime: playerFinishTime ?? null,
      hpBefore: player.hp,
      hpAfter: newHp,
    });

    return {
      ...player,
      hp: newHp,
      isEliminated: newHp <= 0,
    };
  });

  return { updatedPlayers, roundSummary };
}

export { ROUND_DURATION };
