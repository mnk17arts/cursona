import React, { useMemo } from 'react';
import { Gauge, Navigation, Compass, Hourglass, MousePointer, Activity } from 'lucide-react';
import type { SessionTelemetry } from '../types';

interface TelemetryHUDProps {
  telemetry: SessionTelemetry;
  timeLeft: number;
  totalTime: number;
}

export const TelemetryHUD: React.FC<TelemetryHUDProps> = ({ telemetry, timeLeft, totalTime }) => {
  const progress = Math.max(0, Math.min(100, ((totalTime - timeLeft) / totalTime) * 100));

  // Dynamic live commentary based on real-time sensory thresholds
  const liveCommentary = useMemo(() => {
    if (telemetry.clickCount >= 6) {
      return "⚠️ High click frequency detected. Fidgeting index: Critical.";
    }
    if (telemetry.avgSpeed > 900) {
      return "⚡ Relentless velocity! Do you have 40 browser tabs waiting?";
    }
    if (telemetry.directionChanges > 16) {
      return "🌀 Extreme entropy detected! Are you evading an imaginary drone?";
    }
    if (telemetry.pausesCount > 4 && telemetry.avgSpeed < 300) {
      return "🤔 Notable hesitation observed. Questioning life decisions?";
    }
    if (telemetry.viewportCoverage > 60) {
      return "🗺️ Wide exploration coverage. Inspecting every dusty corner!";
    }
    if (telemetry.totalDistance > 3500) {
      return "🏃 That's quite a marathon. Your optical sensor is sweating.";
    }
    return "👀 Neural observation in progress... keep moving naturally.";
  }, [telemetry]);

  return (
    <div className="pointer-events-none fixed bottom-6 inset-x-0 z-20 flex flex-col items-center px-4 max-w-4xl mx-auto">
      {/* Dynamic quip ticker */}
      <div className="mb-4 inline-flex items-center gap-2.5 px-4 py-2 rounded-full glass-panel-glow text-sm text-indigo-200 border border-indigo-500/30 animate-pulse-subtle shadow-lg">
        <Activity className="w-4 h-4 text-indigo-400 animate-spin" style={{ animationDuration: '4s' }} />
        <span className="font-mono text-xs md:text-sm tracking-wide">{liveCommentary}</span>
      </div>

      {/* Main glass telemetry bar */}
      <div className="w-full glass-panel rounded-2xl p-4 border border-white/10 shadow-2xl backdrop-blur-xl">
        {/* Progress Bar Header */}
        <div className="flex items-center justify-between mb-3 text-xs font-mono text-slate-400">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-slate-200 font-semibold uppercase tracking-wider">Telemetry Sensors Active</span>
          </div>
          <div>
            REMAINING: <span className="text-indigo-400 font-bold">{timeLeft.toFixed(1)}s</span>
          </div>
        </div>

        {/* Observation Progress Bar */}
        <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden mb-4">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 transition-all duration-100 ease-linear rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Live Gauges Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          {/* Velocity */}
          <div className="flex flex-col p-2.5 rounded-xl bg-white/[0.03] border border-white/5">
            <div className="flex items-center gap-1.5 text-slate-400 text-xs mb-1">
              <Gauge className="w-3.5 h-3.5 text-indigo-400" />
              <span>Speed</span>
            </div>
            <div className="text-base sm:text-lg font-bold font-mono text-slate-100">
              {Math.round(telemetry.avgSpeed)}
              <span className="text-[10px] text-slate-500 font-normal ml-1">px/s</span>
            </div>
          </div>

          {/* Distance */}
          <div className="flex flex-col p-2.5 rounded-xl bg-white/[0.03] border border-white/5">
            <div className="flex items-center gap-1.5 text-slate-400 text-xs mb-1">
              <Navigation className="w-3.5 h-3.5 text-purple-400" />
              <span>Distance</span>
            </div>
            <div className="text-base sm:text-lg font-bold font-mono text-slate-100">
              {Math.round(telemetry.totalDistance)}
              <span className="text-[10px] text-slate-500 font-normal ml-1">px</span>
            </div>
          </div>

          {/* Sharp Turns / Entropy */}
          <div className="flex flex-col p-2.5 rounded-xl bg-white/[0.03] border border-white/5">
            <div className="flex items-center gap-1.5 text-slate-400 text-xs mb-1">
              <Activity className="w-3.5 h-3.5 text-pink-400" />
              <span>Swerves</span>
            </div>
            <div className="text-base sm:text-lg font-bold font-mono text-slate-100">
              {telemetry.directionChanges}
              <span className="text-[10px] text-slate-500 font-normal ml-1">turns</span>
            </div>
          </div>

          {/* Pauses / Hesitations */}
          <div className="flex flex-col p-2.5 rounded-xl bg-white/[0.03] border border-white/5">
            <div className="flex items-center gap-1.5 text-slate-400 text-xs mb-1">
              <Hourglass className="w-3.5 h-3.5 text-amber-400" />
              <span>Pauses</span>
            </div>
            <div className="text-base sm:text-lg font-bold font-mono text-slate-100">
              {telemetry.pausesCount}
              <span className="text-[10px] text-slate-500 font-normal ml-1">stops</span>
            </div>
          </div>

          {/* Viewport Coverage */}
          <div className="flex flex-col p-2.5 rounded-xl bg-white/[0.03] border border-white/5">
            <div className="flex items-center gap-1.5 text-slate-400 text-xs mb-1">
              <Compass className="w-3.5 h-3.5 text-cyan-400" />
              <span>Roam Area</span>
            </div>
            <div className="text-base sm:text-lg font-bold font-mono text-slate-100">
              {Math.round(telemetry.viewportCoverage)}
              <span className="text-[10px] text-slate-500 font-normal ml-1">%</span>
            </div>
          </div>

          {/* Clicks */}
          <div className="flex flex-col p-2.5 rounded-xl bg-white/[0.03] border border-white/5">
            <div className="flex items-center gap-1.5 text-slate-400 text-xs mb-1">
              <MousePointer className="w-3.5 h-3.5 text-emerald-400" />
              <span>Clicks</span>
            </div>
            <div className="text-base sm:text-lg font-bold font-mono text-slate-100">
              {telemetry.clickCount}
              <span className="text-[10px] text-slate-500 font-normal ml-1">taps</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
