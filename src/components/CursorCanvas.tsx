import React, { useEffect, useRef } from 'react';
import { soundFx } from '../shared/sound';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  life: number;
  maxLife: number;
}

interface Ring {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  alpha: number;
  color: string;
}

interface CursorCanvasProps {
  interactive: boolean;
  onPointerData?: (data: {
    x: number;
    y: number;
    speed: number;
    angleDelta: number;
    isClick: boolean;
    isPause: boolean;
  }) => void;
}

export const CursorCanvas: React.FC<CursorCanvasProps> = ({ interactive, onPointerData }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const ringsRef = useRef<Ring[]>([]);
  const trailRef = useRef<{ x: number; y: number; age: number; speed: number; hue: number }[]>([]);
  const lastPosRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const currentPosRef = useRef<{ x: number; y: number } | null>(null);
  const lastAngleRef = useRef<number | null>(null);
  const lastSoundTimeRef = useRef<number>(0);
  const hueRef = useRef<number>(200);

  // Set up Canvas and Global Event Listeners on WINDOW so it covers the ENTIRE viewport
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // Global Pointer Move Listener
    const onWindowPointerMove = (e: PointerEvent) => {
      if (!interactive) return;

      const now = performance.now();
      const currentX = e.clientX;
      const currentY = e.clientY;
      currentPosRef.current = { x: currentX, y: currentY };

      let speed = 0;
      let angleDelta = 0;

      if (lastPosRef.current) {
        const dx = currentX - lastPosRef.current.x;
        const dy = currentY - lastPosRef.current.y;
        const dt = Math.max(1, now - lastPosRef.current.time);
        const dist = Math.hypot(dx, dy);
        speed = (dist / dt) * 1000; // px/sec

        if (dist > 3) {
          const currentAngle = Math.atan2(dy, dx);
          if (lastAngleRef.current !== null) {
            let diff = Math.abs(currentAngle - lastAngleRef.current);
            if (diff > Math.PI) diff = 2 * Math.PI - diff;
            angleDelta = (diff * 180) / Math.PI;
          }
          lastAngleRef.current = currentAngle;
        }

        // Sound triggers
        if (speed > 1800 && now - lastSoundTimeRef.current > 280) {
          soundFx.swoosh();
          lastSoundTimeRef.current = now;
        } else if (speed > 550 && now - lastSoundTimeRef.current > 100) {
          soundFx.tick(Math.min(900, 420 + speed * 0.25));
          lastSoundTimeRef.current = now;
        }
      }

      lastPosRef.current = { x: currentX, y: currentY, time: now };

      // Cycle chromatic hue continuously
      hueRef.current = (hueRef.current + (speed > 500 ? 4 : 1.5)) % 360;

      // Add to trail
      trailRef.current.push({
        x: currentX,
        y: currentY,
        age: 0,
        speed,
        hue: hueRef.current
      });

      // Spawn vibrant particles based on movement
      const sparkCount = speed > 1200 ? 4 : speed > 400 ? 2 : 1;
      for (let i = 0; i < sparkCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const velocity = Math.random() * 2.5 + (speed > 1000 ? 2 : 0.6);
        const pColor = `hsl(${hueRef.current + (Math.random() - 0.5) * 40}, 90%, 65%)`;

        particlesRef.current.push({
          x: currentX + (Math.random() - 0.5) * 6,
          y: currentY + (Math.random() - 0.5) * 6,
          vx: Math.cos(angle) * velocity,
          vy: Math.sin(angle) * velocity,
          size: Math.random() * 3.5 + 1.5,
          color: pColor,
          alpha: 1,
          life: 0,
          maxLife: Math.floor(Math.random() * 28 + 16)
        });
      }

      onPointerData?.({
        x: currentX,
        y: currentY,
        speed,
        angleDelta,
        isClick: false,
        isPause: speed < 30
      });
    };

    // Global Pointer Down (Click / Tap)
    const onWindowPointerDown = (e: PointerEvent) => {
      if (!interactive) return;
      soundFx.click();

      // Spawn expanding shockwave ring
      ringsRef.current.push({
        x: e.clientX,
        y: e.clientY,
        radius: 6,
        maxRadius: 65,
        alpha: 0.9,
        color: `hsl(${hueRef.current}, 95%, 65%)`
      });

      // Spawn radial burst particles
      for (let i = 0; i < 20; i++) {
        const angle = (i / 20) * Math.PI * 2 + (Math.random() - 0.5) * 0.3;
        const velocity = Math.random() * 4.5 + 2;
        particlesRef.current.push({
          x: e.clientX,
          y: e.clientY,
          vx: Math.cos(angle) * velocity,
          vy: Math.sin(angle) * velocity,
          size: Math.random() * 4 + 2,
          color: `hsl(${(hueRef.current + i * 15) % 360}, 95%, 65%)`,
          alpha: 1,
          life: 0,
          maxLife: 32
        });
      }

      onPointerData?.({
        x: e.clientX,
        y: e.clientY,
        speed: 0,
        angleDelta: 0,
        isClick: true,
        isPause: false
      });
    };

    window.addEventListener('pointermove', onWindowPointerMove);
    window.addEventListener('pointerdown', onWindowPointerDown);

    // 60 FPS Render Loop
    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // 1. Soft glowing cursor spotlight aura around current pointer
      if (currentPosRef.current) {
        const { x, y } = currentPosRef.current;
        const auraGrad = ctx.createRadialGradient(x, y, 0, x, y, 140);
        auraGrad.addColorStop(0, `hsla(${hueRef.current}, 85%, 60%, 0.16)`);
        auraGrad.addColorStop(0.5, `hsla(${hueRef.current}, 85%, 60%, 0.05)`);
        auraGrad.addColorStop(1, 'transparent');
        ctx.fillStyle = auraGrad;
        ctx.beginPath();
        ctx.arc(x, y, 140, 0, Math.PI * 2);
        ctx.fill();
      }

      // 2. Render shockwave rings
      const rings = ringsRef.current;
      for (let i = rings.length - 1; i >= 0; i--) {
        const r = rings[i];
        r.radius += 2.8;
        r.alpha = Math.max(0, 1 - r.radius / r.maxRadius);

        if (r.radius >= r.maxRadius) {
          rings.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.strokeStyle = r.color;
        ctx.lineWidth = 2.5;
        ctx.globalAlpha = r.alpha;
        ctx.shadowColor = r.color;
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }

      // 3. Render glowing chromatic ribbon trail
      const trail = trailRef.current;
      for (let i = trail.length - 1; i >= 0; i--) {
        trail[i].age += 1;
        if (trail[i].age > 28) {
          trail.splice(i, 1);
        }
      }

      if (trail.length > 2) {
        ctx.save();
        for (let i = 1; i < trail.length; i++) {
          const p1 = trail[i - 1];
          const p2 = trail[i];
          const factor = Math.max(0, 1 - p2.age / 28);
          const alpha = factor * 0.85;
          const width = Math.max(1.5, factor * 8);

          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.strokeStyle = `hsla(${p2.hue}, 90%, 65%, ${alpha})`;
          ctx.lineWidth = width;
          ctx.lineCap = 'round';
          ctx.shadowColor = `hsl(${p2.hue}, 90%, 65%)`;
          ctx.shadowBlur = 14;
          ctx.stroke();
        }
        ctx.restore();
      }

      // 4. Render active particles & sparks
      const particles = particlesRef.current;
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life++;
        p.alpha = Math.max(0, 1 - p.life / p.maxLife);

        if (p.life >= p.maxLife) {
          particles.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * (1 - p.life / p.maxLife), 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', onWindowPointerMove);
      window.removeEventListener('pointerdown', onWindowPointerDown);
    };
  }, [interactive, onPointerData]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[25] block w-full h-full"
    />
  );
};
