import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import GameplayWingloopLite from "./screens/GameplayWingloopLite";
import { actPauseGame } from "./features/surf-gameplay/act_pause_game";
import { actRestartGame } from "./features/surf-gameplay/act_restart_game";
import { actStartGame } from "./features/surf-gameplay/act_start_game";
import { createLocalWingLoopRepo } from "./features/wingloop-lite/wingloop-lite.repo";
import { createWingLoopStore } from "./features/wingloop-lite/wingloop-lite.store";
import { WINGLOOP_WORLD, type WingLoopSnapshot } from "./game/game-runtime";
import { installWingLoopTestBridge } from "./test/bridge";
import "./index.css";

const initialSnapshot = (bestScore = 0): WingLoopSnapshot => ({
  phase: "ready",
  score: 0,
  bestScore,
  difficulty: 0,
  birdY: Math.round(WINGLOOP_WORLD.height * 0.45),
  velocity: 0,
  pipes: [],
  pipeCount: 0,
  settings: {
    music: true,
    sfx: true,
    sensitivity: 0.72,
    assistMode: false,
  },
  lastEvent: "idle",
});

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const lastTimeRef = useRef(0);
  const canUseBrowser = typeof window !== "undefined";
  const [settingsOpen, setSettingsOpen] = useState(() =>
    typeof window === "undefined" ? false : window.location.pathname === "/settings",
  );
  const store = useMemo(
    () => createWingLoopStore({ repo: createLocalWingLoopRepo(typeof window === "undefined" ? undefined : window.localStorage) }),
    [],
  );
  const [snapshot, setSnapshot] = useState(() => initialSnapshot(store.getSnapshot().bestScore));

  useEffect(() => store.subscribe(setSnapshot), [store]);

  useEffect(() => installWingLoopTestBridge(store), [store]);

  useEffect(() => {
    if (!canUseBrowser) return;

    const handlePopState = () => setSettingsOpen(window.location.pathname === "/settings");

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [canUseBrowser]);

  const showSettings = useCallback(() => {
    setSettingsOpen(true);
    if (canUseBrowser && window.location.pathname !== "/settings") {
      window.history.pushState({}, "", "/settings");
    }
  }, [canUseBrowser]);

  const hideSettings = useCallback(() => {
    setSettingsOpen(false);
    if (canUseBrowser && window.location.pathname === "/settings") {
      window.history.pushState({}, "", "/");
    }
  }, [canUseBrowser]);

  const draw = useCallback((ctx: CanvasRenderingContext2D, frame: WingLoopSnapshot) => {
    const gradient = ctx.createLinearGradient(0, 0, 0, WINGLOOP_WORLD.height);
    gradient.addColorStop(0, "#101a35");
    gradient.addColorStop(0.58, "#0b1326");
    gradient.addColorStop(1, "#050a18");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, WINGLOOP_WORLD.width, WINGLOOP_WORLD.height);

    ctx.strokeStyle = "rgba(125, 244, 255, 0.12)";
    ctx.lineWidth = 1;
    for (let x = 0; x < WINGLOOP_WORLD.width; x += 48) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x - 140, WINGLOOP_WORLD.height);
      ctx.stroke();
    }

    const gap = Math.max(frame.settings.assistMode ? 162 : 138, (frame.settings.assistMode ? 214 : 190) - frame.difficulty * 7);
    frame.pipes.forEach((pipe) => {
      const topBottom = pipe.gapY - gap / 2;
      const bottomTop = pipe.gapY + gap / 2;
      const pipeGradient = ctx.createLinearGradient(pipe.x, 0, pipe.x + WINGLOOP_WORLD.pipeWidth, 0);
      pipeGradient.addColorStop(0, "#2ff801");
      pipeGradient.addColorStop(0.48, "#79ff5b");
      pipeGradient.addColorStop(1, "#0f6d00");
      ctx.fillStyle = pipeGradient;
      ctx.fillRect(pipe.x, 0, WINGLOOP_WORLD.pipeWidth, topBottom);
      ctx.fillRect(pipe.x, bottomTop, WINGLOOP_WORLD.pipeWidth, WINGLOOP_WORLD.height - bottomTop);
      ctx.fillStyle = "rgba(219, 252, 255, 0.24)";
      ctx.fillRect(pipe.x + 10, 0, 8, topBottom);
      ctx.fillRect(pipe.x + 10, bottomTop, 8, WINGLOOP_WORLD.height - bottomTop);
    });

    ctx.fillStyle = "#00f0ff";
    ctx.beginPath();
    ctx.arc(WINGLOOP_WORLD.birdX, frame.birdY, WINGLOOP_WORLD.birdRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#fff4f0";
    ctx.beginPath();
    ctx.arc(WINGLOOP_WORLD.birdX + 7, frame.birdY - 5, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#ffb59c";
    ctx.beginPath();
    ctx.moveTo(WINGLOOP_WORLD.birdX + 17, frame.birdY);
    ctx.lineTo(WINGLOOP_WORLD.birdX + 35, frame.birdY + 8);
    ctx.lineTo(WINGLOOP_WORLD.birdX + 17, frame.birdY + 14);
    ctx.closePath();
    ctx.fill();
  }, []);

  useEffect(() => {
    if (!canUseBrowser || typeof requestAnimationFrame === "undefined") return;

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!ctx) return;

    let frameId = 0;
    const tick = (time: number) => {
      const dt = (time - lastTimeRef.current) / 1000 || 0;
      lastTimeRef.current = time;
      const next = store.actions.tick(dt);
      draw(ctx, next);
      frameId = requestAnimationFrame(tick);
    };

    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [canUseBrowser, draw, store]);

  const canUseGameplayInput = snapshot.phase === "playing";
  const flap = useCallback(() => {
    if (canUseGameplayInput) {
      store.actions.flap();
    }
  }, [canUseGameplayInput, store]);
  const primaryAction = useCallback(() => {
    if (snapshot.phase === "ready") {
      actStartGame(store);
      return;
    }
    flap();
  }, [flap, snapshot.phase, store]);
  const pauseOrResume = useCallback(() => actPauseGame(store), [store]);

  useEffect(() => {
    if (!canUseBrowser) return;

    const handleKey = (event: KeyboardEvent) => {
      if (event.code === "Space") {
        event.preventDefault();
        flap();
      }
      if (event.code === "KeyP") {
        pauseOrResume();
      }
      if (event.code === "Escape") {
        if (settingsOpen) {
          hideSettings();
        } else {
          showSettings();
        }
      }
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [canUseBrowser, flap, hideSettings, pauseOrResume, settingsOpen, showSettings]);

  return (
    <GameplayWingloopLite
      canvasRef={canvasRef}
      snapshot={snapshot}
      settingsOpen={settingsOpen}
      canUseGameplayInput={canUseGameplayInput}
      actions={{
        openSettings: showSettings,
        primaryAction,
        pauseOrResume,
        restart: () => actRestartGame(store),
        flap,
        closeSettings: hideSettings,
        updateSensitivity: (sensitivity) => store.actions.updateSettings({ sensitivity }),
        toggleMusic: () => store.actions.updateSettings({ music: !snapshot.settings.music }),
        toggleSfx: () => store.actions.updateSettings({ sfx: !snapshot.settings.sfx }),
        togglePreferences: () => store.actions.updateSettings({ assistMode: !snapshot.settings.assistMode }),
        resetDefaults: store.actions.resetSettings,
        resumeGame: () => {
          store.actions.resume();
          hideSettings();
        },
        abandonRun: () => {
          store.actions.abandon();
          hideSettings();
        },
      }}
    />
  );
}
