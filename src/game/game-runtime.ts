export type WingLoopPhase = "ready" | "playing" | "paused" | "gameover" | "abandoned";

export type WingLoopPipe = {
  id: number;
  x: number;
  gapY: number;
  scored: boolean;
};

export type WingLoopSettings = {
  music: boolean;
  sfx: boolean;
  sensitivity: number;
  assistMode: boolean;
};

export type WingLoopSnapshot = {
  phase: WingLoopPhase;
  score: number;
  bestScore: number;
  difficulty: number;
  birdY: number;
  velocity: number;
  pipes: WingLoopPipe[];
  pipeCount: number;
  settings: WingLoopSettings;
  lastEvent: "idle" | "flap" | "score" | "collision" | "abandon";
};

export type WingLoopRuntimeOptions = {
  bestScore?: number;
  random?: () => number;
  settings?: Partial<WingLoopSettings>;
};

export const WINGLOOP_WORLD = {
  width: 960,
  height: 540,
  birdX: 220,
  birdRadius: 18,
  gravity: 1500,
  flapVelocity: -470,
  pipeWidth: 86,
  pipeInterval: 1.55,
} as const;

export const DEFAULT_WINGLOOP_SETTINGS: WingLoopSettings = {
  music: true,
  sfx: true,
  sensitivity: 0.72,
  assistMode: false,
};

const pipeGap = (difficulty: number, assistMode: boolean) => {
  const assistBonus = assistMode ? 24 : 0;
  return Math.max(138 + assistBonus, 190 + assistBonus - difficulty * 7);
};

const makePipe = (
  id: number,
  x: number,
  difficulty: number,
  settings: WingLoopSettings,
  random: () => number,
): WingLoopPipe => {
  const gap = pipeGap(difficulty, settings.assistMode);
  const margin = gap / 2 + 54;
  return {
    id,
    x,
    gapY: margin + random() * (WINGLOOP_WORLD.height - margin * 2),
    scored: false,
  };
};

export class WingLoopRuntime {
  private phase: WingLoopPhase = "ready";
  private score = 0;
  private bestScore: number;
  private difficulty = 0;
  private birdY = WINGLOOP_WORLD.height * 0.45;
  private velocity = 0;
  private spawnClock = 0;
  private pipeId = 1;
  private pipes: WingLoopPipe[];
  private settings: WingLoopSettings;
  private lastEvent: WingLoopSnapshot["lastEvent"] = "idle";
  private readonly random: () => number;

  constructor(options: WingLoopRuntimeOptions = {}) {
    this.bestScore = options.bestScore ?? 0;
    this.random = options.random ?? Math.random;
    this.settings = { ...DEFAULT_WINGLOOP_SETTINGS, ...options.settings };
    this.pipes = [this.createPipe(WINGLOOP_WORLD.width + 90)];
  }

  getSnapshot(): WingLoopSnapshot {
    return {
      phase: this.phase,
      score: this.score,
      bestScore: this.bestScore,
      difficulty: this.difficulty,
      birdY: Math.round(this.birdY),
      velocity: Math.round(this.velocity),
      pipes: this.pipes.map((pipe) => ({ ...pipe })),
      pipeCount: this.pipes.length,
      settings: { ...this.settings },
      lastEvent: this.lastEvent,
    };
  }

  start() {
    this.resetRun();
    this.phase = "playing";
    this.lastEvent = "idle";
    return this.getSnapshot();
  }

  restart() {
    return this.start();
  }

  pause() {
    if (this.phase === "playing") {
      this.phase = "paused";
    }
    return this.getSnapshot();
  }

  resume() {
    if (this.phase === "paused") {
      this.phase = "playing";
    }
    return this.getSnapshot();
  }

  flap() {
    if (this.phase === "ready" || this.phase === "gameover" || this.phase === "abandoned") {
      this.start();
    }
    if (this.phase === "paused") {
      this.phase = "playing";
    }
    this.velocity = WINGLOOP_WORLD.flapVelocity * (0.82 + this.settings.sensitivity * 0.25);
    this.lastEvent = "flap";
    return this.getSnapshot();
  }

