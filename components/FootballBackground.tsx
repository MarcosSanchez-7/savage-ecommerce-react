import { useEffect, useRef, useMemo } from 'react';
import gsap from 'gsap';

// --- Config ---
const BALL_COUNT = 14;
const WORDS = ['GOOL', 'GOAL', '⚽', 'GOLAZO', 'GOOL', '⚽', 'GOAL'];
const GOLD = 'rgba(212,175,55,1)';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  alpha: number;
}

const FootballBackground: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);

  // Stable random data for balls (computed once)
  const balls = useMemo(
    () =>
      Array.from({ length: BALL_COUNT }, (_, i) => ({
        left: `${((i % 7) / 6) * 90 + 5}%`,
        top: `${Math.floor(i / 7) * 45 + (i % 2 === 0 ? 5 : 55)}%`,
        fontSize: `${1 + (i % 3) * 0.5}rem`,
        opacity: 0.05 + (i % 4) * 0.012,
      })),
    []
  );

  // Stable random data for words (computed once)
  const wordStyles = useMemo(
    () =>
      WORDS.map((_, i) => ({
        fontSize: `${2.5 + (i % 3) * 0.8}rem`,
      })),
    []
  );

  // ---------- GSAP: floating balls + word flashes ----------
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const ctx = gsap.context(() => {
      // Floating balls
      const ballEls = gsap.utils.toArray<HTMLElement>('.fb-ball', container);
      ballEls.forEach((ball) => {
        gsap.set(ball, {
          x: gsap.utils.random(-12, 12),
          y: gsap.utils.random(-12, 12),
          rotation: gsap.utils.random(0, 360),
        });
        gsap.to(ball, {
          x: gsap.utils.random(-35, 35),
          y: gsap.utils.random(-45, 45),
          rotation: `+=${gsap.utils.random(80, 220)}`,
          duration: gsap.utils.random(7, 15),
          ease: 'sine.inOut',
          repeat: -1,
          yoyo: true,
        });
      });

      // Word flashes
      const wordEls = gsap.utils.toArray<HTMLElement>('.fb-word', container);
      wordEls.forEach((word) => {
        const flash = () => {
          gsap.set(word, {
            x: `${gsap.utils.random(5, 85)}vw`,
            y: `${gsap.utils.random(5, 88)}vh`,
            rotation: gsap.utils.random(-20, 20),
          });
          gsap.fromTo(
            word,
            { autoAlpha: 0, scale: 0.75 },
            {
              autoAlpha: gsap.utils.random(0.05, 0.1),
              scale: 1,
              duration: 1.1,
              ease: 'power2.out',
              onComplete: () => {
                gsap.to(word, {
                  autoAlpha: 0,
                  scale: 1.08,
                  duration: 1.3,
                  ease: 'power1.in',
                  delay: gsap.utils.random(1.5, 4.5),
                  onComplete: () =>
                    setTimeout(flash, gsap.utils.random(300, 3500)),
                });
              },
            }
          );
        };
        setTimeout(flash, gsap.utils.random(0, 7000));
      });

      // Scanline sweep (top → bottom, subtle golden shimmer)
      gsap.to('.fb-scanline', {
        yPercent: 120,
        duration: 4.5,
        ease: 'none',
        repeat: -1,
        repeatDelay: 7,
      });
    }, container);

    return () => ctx.revert();
  }, []);

  // ---------- Canvas: particle field ----------
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const ctx2d = canvas.getContext('2d')!;
    const particles: Particle[] = Array.from({ length: 40 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * 0.28,
      vy: (Math.random() - 0.5) * 0.28,
      radius: Math.random() * 1.4 + 0.4,
      alpha: Math.random() * 0.055 + 0.018,
    }));

    const draw = () => {
      ctx2d.clearRect(0, 0, canvas.width, canvas.height);

      // Particles
      particles.forEach((p) => {
        p.x = (p.x + p.vx + canvas.width) % canvas.width;
        p.y = (p.y + p.vy + canvas.height) % canvas.height;
        ctx2d.beginPath();
        ctx2d.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx2d.fillStyle = `rgba(212,175,55,${p.alpha})`;
        ctx2d.fill();
      });

      // Connecting lines
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 110) {
            ctx2d.beginPath();
            ctx2d.moveTo(particles[i].x, particles[i].y);
            ctx2d.lineTo(particles[j].x, particles[j].y);
            ctx2d.strokeStyle = `rgba(212,175,55,${0.022 * (1 - dist / 110)})`;
            ctx2d.lineWidth = 0.5;
            ctx2d.stroke();
          }
        }
      }

      animFrameRef.current = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
        overflow: 'hidden',
      }}
    >
      {/* Particle canvas */}
      <canvas
        ref={canvasRef}
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
      />

      {/* Scanline sweep */}
      <div
        className="fb-scanline"
        style={{
          position: 'absolute',
          left: 0,
          top: '-12%',
          width: '100%',
          height: '8%',
          background:
            'linear-gradient(to bottom, transparent, rgba(212,175,55,0.035) 50%, transparent)',
        }}
      />

      {/* Floating balls */}
      {balls.map((b, i) => (
        <div
          key={i}
          className="fb-ball"
          style={{
            position: 'absolute',
            left: b.left,
            top: b.top,
            fontSize: b.fontSize,
            opacity: b.opacity,
            userSelect: 'none',
            willChange: 'transform',
          }}
        >
          ⚽
        </div>
      ))}

      {/* Word flashes */}
      {WORDS.map((word, i) => (
        <span
          key={i}
          className="fb-word"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            fontFamily: "'Arial Black', Arial, sans-serif",
            fontWeight: 900,
            fontSize: wordStyles[i].fontSize,
            letterSpacing: '0.18em',
            color: GOLD,
            userSelect: 'none',
            whiteSpace: 'nowrap',
            visibility: 'hidden',
            willChange: 'transform, opacity',
          }}
        >
          {word}
        </span>
      ))}
    </div>
  );
};

export default FootballBackground;
