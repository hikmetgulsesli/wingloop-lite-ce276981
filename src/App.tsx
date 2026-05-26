import { useCallback, useEffect, useRef, useState } from "react";

type Phase = "ready" | "playing" | "paused" | "gameover";

type Pipe = {
  x: number;
  gapY: number;
  scored: boolean;
};

type GameSnapshot = {
  phase: Phase;
  score: number;
  bestScore: number;
  difficulty: number;
  birdY: number;
  velocity: number;
  pipeCount: number;
};

declare global {
  interface Window {
    app: GameSnapshot & {
      flap: () => void;
      start: () => void;
      pause: () => void;
      resume: () => void;
      restart: () => void;
    };
  }
}

const WIDTH = 960;
const HEIGHT = 540;
const BIRD_X = 220;
const BIRD_RADIUS = 18;
const GRAVITY = 1500;
const FLAP = -470;
const PIPE_WIDTH = 86;
const PIPE_INTERVAL = 1.55;
const START_BEST = Number(localStorage.getItem("wingloop-best") ?? 0);

const makePipe = (x: number, difficulty: number): Pipe => {
  const gap = Math.max(138, 190 - difficulty * 7);
  const margin = gap / 2 + 54;
  return {
    x,
    gapY: margin + Math.random() * (HEIGHT - margin * 2),
    scored: false,
  };
};

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const phaseRef = useRef<Phase>("ready");
  const birdYRef = useRef(HEIGHT * 0.45);
  const velocityRef = useRef(0);
  const pipesRef = useRef<Pipe[]>([makePipe(WIDTH + 90, 0)]);
  const spawnRef = useRef(0);
  const scoreRef = useRef(0);
  const bestRef = useRef(START_BEST);
  const difficultyRef = useRef(0);
  const lastTimeRef = useRef(0);
  const [snapshot, setSnapshot] = useState<GameSnapshot>({
    phase: "ready",
    score: 0,
    bestScore: START_BEST,
    difficulty: 0,
    birdY: birdYRef.current,
    velocity: 0,
    pipeCount: 1,
  });

  const publish = useCallback(() => {
    const next: GameSnapshot = {
      phase: phaseRef.current,
      score: scoreRef.current,
      bestScore: bestRef.current,
      difficulty: difficultyRef.current,
      birdY: Math.round(birdYRef.current),
      velocity: Math.round(velocityRef.current),
      pipeCount: pipesRef.current.length,
    };

    window.app = {
      ...next,
      flap,
      start,
      pause,
      resume,
      restart,
    };
    setSnapshot(next);
  }, []);

  const resetRun = useCallback(() => {
    birdYRef.current = HEIGHT * 0.45;
    velocityRef.current = 0;
    scoreRef.current = 0;
    difficultyRef.current = 0;
    spawnRef.current = 0;
    pipesRef.current = [makePipe(WIDTH + 90, 0)];
  }, []);

  const start = useCallback(() => {
    resetRun();
    phaseRef.current = "playing";
    publish();
  }, [publish, resetRun]);

  const restart = useCallback(() => {
    resetRun();
    phaseRef.current = "playing";
    publish();
  }, [publish, resetRun]);

  const pause = useCallback(() => {
    if (phaseRef.current === "playing") {
      phaseRef.current = "paused";
      publish();
    }
  }, [publish]);

  const resume = useCallback(() => {
    if (phaseRef.current === "paused") {
      phaseRef.current = "playing";
      publish();
    }
  }, [publish]);

  const flap = useCallback(() => {
    if (phaseRef.current === "ready" || phaseRef.current === "gameover") {
      start();
    }
    if (phaseRef.current === "paused") {
      resume();
    }
    velocityRef.current = FLAP;
    publish();
  }, [publish, resume, start]);

  const endRun = useCallback(() => {
    phaseRef.current = "gameover";
    bestRef.current = Math.max(bestRef.current, scoreRef.current);
    localStorage.setItem("wingloop-best", String(bestRef.current));
    publish();
  }, [publish]);

  const draw = useCallback((ctx: CanvasRenderingContext2D) => {
    const gradient = ctx.createLinearGradient(0, 0, 0, HEIGHT);
    gradient.addColorStop(0, "#101a35");
    gradient.addColorStop(0.58, "#0b1326");
    gradient.addColorStop(1, "#050a18");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    ctx.strokeStyle = "rgba(125, 244, 255, 0.12)";
    ctx.lineWidth = 1;
    for (let x = 0; x < WIDTH; x += 48) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x - 140, HEIGHT);
      ctx.stroke();
    }

    const gap = Math.max(138, 190 - difficultyRef.current * 7);
    pipesRef.current.forEach((pipe) => {
      const topBottom = pipe.gapY - gap / 2;
      const bottomTop = pipe.gapY + gap / 2;
      const pipeGradient = ctx.createLinearGradient(pipe.x, 0, pipe.x + PIPE_WIDTH, 0);
      pipeGradient.addColorStop(0, "#2ff801");
      pipeGradient.addColorStop(0.48, "#79ff5b");
      pipeGradient.addColorStop(1, "#0f6d00");
      ctx.fillStyle = pipeGradient;
      ctx.fillRect(pipe.x, 0, PIPE_WIDTH, topBottom);
      ctx.fillRect(pipe.x, bottomTop, PIPE_WIDTH, HEIGHT - bottomTop);
      ctx.fillStyle = "rgba(219, 252, 255, 0.24)";
      ctx.fillRect(pipe.x + 10, 0, 8, topBottom);
      ctx.fillRect(pipe.x + 10, bottomTop, 8, HEIGHT - bottomTop);
    });

    ctx.fillStyle = "#00f0ff";
    ctx.beginPath();
    ctx.arc(BIRD_X, birdYRef.current, BIRD_RADIUS, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#fff4f0";
    ctx.beginPath();
    ctx.arc(BIRD_X + 7, birdYRef.current - 5, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#ffb59c";
    ctx.beginPath();
    ctx.moveTo(BIRD_X + 17, birdYRef.current);
    ctx.lineTo(BIRD_X + 35, birdYRef.current + 8);
    ctx.lineTo(BIRD_X + 17, birdYRef.current + 14);
    ctx.closePath();
    ctx.fill();
  }, []);

  useEffect(() => {
    publish();
  }, [publish]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const tick = (time: number) => {
      const dt = Math.min(0.032, (time - lastTimeRef.current) / 1000 || 0);
      lastTimeRef.current = time;

      if (phaseRef.current === "playing") {
        difficultyRef.current = Math.min(12, scoreRef.current * 0.5);
        const speed = 230 + difficultyRef.current * 13;
        velocityRef.current += GRAVITY * dt;
        birdYRef.current += velocityRef.current * dt;
        spawnRef.current += dt;

        if (spawnRef.current > PIPE_INTERVAL) {
          spawnRef.current = 0;
          pipesRef.current.push(makePipe(WIDTH + 80, difficultyRef.current));
        }

        pipesRef.current = pipesRef.current
          .map((pipe) => ({ ...pipe, x: pipe.x - speed * dt }))
          .filter((pipe) => pipe.x + PIPE_WIDTH > -10);

        const gap = Math.max(138, 190 - difficultyRef.current * 7);
        for (const pipe of pipesRef.current) {
          if (!pipe.scored && pipe.x + PIPE_WIDTH < BIRD_X - BIRD_RADIUS) {
            pipe.scored = true;
            scoreRef.current += 1;
          }

          const overlapsX = BIRD_X + BIRD_RADIUS > pipe.x && BIRD_X - BIRD_RADIUS < pipe.x + PIPE_WIDTH;
          const outsideGap = birdYRef.current - BIRD_RADIUS < pipe.gapY - gap / 2 || birdYRef.current + BIRD_RADIUS > pipe.gapY + gap / 2;
          if (overlapsX && outsideGap) {
            endRun();
          }
        }

        if (birdYRef.current < BIRD_RADIUS || birdYRef.current > HEIGHT - BIRD_RADIUS) {
          endRun();
        }
      }

      draw(ctx);
      requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
  }, [draw, endRun]);

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (event.code === "Space") {
        event.preventDefault();
        flap();
      }
      if (event.code === "KeyP") {
        phaseRef.current === "paused" ? resume() : pause();
      }
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [flap, pause, resume]);

  const statusText = snapshot.phase === "ready"
    ? "Ready"
    : snapshot.phase === "playing"
      ? "Flying"
      : snapshot.phase === "paused"
        ? "Paused"
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
        width={WIDTH}
        height={HEIGHT}
        aria-label="WingLoop Lite canvas game"
        onPointerDown={flap}
      />

      <section className="controls" aria-label="Game controls">
        <button onClick={flap}>{snapshot.phase === "ready" ? "Start" : "Flap"}</button>
        <button onClick={snapshot.phase === "paused" ? resume : pause} disabled={snapshot.phase === "ready" || snapshot.phase === "gameover"}>
          {snapshot.phase === "paused" ? "Resume" : "Pause"}
        </button>
        <button onClick={restart}>Restart</button>
      </section>
    </main>
  );
}
