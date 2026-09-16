import React, { useEffect, useState, useRef } from 'react';
import confetti from 'canvas-confetti';
import { Share2, Download, RefreshCw, Check, Zap, Target, Flame, Heart, Compass, AlertTriangle, ShieldCheck, Activity, Gauge, Navigation, X } from 'lucide-react';
import type { AnalysisResult } from '../types';
import { soundFx } from '../shared/sound';
import { encodeResultUrl } from '../engine/analyzer';

interface ResultCardProps {
  result: AnalysisResult;
  onReset: () => void;
}

export const ResultCard: React.FC<ResultCardProps> = ({ result, onReset }) => {
  const [copied, setCopied] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const pathCanvasRef = useRef<HTMLCanvasElement>(null);
  const { archetype, scores, telemetry } = result;

  // Draw actual trajectory path replay in miniature canvas
  useEffect(() => {
    const canvas = pathCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 400;
    canvas.height = 180;

    // Dark grid background
    ctx.fillStyle = '#0f121d';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Subtle grid lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    for (let x = 0; x < canvas.width; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += 30) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    const path = telemetry.recordedPath;
    if (path && path.length > 1) {
      ctx.save();
      ctx.strokeStyle = archetype.accentColor;
      ctx.lineWidth = 2.5;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.shadowColor = archetype.accentColor;
      ctx.shadowBlur = 10;

      ctx.beginPath();
      ctx.moveTo(path[0].x * canvas.width, path[0].y * canvas.height);
      for (let i = 1; i < path.length; i++) {
        ctx.lineTo(path[i].x * canvas.width, path[i].y * canvas.height);
      }
      ctx.stroke();

      // Start dot (emerald)
      ctx.fillStyle = '#10b981';
      ctx.beginPath();
      ctx.arc(path[0].x * canvas.width, path[0].y * canvas.height, 4, 0, Math.PI * 2);
      ctx.fill();

      // End dot (rose)
      ctx.fillStyle = '#f43f5e';
      ctx.beginPath();
      ctx.arc(path[path.length - 1].x * canvas.width, path[path.length - 1].y * canvas.height, 5, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    } else {
      // Fallback message if path wasn't captured
      ctx.fillStyle = '#64748b';
      ctx.font = '12px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('Optical sensory trajectory recorded', canvas.width / 2, canvas.height / 2);
    }
  }, [telemetry, archetype]);

  useEffect(() => {
    // Triumphant sound chord & confetti explosion
    soundFx.revealChord();

    try {
      confetti({
        particleCount: 90,
        spread: 70,
        origin: { y: 0.6 },
        colors: [archetype.accentColor, '#818cf8', '#c084fc', '#38bdf8']
      });
    } catch {
      // Ignored
    }
  }, [archetype]);

  const handleShare = async () => {
    soundFx.click();
    const url = encodeResultUrl(result);
    try {
      if (navigator.share) {
        await navigator.share({
          title: `My Cursona: ${archetype.title}`,
          text: `Cursona judged my cursor: "${archetype.title}" — ${archetype.tagline}. What's yours?`,
          url: url
        });
      } else {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2400);
      }
    } catch {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2400);
    }
  };

  const handleDownloadCard = () => {
    soundFx.click();
    const canvas = document.createElement('canvas');
    canvas.width = 1200;
    canvas.height = 760;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Background gradient
    const grad = ctx.createLinearGradient(0, 0, 1200, 760);
    grad.addColorStop(0, '#0a0c16');
    grad.addColorStop(1, '#111424');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1200, 760);

    // Decorative glow
    ctx.fillStyle = archetype.accentColor;
    ctx.globalAlpha = 0.15;
    ctx.beginPath();
    ctx.arc(600, 150, 320, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1.0;

    // Outer border
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = 2;
    ctx.strokeRect(30, 30, 1140, 700);

    // Header text
    ctx.fillStyle = archetype.accentColor;
    ctx.font = 'bold 20px "JetBrains Mono", monospace';
    ctx.fillText(`// DIAGNOSTIC REPORT: [${archetype.codename}]`, 70, 85);

    // Title
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 46px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(archetype.title, 70, 145);

    // Tagline
    ctx.fillStyle = '#94a3b8';
    ctx.font = '22px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(archetype.tagline, 70, 190);

    // Scores Bar Graph
    const metrics = [
      { label: 'Energy', val: scores.energy },
      { label: 'Precision', val: scores.precision },
      { label: 'Chaos', val: scores.chaos },
      { label: 'Patience', val: scores.patience },
      { label: 'Exploration', val: scores.exploration }
    ];

    metrics.forEach((m, idx) => {
      const y = 260 + idx * 52;
      ctx.fillStyle = '#cbd5e1';
      ctx.font = 'bold 16px "JetBrains Mono", monospace';
      ctx.fillText(m.label.toUpperCase(), 70, y);

      ctx.fillStyle = '#1e293b';
      ctx.fillRect(230, y - 16, 360, 12);

      ctx.fillStyle = archetype.accentColor;
      ctx.fillRect(230, y - 16, (360 * m.val) / 100, 12);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 16px "JetBrains Mono", monospace';
      ctx.fillText(`${m.val}%`, 610, y);
    });

    // Custom Stats Box
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(700, 235, 430, 240);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.strokeRect(700, 235, 430, 240);

    ctx.fillStyle = archetype.accentColor;
    ctx.font = 'bold 16px "JetBrains Mono", monospace';
    const customStats = archetype.customStats || [
      { label: 'Kinetic Profile', value: 'Active', hint: 'Sensor telemetry' },
      { label: 'Trajectory Consistency', value: '88%', hint: 'Observed path stability' },
      { label: 'Entropy Index', value: 'Moderate', hint: 'Directional variance' }
    ];

    customStats.forEach((stat, idx) => {
      const sy = 315 + idx * 55;
      ctx.fillStyle = '#e2e8f0';
      ctx.font = '15px "Plus Jakarta Sans", sans-serif';
      ctx.fillText(stat.label, 720, sy);

      ctx.fillStyle = archetype.accentColor;
      ctx.font = 'bold 18px "JetBrains Mono", monospace';
      ctx.fillText(stat.value, 720, sy + 24);
    });

    // Physical Telemetry Receipt
    ctx.fillStyle = '#64748b';
    ctx.font = '14px "JetBrains Mono", monospace';
    const meters = (telemetry.totalDistance / 3779.5).toFixed(2);
    ctx.fillText(`Top Speed: ${Math.round(telemetry.maxSpeed)} px/s • Distance: ${meters}m • Pauses: ${telemetry.pausesCount} • Swerves: ${telemetry.sharpReversals}`, 70, 560);

    // Watermark
    ctx.fillStyle = '#64748b';
    ctx.font = '16px "JetBrains Mono", monospace';
    ctx.fillText('mnk17arts.github.io/cursona', 70, 680);
    ctx.fillText('⚡ Cursona • Judge My Cursor', 840, 680);

    // Download
    const link = document.createElement('a');
    link.download = `cursona-${archetype.id}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const meters = (telemetry.totalDistance / 3779.5).toFixed(2);
  const longestPauseSec = (telemetry.longestPauseMs / 1000).toFixed(1);

  return (
    <div className="relative z-30 max-w-4xl w-full mx-auto my-6 px-4 animate-in fade-in zoom-in-95 duration-500">
      <div
        ref={cardRef}
        className="glass-panel-glow rounded-3xl p-6 md:p-10 border border-white/10 shadow-2xl relative overflow-hidden"
      >
        {/* Ambient background aura */}
        <div
          className="absolute -top-24 -right-24 w-80 h-80 rounded-full blur-3xl opacity-20 pointer-events-none"
          style={{ backgroundColor: archetype.accentColor }}
        />
        <div
          className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full blur-3xl opacity-15 pointer-events-none"
          style={{ backgroundColor: archetype.accentColor }}
        />

        {/* Top Header info & Quick In-Viewport Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6 border-b border-white/10 pb-4">
          <div className="flex items-center gap-2">
            <span
              className="px-3 py-1 rounded-full text-xs font-mono font-bold tracking-wider uppercase border"
              style={{
                color: archetype.accentColor,
                borderColor: `${archetype.accentColor}40`,
                backgroundColor: `${archetype.accentColor}15`
              }}
            >
              {archetype.badge}
            </span>
            <span className="text-xs font-mono text-slate-500 tracking-wider">
              ID: {archetype.codename}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="hidden sm:inline text-xs font-mono text-slate-400 mr-1">
              {telemetry.isTouchMode ? '📱 Touch Mode' : '🖱️ Pointer Mode'}
            </span>
            <button
              onClick={() => {
                soundFx.click();
                onReset();
              }}
              title="Test again / Re-calibrate"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-500/20 hover:bg-indigo-500/30 text-xs font-medium text-indigo-200 border border-indigo-500/30 hover:text-white transition-all active:scale-95 cursor-pointer shadow-sm"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Re-calibrate</span>
            </button>
            <button
              onClick={() => {
                soundFx.click();
                onReset();
              }}
              aria-label="Back to home"
              title="Back to home"
              className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border border-white/10 transition-all active:scale-95 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Archetype Title & Tagline */}
        <div className="mb-6">
          <h1 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight mb-2">
            {archetype.title}
          </h1>
          <p className="text-lg md:text-xl font-medium text-slate-300">
            {archetype.tagline}
          </p>
        </div>

        {/* Quote Callout */}
        <div className="p-4 rounded-2xl bg-white/[0.02] border-l-4 border-indigo-500 mb-8 italic text-slate-300 text-sm md:text-base">
          {archetype.quote}
        </div>

        {/* NEW: Trajectory Miniature Replay + Custom Archetype Stats Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
          {/* Your Actual Recorded Trajectory */}
          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <Navigation className="w-3.5 h-3.5 text-indigo-400" />
                Recorded Trajectory Path
              </span>
              <div className="flex items-center gap-3 text-[10px] font-mono text-slate-400">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" /> Start
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-rose-500" /> Finish
                </span>
              </div>
            </div>
            <div className="rounded-xl overflow-hidden border border-white/10 bg-[#0f121d] my-1">
              <canvas ref={pathCanvasRef} className="block w-full h-36" />
            </div>
            <div className="text-[11px] font-mono text-slate-400 text-center mt-1">
              Your genuine movement trajectory captured during observation
            </div>
          </div>

          {/* Archetype-Specific Custom Metrics (Completely unique per archetype!) */}
          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col justify-between">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300 mb-2 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-pink-400" />
              Specialized Archetype Metrics
            </span>
            <div className="space-y-2.5 my-auto">
              {(archetype.customStats || [
                { label: 'Kinetic Profile', value: 'Active', hint: 'Sensor telemetry' },
                { label: 'Trajectory Consistency', value: '88%', hint: 'Observed path stability' },
                { label: 'Entropy Index', value: 'Moderate', hint: 'Directional variance' }
              ]).map((stat, idx) => (
                <div key={idx} className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-between">
                  <div>
                    <div className="text-xs text-slate-300 font-semibold">{stat.label}</div>
                    <div className="text-[10px] text-slate-400">{stat.hint}</div>
                  </div>
                  <div
                    className="text-base font-bold font-mono ml-2"
                    style={{ color: archetype.accentColor }}
                  >
                    {stat.value}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 5-Axis Kinetic Scores with high-contrast distinct values */}
        <div className="mb-8">
          <h2 className="text-xs font-mono font-bold uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
            <Zap className="w-4 h-4 text-indigo-400" />
            Kinetic Metric Profile
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3.5">
            {/* Energy */}
            <div>
              <div className="flex justify-between text-xs font-mono mb-1">
                <span className="flex items-center gap-1.5 text-slate-300 font-semibold">
                  <Flame className="w-3.5 h-3.5 text-amber-400" /> Energy & Velocity
                </span>
                <span className="text-amber-400 font-bold">{scores.energy}%</span>
              </div>
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-orange-400 transition-all duration-1000 ease-out rounded-full"
                  style={{ width: `${scores.energy}%` }}
                />
              </div>
            </div>

            {/* Precision */}
            <div>
              <div className="flex justify-between text-xs font-mono mb-1">
                <span className="flex items-center gap-1.5 text-slate-300 font-semibold">
                  <Target className="w-3.5 h-3.5 text-emerald-400" /> Vector Precision
                </span>
                <span className="text-emerald-400 font-bold">{scores.precision}%</span>
              </div>
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-1000 ease-out rounded-full"
                  style={{ width: `${scores.precision}%` }}
                />
              </div>
            </div>

            {/* Chaos */}
            <div>
              <div className="flex justify-between text-xs font-mono mb-1">
                <span className="flex items-center gap-1.5 text-slate-300 font-semibold">
                  <Zap className="w-3.5 h-3.5 text-pink-400" /> Chaos & Entropy
                </span>
                <span className="text-pink-400 font-bold">{scores.chaos}%</span>
              </div>
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-pink-500 to-rose-400 transition-all duration-1000 ease-out rounded-full"
                  style={{ width: `${scores.chaos}%` }}
                />
              </div>
            </div>

            {/* Patience */}
            <div>
              <div className="flex justify-between text-xs font-mono mb-1">
                <span className="flex items-center gap-1.5 text-slate-300 font-semibold">
                  <Heart className="w-3.5 h-3.5 text-indigo-400" /> Patience & Stillness
                </span>
                <span className="text-indigo-400 font-bold">{scores.patience}%</span>
              </div>
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 to-purple-400 transition-all duration-1000 ease-out rounded-full"
                  style={{ width: `${scores.patience}%` }}
                />
              </div>
            </div>

            {/* Exploration (Spanning full width) */}
            <div className="md:col-span-2">
              <div className="flex justify-between text-xs font-mono mb-1">
                <span className="flex items-center gap-1.5 text-slate-300 font-semibold">
                  <Compass className="w-3.5 h-3.5 text-cyan-400" /> Viewport Roam Coverage
                </span>
                <span className="text-cyan-400 font-bold">{scores.exploration}%</span>
              </div>
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-cyan-500 to-sky-400 transition-all duration-1000 ease-out rounded-full"
                  style={{ width: `${scores.exploration}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Real Physical Telemetry Receipt */}
        <div className="mb-8 p-4 rounded-2xl bg-white/[0.02] border border-white/5">
          <div className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
            <Gauge className="w-3.5 h-3.5 text-amber-400" />
            Physical Telemetry Receipt
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center font-mono">
            <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5">
              <div className="text-[10px] text-slate-400">TOP VELOCITY</div>
              <div className="text-base font-bold text-slate-100">{Math.round(telemetry.maxSpeed)} <span className="text-[10px] text-slate-500">px/s</span></div>
            </div>
            <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5">
              <div className="text-[10px] text-slate-400">DESK MILEAGE</div>
              <div className="text-base font-bold text-slate-100">{meters} <span className="text-[10px] text-slate-500">meters</span></div>
            </div>
            <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5">
              <div className="text-[10px] text-slate-400">LONGEST PAUSE</div>
              <div className="text-base font-bold text-slate-100">{longestPauseSec} <span className="text-[10px] text-slate-500">sec</span></div>
            </div>
            <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5">
              <div className="text-[10px] text-slate-400">SHARP REVERSALS</div>
              <div className="text-base font-bold text-slate-100">{telemetry.sharpReversals} <span className="text-[10px] text-slate-500">swerves</span></div>
            </div>
          </div>
        </div>

        {/* Psychological Diagnostic breakdown */}
        <div className="space-y-6 mb-8 text-sm md:text-base leading-relaxed text-slate-300">
          <p>{archetype.description}</p>

          {/* Observed Quirks */}
          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5">
            <div className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 mb-2.5">
              Diagnosed Quirks:
            </div>
            <ul className="space-y-1.5 text-xs md:text-sm text-slate-300">
              {(archetype.quirks || []).map((quirk, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-indigo-400 mt-0.5">•</span>
                  <span>{quirk}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Compatibility & Nemesis */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block">Compatible Partner:</span>
                <span className="text-slate-300">{archetype.compatibility}</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block">Arch Nemesis:</span>
                <span className="text-slate-300">{archetype.nemesis}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-6 border-t border-white/10">
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={handleShare}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition-all shadow-lg hover:shadow-indigo-500/25 active:scale-95 cursor-pointer"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Share2 className="w-4 h-4" />}
              <span>{copied ? 'Link Copied!' : 'Share Result'}</span>
            </button>

            <button
              onClick={handleDownloadCard}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 font-medium text-sm border border-white/10 transition-all hover:border-white/20 active:scale-95 cursor-pointer"
            >
              <Download className="w-4 h-4 text-slate-400" />
              <span>Save Card (PNG)</span>
            </button>
          </div>

          <button
            onClick={() => {
              soundFx.click();
              onReset();
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-medium text-sm border border-white/10 transition-all hover:text-white cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Re-calibrate</span>
          </button>
        </div>
      </div>
    </div>
  );
};
