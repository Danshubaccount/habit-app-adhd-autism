import React, { useEffect, useRef } from 'react';
import './Home.css';

interface HomeSelectionProps {
  onSelectGoals: () => void;
  onSelectMindfulness: () => void;
  onSelectJournal: () => void;
}

const Home: React.FC<HomeSelectionProps> = ({
  onSelectGoals,
  onSelectMindfulness,
  onSelectJournal,
}) => {
  const blobRefs = useRef<Array<HTMLDivElement | null>>([]);

  useEffect(() => {
    const desktopPointerMedia = window.matchMedia(
      '(min-width: 760px) and (hover: hover) and (pointer: fine)'
    );
    const reduceMotionMedia = window.matchMedia('(prefers-reduced-motion: reduce)');

    let rafId = 0;
    let active = false;
    let currentX = 0;
    let currentY = 0;
    let targetX = 0;
    let targetY = 0;

    const factors = [
      { x: 9, y: 7 },
      { x: 6, y: -8 },
      { x: -7, y: 5 },
      { x: -10, y: -6 },
    ];

    const applyOffsets = () => {
      blobRefs.current.forEach((blob, index) => {
        if (!blob) return;
        const factor = factors[index] ?? { x: 8, y: 8 };
        blob.style.setProperty('--mx', `${(currentX * factor.x).toFixed(2)}px`);
        blob.style.setProperty('--my', `${(currentY * factor.y).toFixed(2)}px`);
      });
    };

    const animate = () => {
      currentX += (targetX - currentX) * 0.09;
      currentY += (targetY - currentY) * 0.09;
      applyOffsets();

      if (Math.abs(targetX - currentX) > 0.001 || Math.abs(targetY - currentY) > 0.001) {
        rafId = window.requestAnimationFrame(animate);
      } else {
        rafId = 0;
      }
    };

    const startLoop = () => {
      if (rafId) return;
      rafId = window.requestAnimationFrame(animate);
    };

    const onMouseMove = (event: MouseEvent) => {
      const nx = event.clientX / window.innerWidth - 0.5;
      const ny = event.clientY / window.innerHeight - 0.5;
      targetX = nx;
      targetY = ny;
      startLoop();
    };

    const onMouseLeave = () => {
      targetX = 0;
      targetY = 0;
      startLoop();
    };

    const enable = () => {
      if (active) return;
      active = true;
      window.addEventListener('mousemove', onMouseMove, { passive: true });
      window.addEventListener('mouseleave', onMouseLeave, { passive: true });
    };

    const disable = () => {
      if (!active) return;
      active = false;
      targetX = 0;
      targetY = 0;
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseleave', onMouseLeave);
      startLoop();
    };

    const syncMode = () => {
      if (desktopPointerMedia.matches && !reduceMotionMedia.matches) {
        enable();
      } else {
        disable();
      }
    };

    syncMode();
    desktopPointerMedia.addEventListener('change', syncMode);
    reduceMotionMedia.addEventListener('change', syncMode);

    return () => {
      desktopPointerMedia.removeEventListener('change', syncMode);
      reduceMotionMedia.removeEventListener('change', syncMode);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseleave', onMouseLeave);
      if (rafId) {
        window.cancelAnimationFrame(rafId);
      }
    };
  }, []);

  return (
    <div className="live-glass-home">
      <div className="live-glass-bg" aria-hidden="true">
        <div className="live-blob live-blob-1" ref={(el) => { blobRefs.current[0] = el; }} />
        <div className="live-blob live-blob-2" ref={(el) => { blobRefs.current[1] = el; }} />
        <div className="live-blob live-blob-3" ref={(el) => { blobRefs.current[2] = el; }} />
        <div className="live-blob live-blob-4" ref={(el) => { blobRefs.current[3] = el; }} />
      </div>

      <main className="live-glass-card" aria-label="Live glass home panel">
        <p className="live-eyebrow">Live Focus Mode</p>
        <h1>Build momentum with one tiny action.</h1>
        <p className="live-copy">
          Keep your next step obvious and your energy steady with an intentional,
          low-friction interface.
        </p>

        <div className="live-actions">
          <button
            type="button"
            className="live-primary-btn"
            onClick={onSelectMindfulness}
          >
            Start Mindfulness Sprint
          </button>
          <div className="live-secondary-row" aria-label="Quick links">
            <button type="button" className="live-secondary-btn" onClick={onSelectGoals}>
              Goals
            </button>
            <button type="button" className="live-secondary-btn" onClick={onSelectJournal}>
              Journal
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Home;
