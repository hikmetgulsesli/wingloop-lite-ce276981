import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
  const [settingsOpen, setSettingsOpen] = useState(false);
  const store = useMemo(
    () => createWingLoopStore({ repo: createLocalWingLoopRepo(typeof window === "undefined" ? undefined : window.localStorage) }),
    [],
  );
  const [snapshot, setSnapshot] = useState(() => initialSnapshot(store.getSnapshot().bestScore));

  useEffect(() => store.subscribe(setSnapshot), [store]);

  useEffect(() => installWingLoopTestBridge(store), [store]);

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
  }, [draw, store]);

  const flap = useCallback(() => store.actions.flap(), [store]);
  const pauseOrResume = useCallback(() => {
    snapshot.phase === "paused" ? store.actions.resume() : store.actions.pause();
  }, [snapshot.phase, store]);

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (event.code === "Space") {
        event.preventDefault();
        flap();
      }
      if (event.code === "KeyP") {
        pauseOrResume();
      }
      if (event.code === "Escape") {
        setSettingsOpen((open) => !open);
      }
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [flap, pauseOrResume]);

  const statusText = snapshot.phase === "ready"
    ? "Ready"
    : snapshot.phase === "playing"
      ? "Flying"
      : snapshot.phase === "paused"
        ? "Paused"
        : snapshot.phase === "abandoned"
          ? "Run Abandoned"
          : "Game Over";

  return (
    <main className="shell">
      <section className="scorebar" aria-label="Game status">
        <div>
          <span className="eyebrow">WingLoop Lite</span>
          <h1>{statusText}</h1>
        </div>
        <div className="scores">
          <span>Score <strong>{snapshot.score}</strong></span>
          <span>Best <strong>{snapshot.bestScore}</strong></span>
          <span>Ramp <strong>{snapshot.difficulty.toFixed(1)}</strong></span>
        </div>
      </section>

      <canvas
        ref={canvasRef}
        className="game"
        width={WINGLOOP_WORLD.width}
        height={WINGLOOP_WORLD.height}
        aria-label="WingLoop Lite canvas game"
        onPointerDown={flap}
      />

      <section className="controls" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(132px, 1fr))" }} aria-label="Game controls">
        <button onClick={() => setSettingsOpen(true)}>Settings</button>
        <button onClick={flap}>{snapshot.phase === "ready" ? "Start" : "Flap"}</button>
        <button onClick={pauseOrResume} disabled={snapshot.phase === "ready" || snapshot.phase === "gameover" || snapshot.phase === "abandoned"}>
          {snapshot.phase === "paused" ? "Resume Flight" : "Pause"}
        </button>
        <button onClick={store.actions.restart}>Restart Loop</button>
      </section>

      {settingsOpen && (
        <section className="settings-panel" aria-label="Game Settings - WingLoop Lite">
          <div className="settings-card">
            <button className="close-button" onClick={() => setSettingsOpen(false)} aria-label="Close settings">Close settings</button>
            <h2>Game Settings</h2>
            <label>
              Sensitivity
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={snapshot.settings.sensitivity}
                onChange={(event) => store.actions.updateSettings({ sensitivity: Number(event.target.value) })}
              />
            </label>
            <div className="settings-actions">
              <button onClick={() => store.actions.updateSettings({ music: !snapshot.settings.music })}>
                MUSIC {snapshot.settings.music ? "ON" : "OFF"}
              </button>
              <button onClick={() => store.actions.updateSettings({ sfx: !snapshot.settings.sfx })}>
                SFX {snapshot.settings.sfx ? "ON" : "OFF"}
              </button>
              <button onClick={() => store.actions.updateSettings({ assistMode: !snapshot.settings.assistMode })}>
                PREFERENCES
              </button>
              <button onClick={store.actions.resetSettings}>RESET DEFAULTS</button>
              <button onClick={() => { store.actions.resume(); setSettingsOpen(false); }}>RESUME GAME</button>
              <button onClick={() => { store.actions.abandon(); setSettingsOpen(false); }}>Abandon Run</button>
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
