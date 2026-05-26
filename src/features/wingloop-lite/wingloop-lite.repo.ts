export type WingLoopRepo = {
  loadBestScore: () => number;
  saveBestScore: (score: number) => void;
};

const BEST_SCORE_KEY = "wingloop-best";

export const createMemoryWingLoopRepo = (initialBestScore = 0): WingLoopRepo => {
  let bestScore = initialBestScore;
  return {
    loadBestScore: () => bestScore,
    saveBestScore: (score) => {
      bestScore = Math.max(bestScore, score);
    },
  };
};

export const createLocalWingLoopRepo = (storage: Storage | undefined): WingLoopRepo => {
  if (!storage) {
    return createMemoryWingLoopRepo();
  }

  return {
    loadBestScore: () => Number(storage.getItem(BEST_SCORE_KEY) ?? 0),
    saveBestScore: (score) => {
      storage.setItem(BEST_SCORE_KEY, String(score));
    },
  };
};
