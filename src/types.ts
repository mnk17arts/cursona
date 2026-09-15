export interface Point {
  x: number;
  y: number;
}

export interface SessionTelemetry {
  totalDistance: number;          // in pixels
  maxSpeed: number;               // in px/second
  avgSpeed: number;               // in px/second
  pausesCount: number;            // number of pauses > 300ms
  totalPauseDurationMs: number;   // total time spent still
  longestPauseMs: number;         // longest continuous pause in ms
  directionChanges: number;       // total direction shifts
  sharpReversals: number;         // violent direction reversals (> 110 deg)
  smoothSegments: number;         // deliberate straight / smooth vector paths
  viewportCoverage: number;       // 0 - 100% of grid sectors visited
  quadrantsVisited: number;       // 1 - 4 quadrants visited
  clickCount: number;             // mouse clicks or taps during observation
  totalDurationMs: number;        // observation session length in ms
  sampleCount: number;            // total coordinate frames
  isTouchMode: boolean;           // whether evaluated on touch/mobile
  recordedPath: Point[];          // normalized (0-1) coordinates of actual path
}

export interface PersonalityScores {
  energy: number;       // 0-100: Speed, acceleration, relentless motion
  precision: number;    // 0-100: Smooth curves, deliberate vector paths, minimal hesitation
  chaos: number;        // 0-100: Sharp turns, unpredictable stops, jitter, frenzy
  patience: number;     // 0-100: Contemplative pauses, calm pacing, slow deliberate movement
  exploration: number;  // 0-100: Quadrant roaming, perimeter visits, viewport curiosity
}

export interface CustomArchetypeStat {
  label: string;
  value: string;
  hint: string;
}

export interface PersonalityArchetype {
  id: string;
  title: string;
  codename: string;
  tagline: string;
  description: string;
  quote: string;
  accentColor: string;
  badge: string;
  traits: string[];
  quirks: string[];
  compatibility: string;
  nemesis: string;
  customStats: CustomArchetypeStat[];
  idealScores: PersonalityScores;
}

export interface AnalysisResult {
  archetype: PersonalityArchetype;
  scores: PersonalityScores;
  telemetry: SessionTelemetry;
  timestamp: number;
  id: string;
}
