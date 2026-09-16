import { useState, useEffect, useRef, useCallback } from 'react';
import { MousePointer2, Volume2, VolumeX, Sparkles, Move, Compass, Zap, RefreshCw } from 'lucide-react';
import { CursorCanvas } from './components/CursorCanvas';
import { TelemetryHUD } from './components/TelemetryHUD';
import { ResultCard } from './components/ResultCard';
import type { SessionTelemetry, AnalysisResult } from './types';
import { computeScores, classifyArchetype, decodeResultFromUrl } from './engine/analyzer';
import { soundFx } from './shared/sound';

type Stage = 'landing' | 'observing' | 'analyzing' | 'result';

const OBSERVATION_DURATION_SEC = 8.0;

export function App() {
  const [stage, setStage] = useState<Stage>('landing');
  const [isMuted, setIsMuted] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [timeLeft, setTimeLeft] = useState(OBSERVATION_DURATION_SEC);
  const [analyzingText, setAnalyzingText] = useState('Calibrating optical trajectory...');

  // Telemetry collection state
  const telemetryRef = useRef<SessionTelemetry>({
    totalDistance: 0,
    maxSpeed: 0,
    avgSpeed: 0,
    pausesCount: 0,
    totalPauseDurationMs: 0,
    longestPauseMs: 0,
    directionChanges: 0,
    sharpReversals: 0,
    smoothSegments: 0,
    viewportCoverage: 0,
    quadrantsVisited: 0,
    clickCount: 0,
    totalDurationMs: 0,
    sampleCount: 0,
    isTouchMode: false,
    recordedPath: []
  });

  const [displayTelemetry, setDisplayTelemetry] = useState<SessionTelemetry>(telemetryRef.current);
  const visitedGridRef = useRef<Set<string>>(new Set());
  const visitedQuadsRef = useRef<Set<string>>(new Set());
  const currentPauseDurationRef = useRef<number>(0);
  const lastPathSampleRef = useRef<number>(0);
  const lastSampleTimeRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);
  const timerIntervalRef = useRef<number | null>(null);
  const analyzingIntervalRef = useRef<number | null>(null);

  // Centralized interval and timer killer to guarantee no orphaned loops
  const cleanupTimers = useCallback(() => {
    if (timerIntervalRef.current !== null) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    if (analyzingIntervalRef.current !== null) {
      clearInterval(analyzingIntervalRef.current);
      analyzingIntervalRef.current = null;
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanupTimers();
    };
  }, [cleanupTimers]);

  // Check if mobile / touch device
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      setIsTouchDevice(hasTouch);
      telemetryRef.current.isTouchMode = hasTouch;

      // Check if shared via URL hash
      const sharedResult = decodeResultFromUrl();
      if (sharedResult) {
        setResult(sharedResult);
        setStage('result');
      }
    }
  }, []);

  const handlePointerData = useCallback((data: {
    x: number;
    y: number;
    speed: number;
    angleDelta: number;
    isClick: boolean;
    isPause: boolean;
  }) => {
    const t = telemetryRef.current;
    const now = performance.now();

    if (data.isClick) {
      t.clickCount++;
      return;
    }

    t.sampleCount++;
    const dt = lastSampleTimeRef.current ? Math.max(1, now - lastSampleTimeRef.current) : 16;
    lastSampleTimeRef.current = now;

    // Track speed & distance
    const frameDist = (data.speed * dt) / 1000;
    t.totalDistance += frameDist;
    t.maxSpeed = Math.max(t.maxSpeed, data.speed);
    t.avgSpeed = t.avgSpeed === 0 ? data.speed : t.avgSpeed * 0.95 + data.speed * 0.05;

    // Direction changes and reversals
    if (data.angleDelta > 55) {
      t.directionChanges++;
    }
    if (data.angleDelta > 110) {
      t.sharpReversals++;
    }
    if (data.speed > 140 && data.angleDelta < 22) {
      t.smoothSegments++;
    }

    // Pauses
    if (data.isPause) {
      currentPauseDurationRef.current += dt;
      t.longestPauseMs = Math.max(t.longestPauseMs, currentPauseDurationRef.current);
      t.totalPauseDurationMs += dt;
      if (dt > 250) {
        t.pausesCount++;
      }
    } else {
      currentPauseDurationRef.current = 0;
    }

    // Viewport 10x10 grid coverage & quadrants
    if (typeof window !== 'undefined') {
      const col = Math.min(9, Math.max(0, Math.floor((data.x / window.innerWidth) * 10)));
      const row = Math.min(9, Math.max(0, Math.floor((data.y / window.innerHeight) * 10)));
      const cellKey = `${col}-${row}`;
      if (!visitedGridRef.current.has(cellKey)) {
        visitedGridRef.current.add(cellKey);
        t.viewportCoverage = visitedGridRef.current.size; // 0 to 100%
      }

      // Quadrants
      const qX = data.x > window.innerWidth / 2 ? 'R' : 'L';
      const qY = data.y > window.innerHeight / 2 ? 'B' : 'T';
      visitedQuadsRef.current.add(`${qX}-${qY}`);
      t.quadrantsVisited = visitedQuadsRef.current.size;

      // Record normalized trajectory points for visualization
      if (t.recordedPath.length < 180 && now - lastPathSampleRef.current > 45) {
        t.recordedPath.push({
          x: Math.max(0, Math.min(1, data.x / window.innerWidth)),
          y: Math.max(0, Math.min(1, data.y / window.innerHeight))
        });
        lastPathSampleRef.current = now;
      }
    }

    setDisplayTelemetry({ ...t });
  }, []);

  // Finish observation and run analysis
  const finishObservation = useCallback(() => {
    cleanupTimers();

    const t = telemetryRef.current;
    t.totalDurationMs = performance.now() - startTimeRef.current;

    setStage('analyzing');

    // Fun diagnostic processing quips
    const messages = [
      'Scanning kinetic twitch frequency...',
      'Deconstructing existential button hesitations...',
      'Calculating trajectory entropy & swerve vectors...',
      'Cross-referencing behavioral psychology models...',
      'Finalizing your cursor diagnosis...'
    ];

    let step = 0;
    analyzingIntervalRef.current = window.setInterval(() => {
      step++;
      if (step < messages.length) {
        setAnalyzingText(messages[step]);
        soundFx.tick(500 + step * 80);
      } else {
        if (analyzingIntervalRef.current !== null) {
          clearInterval(analyzingIntervalRef.current);
          analyzingIntervalRef.current = null;
        }
        const scores = computeScores(t);
        const finalResult = classifyArchetype(scores, t);
        setResult(finalResult);
        setStage('result');
      }
    }, 380);
  }, [cleanupTimers]);

  // Start observation mode
  const startObservation = () => {
    cleanupTimers();
    soundFx.click();
    telemetryRef.current = {
      totalDistance: 0,
      maxSpeed: 0,
      avgSpeed: 0,
      pausesCount: 0,
      totalPauseDurationMs: 0,
      longestPauseMs: 0,
      directionChanges: 0,
      sharpReversals: 0,
      smoothSegments: 0,
      viewportCoverage: 0,
      quadrantsVisited: 0,
      clickCount: 0,
      totalDurationMs: 0,
      sampleCount: 0,
      isTouchMode: isTouchDevice,
      recordedPath: []
    };
    visitedGridRef.current.clear();
    visitedQuadsRef.current.clear();
    currentPauseDurationRef.current = 0;
    lastPathSampleRef.current = performance.now();
    lastSampleTimeRef.current = performance.now();
    startTimeRef.current = performance.now();
    setTimeLeft(OBSERVATION_DURATION_SEC);
    setStage('observing');

    const tickInterval = 100;
    const startTime = Date.now();

    timerIntervalRef.current = window.setInterval(() => {
      const elapsed = (Date.now() - startTime) / 1000;
      const remaining = Math.max(0, OBSERVATION_DURATION_SEC - elapsed);
      setTimeLeft(remaining);

      if (remaining <= 0) {
        finishObservation();
      }
    }, tickInterval);
  };

  const handleReset = () => {
    cleanupTimers();
    soundFx.click();
    if (window.location.hash) {
      window.history.replaceState(null, '', window.location.pathname);
    }
    setResult(null);
    setTimeLeft(OBSERVATION_DURATION_SEC);
    setStage('landing');
  };

  const toggleSound = () => {
    const muted = soundFx.toggleMute();
    setIsMuted(muted);
    if (!muted) soundFx.click();
  };

  return (
    <div className={`min-h-screen bg-[#090a0f] bg-grid-pattern text-slate-100 flex flex-col justify-between relative overflow-hidden select-none ${stage === 'observing' ? 'touch-none overscroll-none' : ''}`}>
      {/* Interactive 60fps Canvas Trail in background */}
      <CursorCanvas
        interactive={stage === 'landing' || stage === 'observing'}
        onPointerData={stage === 'observing' ? handlePointerData : undefined}
      />

      {/* Top Navigation Bar */}
      <header className="relative z-30 flex items-center justify-between px-6 py-4 max-w-6xl w-full mx-auto">
        <div className="flex items-center gap-3">
          <button
            onClick={handleReset}
            title="Return to Home"
            className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono text-indigo-300 hover:text-white transition-all cursor-pointer"
          >
            <span className="w-2 h-2 rounded-full bg-indigo-400 animate-ping" />
            <span>CURSONA</span>
          </button>
          {stage === 'result' && (
            <button
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 hover:bg-indigo-500/30 text-xs font-mono text-indigo-200 border border-indigo-500/30 transition-all active:scale-95 cursor-pointer"
            >
              <RefreshCw className="w-3 h-3 text-indigo-400" />
              <span>New Test</span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={toggleSound}
            aria-label="Toggle Sound Effects"
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition-all cursor-pointer"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>

          <a
            href="https://github.com/mnk17arts/cursona"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-medium text-slate-300 hover:text-white transition-all"
          >
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
            </svg>
            <span className="hidden sm:inline">GitHub</span>
          </a>
        </div>
      </header>

      {/* Main Content Sections based on Stage */}
      <main className="relative z-20 flex-1 flex flex-col items-center justify-center px-4">
        {/* STAGE 1: LANDING */}
        {stage === 'landing' && (
          <div className="max-w-3xl text-center my-auto py-12 animate-in fade-in duration-700">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-mono font-medium mb-6">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Cursona • Judge My Cursor</span>
            </div>

            <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white mb-6 leading-tight">
              Judge my <br className="hidden sm:inline" />
              <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                cursor.
              </span>
            </h1>

            <p className="text-base sm:text-xl text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed">
              Move your mouse around. Cursona observes your velocity, curvature, pauses, and fidgets to diagnose your true digital archetype.
              <span className="block text-slate-400 text-sm mt-2">
                (We are definitely not judging you.)
              </span>
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
              <button
                onClick={startObservation}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white font-bold text-lg shadow-2xl hover:shadow-indigo-500/30 active:scale-95 transition-all cursor-pointer group"
              >
                <MousePointer2 className="w-5 h-5 transition-transform group-hover:-rotate-12" />
                <span>{isTouchDevice ? 'Analyze My Touch' : 'Analyze My Cursor'}</span>
              </button>
            </div>

            {/* Teaser Archetypes Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-left max-w-2xl mx-auto">
              <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5">
                <div className="flex items-center gap-2 text-amber-400 text-xs font-mono font-bold mb-1">
                  <Zap className="w-3.5 h-3.5" /> THE SPEED DEMON
                </div>
                <div className="text-xs text-slate-400">83 open tabs, zero hesitation.</div>
              </div>

              <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5">
                <div className="flex items-center gap-2 text-indigo-400 text-xs font-mono font-bold mb-1">
                  <Compass className="w-3.5 h-3.5" /> OVERTHINKER
                </div>
                <div className="text-xs text-slate-400">Existential hover before clicking.</div>
              </div>

              <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5">
                <div className="flex items-center gap-2 text-pink-400 text-xs font-mono font-bold mb-1">
                  <Move className="w-3.5 h-3.5" /> CHAOS AGENT
                </div>
                <div className="text-xs text-slate-400">Angry moth inside a monitor.</div>
              </div>

              <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5">
                <div className="flex items-center gap-2 text-emerald-400 text-xs font-mono font-bold mb-1">
                  <Sparkles className="w-3.5 h-3.5" /> PIXEL SURGEON
                </div>
                <div className="text-xs text-slate-400">Straight vectors, sub-pixel logic.</div>
              </div>
            </div>
          </div>
        )}

        {/* STAGE 2: OBSERVING */}
        {stage === 'observing' && (
          <div className="text-center my-auto pointer-events-none select-none">
            <div className="mb-4 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 font-mono text-sm animate-pulse">
              <span>● OBSERVING YOUR NATURAL MOVEMENT</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-bold text-white mb-2">
              Move freely around the screen
            </h2>
            <p className="text-sm sm:text-base text-slate-400 max-w-md mx-auto">
              Swirl, dart, hover, or click. The more naturally you move, the sharper the diagnosis.
            </p>

            {/* Live Telemetry HUD Bar */}
            <TelemetryHUD
              telemetry={displayTelemetry}
              timeLeft={timeLeft}
              totalTime={OBSERVATION_DURATION_SEC}
            />
          </div>
        )}

        {/* STAGE 3: ANALYZING */}
        {stage === 'analyzing' && (
          <div className="text-center my-auto p-8 max-w-md mx-auto glass-panel-glow rounded-3xl animate-in zoom-in-95 duration-300">
            <div className="relative w-20 h-20 mx-auto mb-6">
              <div className="absolute inset-0 rounded-full border-4 border-indigo-500/20" />
              <div className="absolute inset-0 rounded-full border-4 border-t-indigo-500 border-r-purple-500 animate-spin" />
              <MousePointer2 className="w-8 h-8 text-indigo-400 absolute inset-0 m-auto animate-pulse" />
            </div>

            <h3 className="text-xl font-bold text-white mb-2">
              Synthesizing Personality
            </h3>

            <div className="font-mono text-xs text-indigo-300 h-6 flex items-center justify-center">
              {analyzingText}
            </div>

            <div className="mt-4 w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full w-full animate-pulse" />
            </div>
          </div>
        )}

        {/* STAGE 4: RESULT */}
        {stage === 'result' && result && (
          <ResultCard result={result} onReset={handleReset} />
        )}
      </main>

      {/* Subtle Footer */}
      <footer className="relative z-30 py-4 text-center text-xs text-slate-400 font-mono">
        <p>
          100% Client-side • Zero cookies or tracking • Built with React & Canvas
        </p>
      </footer>
    </div>
  );
}

export default App;
