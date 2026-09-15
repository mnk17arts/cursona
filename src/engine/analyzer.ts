import { ARCHETYPES } from './archetypes';
import type { AnalysisResult, PersonalityScores, SessionTelemetry } from '../types';

export function computeScores(telemetry: SessionTelemetry): PersonalityScores {
  const {
    avgSpeed,
    maxSpeed,
    pausesCount,
    totalPauseDurationMs,
    longestPauseMs,
    sharpReversals,
    smoothSegments,
    viewportCoverage,
    quadrantsVisited,
    clickCount,
    totalDurationMs
  } = telemetry;

  const durationSec = Math.max(1, totalDurationMs / 1000);

  // 1. ENERGY (0 - 100)
  // Low (< 250 px/s) = 15-30%, Medium (300-700 px/s) = 40-65%, Fast (> 1100 px/s) = 80-98%
  let rawEnergy = (avgSpeed / 1100) * 65 + (maxSpeed / 2600) * 35;
  if (clickCount > 5) rawEnergy += Math.min(15, clickCount * 2);

  // 2. CHAOS (0 - 100)
  // Genuine entropy: violent reversals (> 110 deg), rapid jitter per second
  const reversalRate = sharpReversals / durationSec;
  let rawChaos = (reversalRate / 2.2) * 85;
  if (clickCount >= 6) rawChaos += 15;
  // Reward smooth vector movement with lower chaos
  if (smoothSegments > 15) rawChaos = Math.max(5, rawChaos - 25);

  // 3. PATIENCE (0 - 100)
  // High pause ratio and deliberate stillness
  const pauseRatio = totalDurationMs > 0 ? totalPauseDurationMs / totalDurationMs : 0;
  let rawPatience = pauseRatio * 80 + Math.min(25, (longestPauseMs / 2000) * 20);
  if (pausesCount >= 3) rawPatience += 10;
  if (avgSpeed > 800) rawPatience = Math.max(5, rawPatience - 25);

  // 4. PRECISION (0 - 100)
  // Deliberate straight vectors, low reversals, calm steady glide
  let rawPrecision = 90 - (sharpReversals * 4.5) + Math.min(25, smoothSegments * 1.5);
  if (rawChaos > 60) rawPrecision -= 25;

  // 5. EXPLORATION (0 - 100)
  // Requires roaming across distinct screen quadrants (1 to 4) + grid spread
  const quadScore = (quadrantsVisited / 4) * 55;
  const gridScore = Math.min(45, (viewportCoverage / 60) * 45);
  const rawExploration = quadScore + gridScore;

  // Clamp raw values
  let energy = Math.min(100, Math.max(8, Math.round(rawEnergy)));
  let chaos = Math.min(100, Math.max(5, Math.round(rawChaos)));
  let patience = Math.min(100, Math.max(6, Math.round(rawPatience)));
  let precision = Math.min(100, Math.max(8, Math.round(rawPrecision)));
  let exploration = Math.min(100, Math.max(10, Math.round(rawExploration)));

  // CONTRAST EXPANDER:
  // Stretch the extremes so scores don't cluster around 50%
  const stretch = (val: number): number => {
    if (val > 50) {
      return Math.min(99, Math.round(50 + Math.pow((val - 50) / 50, 0.85) * 49));
    } else {
      return Math.max(5, Math.round(50 - Math.pow((50 - val) / 50, 0.85) * 45));
    }
  };

  energy = stretch(energy);
  chaos = stretch(chaos);
  patience = stretch(patience);
  precision = stretch(precision);
  exploration = stretch(exploration);

  return { energy, precision, chaos, patience, exploration };
}

