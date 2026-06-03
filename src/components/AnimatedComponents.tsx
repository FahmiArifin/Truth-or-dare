import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

/**
 * Custom hook to detect system preference for reduced motion.
 * Ensures strict compliance with WCAG accessibility guidelines.
 */
export function usePrefersReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const listener = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };

    // Modern browsers support addEventListener
    mediaQuery.addEventListener('change', listener);
    return () => {
      mediaQuery.removeEventListener('change', listener);
    };
  }, []);

  return prefersReducedMotion;
}

interface PageTransitionProps {
  children: React.ReactNode;
  className?: string;
  id?: string;
}

/**
 * Snappy screen transition component that translates subtly or fades
 * directly depending on system reduces motion parameters.
 */
export function PageTransition({ children, className, id }: PageTransitionProps) {
  const prefersReducedMotion = usePrefersReducedMotion();

  const variants = {
    initial: {
      opacity: 0,
      y: prefersReducedMotion ? 0 : 15,
    },
    animate: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.25,
        ease: 'easeOut',
      },
    },
    exit: {
      opacity: 0,
      y: prefersReducedMotion ? 0 : -15,
      transition: {
        duration: 0.2,
        ease: 'easeIn',
      },
    },
  };

  return (
    <motion.div
      id={id}
      variants={variants}
      initial="initial"
      animate="animate"
      exit="exit"
      className={className}
      layout="position"
    >
      {children}
    </motion.div>
  );
}

interface AnimatedCardProps {
  children: React.ReactNode;
  className?: string;
  cardId?: string;
}

/**
 * Reactive 3D-Flip & Scale-up Tactile Card reveal animation.
 * Snappily enters when a new cards is selected. Falls back to a
 * simple clean fade if user prefers minor/reduced motion.
 */
export function AnimatedCard({ children, className, cardId }: AnimatedCardProps) {
  const prefersReducedMotion = usePrefersReducedMotion();

  const cardVariants = {
    initial: {
      opacity: 0,
      scale: prefersReducedMotion ? 1 : 0.93,
      y: prefersReducedMotion ? 0 : 25,
      rotateX: prefersReducedMotion ? 0 : 12,
    },
    animate: {
      opacity: 1,
      scale: 1,
      y: 0,
      rotateX: 0,
      transition: {
        type: 'spring',
        damping: 16,
        stiffness: 110,
        mass: 0.8,
        duration: 0.35,
      },
    },
  };

  return (
    <div className="w-full relative" style={{ perspective: prefersReducedMotion ? undefined : 1000 }}>
      {/* Container element preserves focus stability while animating visually inside */}
      <motion.div
        key={cardId}
        variants={cardVariants}
        initial="initial"
        animate="animate"
        className={className}
      >
        {children}
      </motion.div>
    </div>
  );
}

interface AnimatedTextSwitcherProps {
  text: string;
  tone: 'formal' | 'casual';
  className?: string;
}

/**
 * Smooth Cross-Fade and minimal slide container for switching text variants,
 * with fully integrated aria-live support to guarantee screen reader announcements
 * are triggered instantly on payload variations.
 */
export function AnimatedTextSwitcher({ text, tone, className }: AnimatedTextSwitcherProps) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const activeKey = `${tone}-${text.slice(0, 15)}`;

  const textVariants = {
    initial: {
      opacity: 0,
      y: prefersReducedMotion ? 0 : 6,
    },
    animate: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.22,
        ease: 'easeOut',
      },
    },
    exit: {
      opacity: 0,
      y: prefersReducedMotion ? 0 : -6,
      transition: {
        duration: 0.18,
        ease: 'easeIn',
      },
    },
  };

  return (
    <div className="relative overflow-visible" aria-live="polite">
      <AnimatePresence mode="wait" initial={false}>
        <motion.p
          key={activeKey}
          variants={textVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          className={className}
        >
          {text}
        </motion.p>
      </AnimatePresence>
    </div>
  );
}

interface TapButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  id?: string;
  className?: string;
}

/**
 * Fully accessible interactive Button component equipped with an organic,
 * feedback reactive "whileTap" spring scaling visual hook. Respects user prefers-reduced-motion settings.
 */
export const TapButton = React.forwardRef<HTMLButtonElement, TapButtonProps>(
  ({ children, id, className, ...props }, ref) => {
    const prefersReducedMotion = usePrefersReducedMotion();

    return (
      <motion.button
        id={id}
        ref={ref}
        className={className}
        whileHover={prefersReducedMotion ? {} : { scale: 1.012 }}
        whileTap={prefersReducedMotion ? {} : { scale: 0.965 }}
        transition={{ type: 'spring', stiffness: 350, damping: 20 }}
        {...props}
      >
        {children}
      </motion.button>
    );
  }
);

TapButton.displayName = 'TapButton';
