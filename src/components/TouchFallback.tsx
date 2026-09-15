import React from 'react';
import { Smartphone, Sparkles } from 'lucide-react';

interface TouchFallbackProps {
  onStartTouch: () => void;
}

export const TouchFallback: React.FC<TouchFallbackProps> = ({ onStartTouch }) => {
  return (
    <div className="flex flex-col items-center justify-center p-6 text-center max-w-md mx-auto">
      <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-4 text-indigo-400">
        <Smartphone className="w-8 h-8 animate-bounce" />
      </div>

      <span className="px-3 py-1 rounded-full text-xs font-mono font-semibold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 mb-3">
        Mobile Touch Mode
      </span>

      <h2 className="text-2xl font-bold text-white mb-2">
        Touch Personality Test
      </h2>

      <p className="text-sm text-slate-300 mb-6 leading-relaxed">
        No mouse? No problem. We analyze your thumb speed, swipe curvature, tap frequency, and flick momentum to diagnose your glass-scrolling persona.
      </p>

      <button
        onClick={onStartTouch}
        className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold text-base shadow-xl hover:shadow-indigo-500/25 active:scale-95 transition-all cursor-pointer"
      >
        <Sparkles className="w-5 h-5" />
        <span>Begin Touch Analysis</span>
      </button>
    </div>
  );
};
