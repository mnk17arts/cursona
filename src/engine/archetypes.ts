import type { PersonalityArchetype } from '../types';

export const ARCHETYPES: Record<string, PersonalityArchetype> = {
  turbo: {
    id: 'turbo',
    title: 'The Speed Demon',
    codename: 'PROJECT_WARP_SPEED',
    tagline: 'Velocity is your only personality trait.',
    description: 'You navigate the web like you have 83 tabs open, caffeine in your bloodstream, and a meeting that started two minutes ago. You rarely stop to admire the scenery; you are here to click and conquer.',
    quote: '"Why hover for 100ms when you can cross the entire 4K viewport in four frames?"',
    accentColor: '#f59e0b', // Amber
    badge: 'Hyper-Kinetic',
    traits: ['Velocity Addict', 'Microsecond Reflexes', 'Fidget Spinner Energy', 'Tab Hoarder'],
    quirks: [
      'Accidentally drags selected text across half the screen',
      'Closes popups before reading what they actually offered',
      'Cannot bear to watch someone else screenshare slowly'
    ],
    compatibility: 'The Pixel Surgeon (they keep you from crashing)',
    nemesis: 'The Chronic Overthinker (watching them hover gives you hives)',
    customStats: [
      { label: 'Viewport Transit', value: '< 18ms', hint: 'Corner-to-corner dash time' },
      { label: 'Browser Tab Anxiety', value: '98.4%', hint: 'Restless multi-tasking index' },
      { label: 'Patience Threshold', value: '0.04 sec', hint: 'Before rage-refreshing' }
    ],
    idealScores: { energy: 94, precision: 50, chaos: 45, patience: 10, exploration: 65 }
  },

  overthinker: {
    id: 'overthinker',
    title: 'The Chronic Overthinker',
    codename: 'PHILOSOPHY_404',
    tagline: 'Every click is an existential dilemma.',
    description: 'Your cursor approaches interactive elements with the cautious delicacy of a bomb-defusal specialist. You pause, you ponder, you question whether that button is truly what you want in life.',
    quote: '"If I click Submit, is there truly any going back? What is state, anyway?"',
    accentColor: '#818cf8', // Indigo
    badge: 'Contemplative Mind',
    traits: ['Deep Hesitation', 'Micro-Hovering', 'Zero Recklessness', 'Analytical Stare'],
    quirks: [
      'Hovers over the CTA for 4.2 seconds before committing',
      'Moves cursor away, re-reads the label, then moves back',
      'Secretly wishes every button had an "Are you sure?" confirmation dialog'
    ],
    compatibility: 'The Viewport Explorer (they understand the value of patience)',
    nemesis: 'The Chaos Agent (their trajectory makes your head hurt)',
    customStats: [
      { label: 'Avg Hover Hesitation', value: '3.8 sec', hint: 'Contemplating button destiny' },
      { label: 'Second-Guess Ratio', value: '87.2%', hint: 'Approaching and retreating' },
      { label: 'Confirmation Craving', value: '10/10', hint: 'Needs 3 dialogs to feel safe' }
    ],
    idealScores: { energy: 20, precision: 65, chaos: 18, patience: 96, exploration: 35 }
  },

  chaos: {
    id: 'chaos',
    title: 'The Chaos Agent',
    codename: 'ENTROPY_OVERFLOW',
    tagline: 'Like an angry moth trapped inside a monitor.',
    description: 'Your trajectory defies the laws of Euclidean geometry and human logic. Sharp turns, erratic loops, random sudden stops, and instant reversals. If UI designers feared anything, it would be your cursor trace.',
    quote: '"Normal paths are a social construct. Let us draw an agitated spiral instead."',
    accentColor: '#ec4899', // Pink
    badge: 'Pure Anarchy',
    traits: ['Erratic Trajectories', 'Unpredictable Swerves', 'Quantum Jitter', 'Anti-Linear'],
    quirks: [
      'Swings cursor in violent circles while waiting for a page to load',
      'Triggers 14 hover tooltips at once just to watch them collide',
      'Leaves the cursor resting right in the middle of fullscreen video subtitles'
    ],
    compatibility: 'Nobody (you are an untamable digital hurricane)',
    nemesis: 'The Pixel Surgeon (you cause them actual physical distress)',
    customStats: [
      { label: 'Trajectory Entropy', value: '9.9 / 10', hint: 'Non-Euclidean trajectory score' },
      { label: 'Angry Moth Index', value: '96.5%', hint: 'Erratic directional flailing' },
      { label: 'Predictability', value: '0.0%', hint: 'Even AI cannot guess your next pixel' }
    ],
    idealScores: { energy: 82, precision: 12, chaos: 98, patience: 14, exploration: 72 }
  },

  perfectionist: {
    id: 'perfectionist',
    title: 'The Pixel Surgeon',
    codename: 'VECTOR_ALIGNED',
    tagline: 'Ruler-straight lines and zero wasted photons.',
    description: 'Your cursor moves with surgical, calculated efficiency. Straight diagonal paths, crisp deceleration curves, and an uncanny ability to land directly on the dead center of buttons.',
    quote: '"A straight line is the shortest distance between intent and execution."',
    accentColor: '#10b981', // Emerald
    badge: 'Sub-Pixel Precision',
    traits: ['Calculated Trajectory', 'Perfect Centering', 'Zero Jitter', 'Mathematical Calm'],
    quirks: [
      'Subconsciously aligns the cursor tip with text baseline margins',
      'Parks cursor cleanly off-canvas when reading an article',
      'Has never accidentally clicked a misaligned banner ad in their life'
    ],
    compatibility: 'The Speed Demon (you provide the guidance they sorely lack)',
    nemesis: 'The Chaos Agent (the sheer lack of vector symmetry is criminal)',
    customStats: [
      { label: 'Sub-Pixel Centering', value: '98.1%', hint: 'Direct dead-center button targeting' },
      { label: 'Wasted Vector Drift', value: '0.04%', hint: 'Near-zero accidental deviation' },
      { label: 'Geometric Purity', value: 'A++', hint: 'Straight-line mathematical grace' }
    ],
    idealScores: { energy: 48, precision: 98, chaos: 8, patience: 60, exploration: 42 }
  },

  explorer: {
    id: 'explorer',
    title: 'The Viewport Explorer',
    codename: 'CARTOGRAPHER_CORE',
    tagline: 'No corner left uninspected.',
    description: 'You treat every webpage like an open-world RPG map. You check the bottom-left footer, you glide across the right gutter, you test whether the logo has an Easter egg. Curiosity is your browser fuel.',
    quote: '"Who designs whitespace if not for curious cursors to stroll through?"',
    accentColor: '#06b6d4', // Cyan
    badge: 'Perimeter Cartographer',
    traits: ['Wanderlust', 'Perimeter Inspector', 'Easter Egg Hunter', 'Spatial Awareness'],
    quirks: [
      'Has checked whether the copyright notice year is up-to-date',
      'Inspects blank white margins to verify padding consistency',
      'Highlights text in rhythmic waves while reading along'
    ],
    compatibility: 'The Chronic Overthinker (you take your time together)',
    nemesis: 'The Zen Minimalist (they move so little it bores you)',
    customStats: [
      { label: 'Viewport Roamed', value: '4/4 Quadrants', hint: 'Every screen corner surveyed' },
      { label: 'Margin Inspection', value: 'Extensive', hint: 'Searching for hidden interactive easter eggs' },
      { label: 'Curiosity Quotient', value: '94%', hint: 'Willingness to wander anywhere' }
    ],
    idealScores: { energy: 58, precision: 62, chaos: 30, patience: 45, exploration: 97 }
  },

  minimalist: {
    id: 'minimalist',
    title: 'The Zen Minimalist',
    codename: 'ZERO_KINETIC',
    tagline: 'Conserving thermodynamic kinetic energy.',
    description: 'Why move when you can be still? Your cursor sits peacefully like a meditating monk. You do not twitch, you do not wander, and you only nudge the pointer when absolutely dictated by the cosmos.',
    quote: '"The greatest movement is the movement not taken."',
    accentColor: '#a855f7', // Purple
    badge: 'Kinetic Stoic',
    traits: ['Energy Conservation', 'Laser Economy', 'Stone Calm', 'Zero Fidget'],
    quirks: [
      'Cursor rests stationary for so long the OS thinks you went to sleep',
      'Uses keyboard shortcuts for everything whenever possible',
      'Refuses to indulge meaningless UI animations'
    ],
    compatibility: 'The Pixel Surgeon (you both honor precision)',
    nemesis: 'The Chaos Agent (their restless shaking exhausts you just looking at it)',
    customStats: [
      { label: 'Kinetic Conservation', value: '99.2%', hint: 'Zero wasted muscle twitches' },
      { label: 'Mousepad Wear & Tear', value: 'Negligible', hint: 'Friction coefficient: ~0.00' },
      { label: 'Shortcut Dependency', value: '95%', hint: 'Prefers keyboard keys over mouse drags' }
    ],
    idealScores: { energy: 12, precision: 78, chaos: 6, patience: 99, exploration: 14 }
  },

  clicker: {
    id: 'clicker',
    title: 'The Click-Happy Fiend',
    codename: 'SWITCH_CLICKER_9000',
    tagline: 'If it exists in the DOM, it must be clicked.',
    description: 'You cannot keep your fingers still. You click on blank whitespace, double-click on random paragraphs, and tap your mouse button like a morse code operator under heavy caffeine influence.',
    quote: '"If you didn\'t want me to click on empty background, why did you render it?"',
    accentColor: '#ef4444', // Red
    badge: 'Tactile Sensory',
    traits: ['Restless Index Finger', 'Rhythmic Tapper', 'Whitespace Clicker', 'Highlight Strummer'],
    quirks: [
      'Constantly triple-clicks paragraphs just to see them highlighted in blue',
      'Spams the mouse button when a link takes 0.3s longer to load',
      'Probably owns a mechanical mouse with loud optical switches'
    ],
    compatibility: 'The Speed Demon (you both keep the APM high)',
    nemesis: 'The Zen Minimalist (your click racket breaks their inner peace)',
    customStats: [
      { label: 'Tactile Click Cadence', value: 'High APM', hint: 'Index finger fidget frequency' },
      { label: 'Whitespace Mercy', value: '0.0%', hint: 'Will click blank CSS backgrounds for fun' },
      { label: 'Switch Lifespan', value: 'Under Threat', hint: 'Omron 50M switch durability tested' }
    ],
    idealScores: { energy: 78, precision: 35, chaos: 68, patience: 18, exploration: 50 }
  },

  touchGymnast: {
    id: 'touchGymnast',
    title: 'The Glass Gymnast',
    codename: 'TOUCH_ACROBAT',
    tagline: 'Master of the Gorilla Glass realm.',
    description: 'You navigate glass with fluid swipes, rapid momentum flicks, and thumb coordination that would impress high-frequency trading algorithms. You do not merely scroll; you orchestrate.',
    quote: '"Mice are relics of the desktop stone age. Glass is my canvas."',
    accentColor: '#38bdf8', // Light Blue
    badge: 'Haptic Maestro',
    traits: ['Thumb Virtuoso', 'Flick Velocity', 'Rapid Tap-Dancer', 'Mobile Native'],
    quirks: [
      'Can scroll through 500 lines of feeds with a single thumb flick',
      'Types faster with two thumbs than most people do on full mechanical keyboards',
      'Screenshots memes in 0.12 seconds'
    ],
    compatibility: 'The Speed Demon',
    nemesis: 'Websites that are not mobile-optimized',
    customStats: [
      { label: 'Thumb Flick Inertia', value: '2,400 px/s', hint: 'Gorilla Glass swipe velocity' },
      { label: 'Screen Smudge Index', value: 'Moderate', hint: 'Oleophobic coating under test' },
      { label: 'Pinch & Zoom Agility', value: 'Pro', hint: 'Two-thumb multi-touch mastery' }
    ],
    idealScores: { energy: 85, precision: 55, chaos: 40, patience: 30, exploration: 70 }
  }
};