  abandon() {
    if (this.phase !== "ready") {
      this.phase = "abandoned";
      this.bestScore = Math.max(this.bestScore, this.score);
      this.lastEvent = "abandon";
    }
    return this.getSnapshot();
  }

  updateSettings(next: Partial<WingLoopSettings>) {
    this.settings = {
      ...this.settings,
      ...next,
      sensitivity: Math.min(1, Math.max(0, next.sensitivity ?? this.settings.sensitivity)),
    };
    return this.getSnapshot();
  }

  resetSettings() {
    this.settings = { ...DEFAULT_WINGLOOP_SETTINGS };
    return this.getSnapshot();
  }

  tick(seconds: number) {
    if (this.phase !== "playing") {
      return this.getSnapshot();
    }

    const dt = Math.min(0.032, Math.max(0, seconds));
    this.difficulty = Math.min(12, this.score * 0.5);
    const speed = 230 + this.difficulty * 13;
    this.velocity += WINGLOOP_WORLD.gravity * dt;
    this.birdY += this.velocity * dt;
    this.spawnClock += dt;
    this.lastEvent = "idle";

    if (this.spawnClock > WINGLOOP_WORLD.pipeInterval) {
      this.spawnClock = 0;
      this.pipes.push(this.createPipe(WINGLOOP_WORLD.width + 80));
    }

    this.pipes = this.pipes
      .map((pipe) => ({ ...pipe, x: pipe.x - speed * dt }))
      .filter((pipe) => pipe.x + WINGLOOP_WORLD.pipeWidth > -10);

    this.applyPipeScoring();
    this.applyCollision();
    return this.getSnapshot();
  }

  private resetRun() {
    this.score = 0;
    this.difficulty = 0;
    this.birdY = WINGLOOP_WORLD.height * 0.45;
    this.velocity = 0;
    this.spawnClock = 0;
    this.pipeId = 1;
    this.pipes = [this.createPipe(WINGLOOP_WORLD.width + 90)];
  }

  private createPipe(x: number) {
    const pipe = makePipe(this.pipeId, x, this.difficulty, this.settings, this.random);
    this.pipeId += 1;
    return pipe;
  }

  private applyPipeScoring() {
    for (const pipe of this.pipes) {
      if (!pipe.scored && pipe.x + WINGLOOP_WORLD.pipeWidth < WINGLOOP_WORLD.birdX - WINGLOOP_WORLD.birdRadius) {
        pipe.scored = true;
        this.score += 1;
        this.lastEvent = "score";
      }
    }
  }

  private applyCollision() {
    const gap = pipeGap(this.difficulty, this.settings.assistMode);
    const hitPipe = this.pipes.some((pipe) => {
      const overlapsX =
        WINGLOOP_WORLD.birdX + WINGLOOP_WORLD.birdRadius > pipe.x &&
        WINGLOOP_WORLD.birdX - WINGLOOP_WORLD.birdRadius < pipe.x + WINGLOOP_WORLD.pipeWidth;
      const outsideGap =
        this.birdY - WINGLOOP_WORLD.birdRadius < pipe.gapY - gap / 2 ||
        this.birdY + WINGLOOP_WORLD.birdRadius > pipe.gapY + gap / 2;
      return overlapsX && outsideGap;
    });
    const hitBounds =
      this.birdY < WINGLOOP_WORLD.birdRadius ||
      this.birdY > WINGLOOP_WORLD.height - WINGLOOP_WORLD.birdRadius;

    if (hitPipe || hitBounds) {
      this.phase = "gameover";
      this.bestScore = Math.max(this.bestScore, this.score);
      this.lastEvent = "collision";
    }
  }
}

export const createWingLoopRuntime = (options?: WingLoopRuntimeOptions) => new WingLoopRuntime(options);
