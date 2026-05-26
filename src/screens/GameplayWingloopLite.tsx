import type { RefObject } from "react";
import type { WingLoopSnapshot } from "../game/game-runtime";
import { WINGLOOP_WORLD } from "../game/game-runtime";

export type GameplayWingloopLiteActions = {
  openSettings: () => void;
  primaryAction: () => void;
  pauseOrResume: () => void;
  restart: () => void;
  flap: () => void;
  closeSettings: () => void;
  updateSensitivity: (value: number) => void;
  toggleMusic: () => void;
  toggleSfx: () => void;
  togglePreferences: () => void;
  resetDefaults: () => void;
  resumeGame: () => void;
  abandonRun: () => void;
};

export type GameplayWingloopLiteProps = {
  canvasRef: RefObject<HTMLCanvasElement | null>;
  snapshot: WingLoopSnapshot;
  settingsOpen: boolean;
  canUseGameplayInput: boolean;
  actions: GameplayWingloopLiteActions;
};

export function GameplayWingloopLite({
  canvasRef,
  snapshot,
  settingsOpen,
  canUseGameplayInput,
  actions,
}: GameplayWingloopLiteProps) {
  const statusText =
    snapshot.phase === "ready"
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
          <span>
            Score <strong>{snapshot.score}</strong>
          </span>
          <span>
            Best <strong>{snapshot.bestScore}</strong>
          </span>
          <span>
            Ramp <strong>{snapshot.difficulty.toFixed(1)}</strong>
          </span>
        </div>
      </section>

      <canvas
        ref={canvasRef}
        className="game"
        width={WINGLOOP_WORLD.width}
        height={WINGLOOP_WORLD.height}
        aria-label="WingLoop Lite canvas game"
        aria-disabled={!canUseGameplayInput}
        onPointerDown={actions.flap}
      />

      <section className="controls" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(132px, 1fr))" }} aria-label="Game controls">
        <button onClick={actions.openSettings}>Settings</button>
        <button onClick={actions.primaryAction} disabled={snapshot.phase !== "ready" && !canUseGameplayInput}>
          {snapshot.phase === "ready" ? "Start" : "Flap"}
        </button>
        <button
          onClick={actions.pauseOrResume}
          disabled={snapshot.phase === "ready" || snapshot.phase === "gameover" || snapshot.phase === "abandoned"}
        >
          {snapshot.phase === "paused" ? "Resume Flight" : "Pause"}
        </button>
        <button onClick={actions.restart}>Restart Loop</button>
      </section>

      {settingsOpen && (
        <section className="settings-panel" aria-label="Game Settings - WingLoop Lite">
          <div className="settings-card">
            <button className="close-button" onClick={actions.closeSettings} aria-label="Close settings">
              Close settings
            </button>
            <h2>Game Settings</h2>
            <label>
              Sensitivity
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={snapshot.settings.sensitivity}
                onChange={(event) => actions.updateSensitivity(Number(event.target.value))}
              />
            </label>
            <div className="settings-actions">
              <button onClick={actions.toggleMusic}>MUSIC {snapshot.settings.music ? "ON" : "OFF"}</button>
              <button onClick={actions.toggleSfx}>SFX {snapshot.settings.sfx ? "ON" : "OFF"}</button>
              <button onClick={actions.togglePreferences}>PREFERENCES</button>
              <button onClick={actions.resetDefaults}>RESET DEFAULTS</button>
              <button onClick={actions.resumeGame}>RESUME GAME</button>
              <button onClick={actions.abandonRun}>Abandon Run</button>
            </div>
          </div>
        </section>
      )}
    </main>
  );
}

export default GameplayWingloopLite;
