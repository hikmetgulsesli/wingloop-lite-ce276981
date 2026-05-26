import type { WingLoopStore } from "../wingloop-lite/wingloop-lite.store";

export const actPauseGame = (store: WingLoopStore) => {
  const snapshot = store.getSnapshot();
  return snapshot.phase === "paused" ? store.actions.resume() : store.actions.pause();
};
