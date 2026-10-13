import { useState, useEffect, useRef } from 'react';

export function useScrollEffects() {
  const [scrollY, setScrollY] = useState(0);
  const [scrollDirection, setScrollDirection] = useState('up');
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isCompact, setIsCompact] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  const lastScrollYRef = useRef(0);

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;
          const prevScrollY = lastScrollYRef.current;
          
          // Calculate scroll progress percentage (0 - 100)
          const docHeight = document.documentElement.scrollHeight - window.innerHeight;
          const progress = docHeight > 0 ? Math.min(100, Math.max(0, (currentScrollY / docHeight) * 100)) : 0;
          setScrollProgress(progress);

          // Detect scroll direction (with 4px threshold to ignore micro-jitters)
          if (Math.abs(currentScrollY - prevScrollY) > 4) {
            if (currentScrollY > prevScrollY && currentScrollY > 60) {
              setScrollDirection('down');
            } else if (currentScrollY < prevScrollY) {
              setScrollDirection('up');
            }
          }

          setScrollY(currentScrollY);
          setIsScrolled(currentScrollY > 15);
          setIsCompact(currentScrollY > 60);
          setShowScrollTop(currentScrollY > 300);

          lastScrollYRef.current = currentScrollY;
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // initialize

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return {
    scrollY,
    scrollDirection,
    scrollProgress,
    isCompact,
    isScrolled,
    showScrollTop
  };
}

// Hook to observe and reveal elements as they enter the screen
export function useScrollReveal() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.08,
        rootMargin: '0px 0px -30px 0px'
      }
    );

    const observeElements = () => {
      const elements = document.querySelectorAll('.scroll-reveal:not(.is-visible)');
      elements.forEach((el) => observer.observe(el));
    };

    observeElements();
    const timer = setTimeout(observeElements, 150);

    return () => {
      clearTimeout(timer);
      observer.disconnect();
    };
  }, []);
}
