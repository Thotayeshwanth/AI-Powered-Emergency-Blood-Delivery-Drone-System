import React from 'react';
import { ArrowUp } from 'lucide-react';
import { useScrollEffects } from '../../hooks/useScrollEffects';

export default function ScrollToTopButton() {
  const { showScrollTop, scrollProgress } = useScrollEffects();

  const handleScrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <button
      onClick={handleScrollToTop}
      className="scroll-top-btn"
      aria-label="Scroll back to top of page"
      title="Back to Top"
      style={{
        opacity: showScrollTop ? 1 : 0,
        visibility: showScrollTop ? 'visible' : 'hidden',
        pointerEvents: showScrollTop ? 'auto' : 'none',
        transform: showScrollTop ? 'translateY(0) scale(1)' : 'translateY(20px) scale(0.85)'
      }}
    >
      {/* Mini SVG circular progress ring around the button */}
      <svg
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          transform: 'rotate(-90deg)',
          pointerEvents: 'none'
        }}
        viewBox="0 0 46 46"
      >
        <circle
          cx="23"
          cy="23"
          r="20"
          fill="none"
          stroke="#E2E8F0"
          strokeWidth="2.5"
        />
        <circle
          cx="23"
          cy="23"
          r="20"
          fill="none"
          stroke="#D2252F"
          strokeWidth="2.5"
          strokeDasharray="125.6"
          strokeDashoffset={125.6 - (125.6 * (scrollProgress || 0)) / 100}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.15s ease-out' }}
        />
      </svg>

      <ArrowUp size={20} strokeWidth={2.4} />
    </button>
  );
}
