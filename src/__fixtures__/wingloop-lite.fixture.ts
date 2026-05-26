import { createWingLoopStore } from "../features/wingloop-lite/wingloop-lite.store";
import { createMemoryWingLoopRepo } from "../features/wingloop-lite/wingloop-lite.repo";

export const wingLoopLiteFixture = () => {
  const randomValues = [0.45, 0.62, 0.36, 0.54];
  let randomIndex = 0;

  return createWingLoopStore({
    repo: createMemoryWingLoopRepo(7),
    random: () => {
      const value = randomValues[randomIndex % randomValues.length];
      randomIndex += 1;
      return value;
    },
  });
};
