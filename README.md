# 🖱️ Cursona — Judge My Cursor
> **We are definitely not judging you.**  
> A playful psychological experiment that analyzes non-sensitive pointer trajectory, velocity, jitter, and hesitation to diagnose your digital archetype.

Built by [@mnk17arts](https://github.com/mnk17arts).

[![Deploy to GitHub Pages](https://github.com/mnk17arts/cursona/actions/workflows/deploy.yml/badge.svg)](https://github.com/mnk17arts/cursona/actions/workflows/deploy.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-indigo.svg)](https://opensource.org/licenses/MIT)

---

## 🌐 Live Demo

👉 **[https://mnk17arts.github.io/cursona/](https://mnk17arts.github.io/cursona/)**

---

## ✨ What is Cursona?

Most websites treat cursor movements as mere coordinates. **Cursona** treats pointer motion as digital behavioral body language.

During an 8-second observation window, the client-side engine computes real-time sensory telemetry:
- **Velocity & Acceleration:** Average speed, bursts, and inertia.
- **Directional Entropy:** Sharp reversal frequency (>110°) and trajectory jitter.
- **Hesitation & Pauses:** Contemplative stops, micro-hovering, and longest rest durations.
- **Spatial Roam:** Viewport quadrant coverage and perimeter inspection.
- **Tactile Cadence:** Click and tap frequency.

It then classifies your behavior via 5D vector distance matching into one of 8 memorable archetypes, complete with a live trajectory path replay, physical telemetry receipt, diagnosed quirks, and downloadable PNG cards.

---

## 🧠 The 8 Digital Archetypes

| Archetype | Codename | Core Energy | Key Quirk |
|---|---|:---:|---|
| **The Speed Demon** | `PROJECT_WARP_SPEED` | ⚡ Hyper-Kinetic | Navigates like they have 83 open tabs and 2 minutes to live. |
| **The Chronic Overthinker** | `PHILOSOPHY_404` | 🤔 Contemplative | Approaches buttons with bomb-defusal caution. |
| **The Chaos Agent** | `ENTROPY_OVERFLOW` | 🌀 Pure Anarchy | Trajectory resembles an angry moth trapped in a monitor. |
| **The Pixel Surgeon** | `VECTOR_ALIGNED` | 🎯 Sub-Pixel Precision | Ruler-straight lines and zero wasted photons. |
| **The Viewport Explorer** | `CARTOGRAPHER_CORE` | 🗺️ Wanderlust | Treats every page like an open-world RPG map. |
| **The Zen Minimalist** | `ZERO_KINETIC` | 🟣 Kinetic Stoic | Why move when you can be still? Conserving entropy. |
| **The Click-Happy Fiend** | `SWITCH_CLICKER_9000` | 🔴 Tactile Restless | Digital fidget spinner; clicks whitespace while thinking. |
| **The Glass Gymnast** | `TOUCH_ACROBAT` | 📱 Haptic Maestro | Master of mobile thumb acrobatics and momentum flicks. |

---

## 🛠️ Tech Stack & Architecture

- **Framework:** React 19 + TypeScript + Vite 8
- **Styling:** Tailwind CSS v4 + Vanilla CSS animations
- **Graphics & Physics:** HTML5 Canvas 2D ribbon trail, spark particle physics, and live path replay at 60 FPS
- **Audio:** Pure browser Web Audio API procedural sound synthesizer (0 external audio files)
- **Icons:** Lucide React
- **Celebration:** Canvas Confetti
- **Deployment:** GitHub Pages automated via GitHub Actions (Zero cost, static bundle)

---

## 💻 Running Locally

```bash
# Clone the repository
git clone https://github.com/mnk17arts/cursona.git

# Navigate to project directory
cd cursona

# Install dependencies
npm install

# Start local dev server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🚀 Deploying to GitHub Pages

1. Create a repository named `cursona` under your GitHub account (`mnk17arts`).
2. Push this project to the repository:
   ```bash
   git remote set-url origin https://github.com/mnk17arts/cursona.git
   git branch -M main
   git push -u origin main
   ```
3. In GitHub repo **Settings → Pages**:
   - Under **Build and deployment → Source**, choose **GitHub Actions**.
4. The workflow in `.github/workflows/deploy.yml` will automatically build and publish the site to:  
   `https://mnk17arts.github.io/cursona/`

---

## 📄 License

MIT License. Free for personal and educational use.