// Multi-dimensional Euclidean distance matching
export function classifyArchetype(scores: PersonalityScores, telemetry: SessionTelemetry): AnalysisResult {
  // Special override cases for explicit user actions
  if (telemetry.clickCount >= 7) {
    return createResult('clicker', scores, telemetry);
  }
  if (telemetry.isTouchMode && scores.energy > 55) {
    return createResult('touchGymnast', scores, telemetry);
  }
  if (scores.patience >= 80 && scores.energy <= 25 && telemetry.totalDistance < 800) {
    return createResult('minimalist', scores, telemetry);
  }

  // Default ideal score vectors to prevent runtime undefined access during hot reload
  const DEFAULT_IDEALS: Record<string, PersonalityScores> = {
    turbo: { energy: 94, precision: 50, chaos: 45, patience: 10, exploration: 65 },
    overthinker: { energy: 20, precision: 65, chaos: 18, patience: 96, exploration: 35 },
    chaos: { energy: 82, precision: 12, chaos: 98, patience: 14, exploration: 72 },
    perfectionist: { energy: 48, precision: 98, chaos: 8, patience: 60, exploration: 42 },
    explorer: { energy: 58, precision: 62, chaos: 30, patience: 45, exploration: 97 },
    minimalist: { energy: 12, precision: 78, chaos: 6, patience: 99, exploration: 14 }
  };

  // Calculate distance in 5D trait space to each archetype's ideal profile
  let bestKey = 'explorer';
  let minDistance = Infinity;

  const candidateKeys = ['turbo', 'overthinker', 'chaos', 'perfectionist', 'explorer', 'minimalist'];

  for (const key of candidateKeys) {
    const candidate = ARCHETYPES[key];
    const ideal = candidate?.idealScores || DEFAULT_IDEALS[key] || { energy: 50, precision: 50, chaos: 50, patience: 50, exploration: 50 };

    // Weighted Euclidean distance
    const dist = Math.sqrt(
      Math.pow(scores.energy - ideal.energy, 2) * 1.2 +
      Math.pow(scores.precision - ideal.precision, 2) * 1.1 +
      Math.pow(scores.chaos - ideal.chaos, 2) * 1.3 +
      Math.pow(scores.patience - ideal.patience, 2) * 1.2 +
      Math.pow(scores.exploration - ideal.exploration, 2) * 1.0
    );

    if (dist < minDistance) {
      minDistance = dist;
      bestKey = key;
    }
  }

  return createResult(bestKey, scores, telemetry);
}

function createResult(key: string, scores: PersonalityScores, telemetry: SessionTelemetry): AnalysisResult {
  const base = ARCHETYPES[key] || ARCHETYPES.explorer;
  
  // Clone to guarantee every field is present even across HMR boundary
  const archetype = {
    ...base,
    customStats: base.customStats || [
      { label: 'Kinetic Profile', value: 'Active', hint: 'Sensor telemetry' },
      { label: 'Trajectory Consistency', value: '88%', hint: 'Observed path stability' },
      { label: 'Entropy Index', value: 'Moderate', hint: 'Directional variance' }
    ],
    traits: base.traits || ['Analytical', 'Adaptive', 'Responsive'],
    quirks: base.quirks || ['Natural movement rhythm', 'Curious exploration patterns']
  };

  const uniqueId = `${archetype.id}-${Date.now().toString(36)}`;

  return {
    archetype,
    scores,
    telemetry,
    timestamp: Date.now(),
    id: uniqueId
  };
}

export function encodeResultUrl(result: AnalysisResult): string {
  const params = new URLSearchParams();
  params.set('p', result.archetype.id);
  params.set('e', result.scores.energy.toString());
  params.set('pr', result.scores.precision.toString());
  params.set('c', result.scores.chaos.toString());
  params.set('pa', result.scores.patience.toString());
  params.set('ex', result.scores.exploration.toString());
  return `${window.location.origin}${window.location.pathname}#${params.toString()}`;
}

export function decodeResultFromUrl(): AnalysisResult | null {
  if (typeof window === 'undefined' || !window.location.hash) return null;
  try {
    const raw = window.location.hash.replace(/^#/, '');
    const params = new URLSearchParams(raw);
    const p = params.get('p');
    if (!p || !ARCHETYPES[p]) return null;

    const scores: PersonalityScores = {
      energy: parseInt(params.get('e') || '50', 10),
      precision: parseInt(params.get('pr') || '50', 10),
      chaos: parseInt(params.get('c') || '50', 10),
      patience: parseInt(params.get('pa') || '50', 10),
      exploration: parseInt(params.get('ex') || '50', 10)
    };

    return {
      archetype: ARCHETYPES[p],
      scores,
      telemetry: {
        totalDistance: 1420,
        maxSpeed: 890,
        avgSpeed: 420,
        pausesCount: 3,
        totalPauseDurationMs: 1400,
        longestPauseMs: 800,
        directionChanges: 10,
        sharpReversals: 2,
        smoothSegments: 8,
        viewportCoverage: scores.exploration,
        quadrantsVisited: 4,
        clickCount: 1,
        totalDurationMs: 8000,
        sampleCount: 160,
        isTouchMode: false,
        recordedPath: []
      },
      timestamp: Date.now(),
      id: `${p}-shared`
    };
  } catch {
    return null;
  }
}
