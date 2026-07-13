export const calculateRaceWordPoints = (wordData) => {
  if (!wordData?.word) {
    return 0;
  }

  return wordData.word.length * 5;
};