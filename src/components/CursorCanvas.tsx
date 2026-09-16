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

    // Unified Movement Handler for both Mouse and Mobile Touch Swipes
    const handleMove = (currentX: number, currentY: number) => {
      if (!interactive) return;

      const now = performance.now();
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

        // Sound triggers on speed bursts
        if (speed > 1600 && now - lastSoundTimeRef.current > 260) {
          soundFx.swoosh();
          lastSoundTimeRef.current = now;
        } else if (speed > 450 && now - lastSoundTimeRef.current > 90) {
          soundFx.tick(Math.min(900, 420 + speed * 0.25));
          lastSoundTimeRef.current = now;
        }
      }

      lastPosRef.current = { x: currentX, y: currentY, time: now };

      // Cycle chromatic hue continuously
      hueRef.current = (hueRef.current + (speed > 500 ? 4.5 : 2)) % 360;

      // Add to trail
      trailRef.current.push({
        x: currentX,
        y: currentY,
        age: 0,
        speed,
        hue: hueRef.current
      });

      // Spawn vibrant particles based on movement
      const sparkCount = speed > 1100 ? 4 : speed > 350 ? 2 : 1;
      for (let i = 0; i < sparkCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const velocity = Math.random() * 2.8 + (speed > 1000 ? 2.2 : 0.8);
        const pColor = `hsl(${hueRef.current + (Math.random() - 0.5) * 40}, 92%, 65%)`;

        particlesRef.current.push({
          x: currentX + (Math.random() - 0.5) * 6,
          y: currentY + (Math.random() - 0.5) * 6,
          vx: Math.cos(angle) * velocity,
          vy: Math.sin(angle) * velocity,
          size: Math.random() * 4 + 2,
          color: pColor,
          alpha: 1,
          life: 0,
          maxLife: Math.floor(Math.random() * 26 + 14)
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

    // Unified Down/Click Handler (tap or mouse down)
    const handleDown = (clientX: number, clientY: number) => {
      if (!interactive) return;
      soundFx.click();

      // Spawn expanding shockwave ring
      ringsRef.current.push({
        x: clientX,
        y: clientY,
        radius: 8,
        maxRadius: 75,
        alpha: 0.95,
        color: `hsl(${hueRef.current}, 95%, 65%)`
      });

      // Spawn radial burst particles
      for (let i = 0; i < 22; i++) {
        const angle = (i / 22) * Math.PI * 2 + (Math.random() - 0.5) * 0.3;
        const velocity = Math.random() * 5 + 2.5;
        particlesRef.current.push({
          x: clientX,
          y: clientY,
          vx: Math.cos(angle) * velocity,
          vy: Math.sin(angle) * velocity,
          size: Math.random() * 4.5 + 2,
          color: `hsl(${(hueRef.current + i * 15) % 360}, 95%, 65%)`,
          alpha: 1,
          life: 0,
          maxLife: 32
        });
      }

      onPointerData?.({
        x: clientX,
        y: clientY,
        speed: 0,
        angleDelta: 0,
        isClick: true,
        isPause: false
      });
    };

    // --- Native Touch Listeners (Guarantees smooth mobile swipe without scroll interference) ---
    const onTouchMove = (e: TouchEvent) => {
      if (!interactive) return;
      if (e.touches.length > 0) {
        // Prevent default browser scrolling so every finger swipe/drag is tracked!
        if (e.cancelable) {
          e.preventDefault();
        }
        const touch = e.touches[0];
        handleMove(touch.clientX, touch.clientY);
      }
    };

    const onTouchStart = (e: TouchEvent) => {
      if (!interactive) return;
      if (e.touches.length > 0) {
        const touch = e.touches[0];
        lastPosRef.current = { x: touch.clientX, y: touch.clientY, time: performance.now() };
        handleDown(touch.clientX, touch.clientY);
      }
    };

    const onTouchEnd = () => {
      lastPosRef.current = null;
    };

    // --- Standard Mouse / Desktop Pointer Listeners ---
    const onPointerMove = (e: PointerEvent) => {
      if (e.pointerType === 'touch') return; // Handled by native touch listeners
      handleMove(e.clientX, e.clientY);
    };

    const onPointerDown = (e: PointerEvent) => {
      if (e.pointerType === 'touch') return; // Handled by native touch listeners
      handleDown(e.clientX, e.clientY);
    };

    // Attach passive: false to touchmove so e.preventDefault() stops default browser scroll
    window.addEventListener('touchmove', onTouchMove, { passive: false });
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchend', onTouchEnd, { passive: true });
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerdown', onPointerDown);

    // 60 FPS Render Loop
    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // 1. Glowing spotlight aura around current pointer / touch point
      if (currentPosRef.current) {
        const { x, y } = currentPosRef.current;
        const auraGrad = ctx.createRadialGradient(x, y, 0, x, y, 150);
        auraGrad.addColorStop(0, `hsla(${hueRef.current}, 90%, 65%, 0.22)`);
        auraGrad.addColorStop(0.5, `hsla(${hueRef.current}, 85%, 60%, 0.07)`);
        auraGrad.addColorStop(1, 'transparent');
        ctx.fillStyle = auraGrad;
        ctx.beginPath();
        ctx.arc(x, y, 150, 0, Math.PI * 2);
        ctx.fill();
      }

      // 2. Render shockwave rings
      const rings = ringsRef.current;
      for (let i = rings.length - 1; i >= 0; i--) {
        const r = rings[i];
        r.radius += 3.2;
        r.alpha = Math.max(0, 1 - r.radius / r.maxRadius);

        if (r.radius >= r.maxRadius) {
          rings.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.strokeStyle = r.color;
        ctx.lineWidth = 3;
        ctx.globalAlpha = r.alpha;
        ctx.shadowColor = r.color;
        ctx.shadowBlur = 14;
        ctx.beginPath();
        ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }

      // 3. Render glowing chromatic ribbon trail
      const trail = trailRef.current;
      for (let i = trail.length - 1; i >= 0; i--) {
        trail[i].age += 1;
        if (trail[i].age > 30) {
          trail.splice(i, 1);
        }
      }

      if (trail.length > 2) {
        ctx.save();
        for (let i = 1; i < trail.length; i++) {
          const p1 = trail[i - 1];
          const p2 = trail[i];
          const factor = Math.max(0, 1 - p2.age / 30);
          const alpha = factor * 0.9;
          const width = Math.max(2, factor * 9);

          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.strokeStyle = `hsla(${p2.hue}, 95%, 65%, ${alpha})`;
          ctx.lineWidth = width;
          ctx.lineCap = 'round';
          ctx.shadowColor = `hsl(${p2.hue}, 95%, 65%)`;
          ctx.shadowBlur = 16;
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
        ctx.shadowBlur = 14;
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
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchend', onTouchEnd);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerdown', onPointerDown);
    };
  }, [interactive, onPointerData]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[25] block w-full h-full touch-none"
    />
  );
};
