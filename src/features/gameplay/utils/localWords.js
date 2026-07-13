export const buildWord = (id, word) => ({
  id,
  word,
});

const LOCAL_WORDS = [
  buildWord("local-1", "BENCI"),
  buildWord("local-2", "DAUN"),
  buildWord("local-3", "FOTO"),
  buildWord("local-4", "GAYA"),
  buildWord("local-5", "IQRA"),
  buildWord("local-6", "KAPAL"),
  buildWord("local-7", "VIRUS"),
  buildWord("local-8", "WAJAH"),
  buildWord("local-9", "XENON"),
  buildWord("local-10", "ZAMAN"),
];

// Track which words have been used in the current cycle
let usedIndices = new Set();

export const getRandomLocalWord = (currentWordId) => {
  if (LOCAL_WORDS.length === 0) {
    return buildWord("local-fallback", "KATA");
  }

  if (LOCAL_WORDS.length === 1) {
    return LOCAL_WORDS[0];
  }

  // If all words have been used, reset the cycle
  if (usedIndices.size >= LOCAL_WORDS.length) {
    usedIndices = new Set();
  }

  // Build list of available indices (not yet used in this cycle)
  const availableIndices = [];
  for (let i = 0; i < LOCAL_WORDS.length; i++) {
    if (!usedIndices.has(i)) {
      availableIndices.push(i);
    }
  }

  // Filter out the current word to avoid immediate repeat (especially after reset)
  let candidates = availableIndices;
  if (currentWordId) {
    const filtered = availableIndices.filter(
      (i) => LOCAL_WORDS[i].id !== currentWordId
    );
    // Only use filtered if it's not empty (edge case: only 1 word left and it's the current one)
    if (filtered.length > 0) {
      candidates = filtered;
    }
  }

  // Pick a random word from candidates
  const randomIndex = candidates[Math.floor(Math.random() * candidates.length)];
  usedIndices.add(randomIndex);

  return LOCAL_WORDS[randomIndex];
};

export const resetWordCycle = () => {
  usedIndices = new Set();
};