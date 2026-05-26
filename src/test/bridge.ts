import type { WingLoopActions, WingLoopStore } from "../features/wingloop-lite/wingloop-lite.store";
import type { WingLoopSnapshot } from "../game/game-runtime";

export type WingLoopTestBridge = WingLoopSnapshot & WingLoopActions & {
  getSnapshot: () => WingLoopSnapshot;
};

declare global {
  interface Window {
    app: WingLoopTestBridge;
  }
}

export const installWingLoopTestBridge = (store: WingLoopStore) => {
  const publish = (snapshot = store.getSnapshot()) => {
    window.app = {
      ...snapshot,
      ...store.actions,
      getSnapshot: store.getSnapshot,
    };
  };

  publish();
  return store.subscribe((snapshot) => publish(snapshot));
};
