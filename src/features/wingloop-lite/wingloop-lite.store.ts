import {
  createWingLoopRuntime,
  type WingLoopSettings,
  type WingLoopSnapshot,
  type WingLoopRuntime,
  type WingLoopRuntimeOptions,
} from "../../game/game-runtime";
import { createMemoryWingLoopRepo, type WingLoopRepo } from "./wingloop-lite.repo";

export type WingLoopActions = {
  start: () => WingLoopSnapshot;
  flap: () => WingLoopSnapshot;
  pause: () => WingLoopSnapshot;
  resume: () => WingLoopSnapshot;
  restart: () => WingLoopSnapshot;
  abandon: () => WingLoopSnapshot;
  tick: (seconds: number) => WingLoopSnapshot;
  updateSettings: (settings: Partial<WingLoopSettings>) => WingLoopSnapshot;
  resetSettings: () => WingLoopSnapshot;
};

export type WingLoopStore = {
  getSnapshot: () => WingLoopSnapshot;
  subscribe: (listener: (snapshot: WingLoopSnapshot) => void) => () => void;
  actions: WingLoopActions;
};

export type WingLoopStoreOptions = WingLoopRuntimeOptions & {
  repo?: WingLoopRepo;
  runtime?: WingLoopRuntime;
};

export const createWingLoopStore = (options: WingLoopStoreOptions = {}): WingLoopStore => {
  const repo = options.repo ?? createMemoryWingLoopRepo(options.bestScore);
  const runtime = options.runtime ?? createWingLoopRuntime({ ...options, bestScore: repo.loadBestScore() });
  const listeners = new Set<(snapshot: WingLoopSnapshot) => void>();

  const emit = (snapshot: WingLoopSnapshot) => {
    if (snapshot.bestScore >= repo.loadBestScore()) {
      repo.saveBestScore(snapshot.bestScore);
    }
    listeners.forEach((listener) => listener(snapshot));
    return snapshot;
  };

  const actions: WingLoopActions = {
    start: () => emit(runtime.start()),
    flap: () => emit(runtime.flap()),
    pause: () => emit(runtime.pause()),
    resume: () => emit(runtime.resume()),
    restart: () => emit(runtime.restart()),
    abandon: () => emit(runtime.abandon()),
    tick: (seconds) => emit(runtime.tick(seconds)),
    updateSettings: (settings) => emit(runtime.updateSettings(settings)),
    resetSettings: () => emit(runtime.resetSettings()),
  };

  return {
    getSnapshot: () => runtime.getSnapshot(),
    subscribe: (listener) => {
      listeners.add(listener);
      listener(runtime.getSnapshot());
      return () => listeners.delete(listener);
    },
    actions,
  };
};
