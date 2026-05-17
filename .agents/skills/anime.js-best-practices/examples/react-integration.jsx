/**
 * anime.js v4 React/Next.js Integration Examples
 *
 * Patterns for using anime.js in React applications.
 * All components marked 'use client' for Next.js App Router compatibility.
 */

'use client';

import { useRef, useEffect, useCallback, useState } from 'react';
import { animate, createTimeline, stagger, splitText } from 'animejs';

// =============================================================================
// BASIC HOOKS
// =============================================================================

/**
 * Basic animation hook with cleanup
 */
export function useAnimation(config, deps = []) {
  const elementRef = useRef(null);
  const animationRef = useRef(null);

  useEffect(() => {
    if (elementRef.current) {
      animationRef.current = animate(elementRef.current, config);
    }

    return () => animationRef.current?.cancel();
  }, deps);

  return elementRef;
}

/**
 * Manual trigger animation hook
 */
export function useAnimationTrigger(config) {
  const elementRef = useRef(null);
  const animationRef = useRef(null);

  const trigger = useCallback(() => {
    if (elementRef.current) {
      animationRef.current?.cancel();
      animationRef.current = animate(elementRef.current, config);
    }
  }, [config]);

  useEffect(() => {
    return () => animationRef.current?.cancel();
  }, []);

  return { ref: elementRef, trigger };
}

/**
 * Controllable animation hook
 */
export function useControllableAnimation(config) {
  const elementRef = useRef(null);
  const animationRef = useRef(null);

  useEffect(() => {
    if (elementRef.current) {
      animationRef.current = animate(elementRef.current, {
        ...config,
        autoplay: false
      });
    }

    return () => animationRef.current?.cancel();
  }, [config]);

  const controls = {
    play: () => animationRef.current?.play(),
    pause: () => animationRef.current?.pause(),
    reverse: () => animationRef.current?.reverse(),
    restart: () => animationRef.current?.restart(),
    seek: (time) => animationRef.current?.seek(time)
  };

  return { ref: elementRef, ...controls };
}

// =============================================================================
// ENTRANCE ANIMATION COMPONENTS
// =============================================================================

/**
 * Fade in on mount
 */
export function FadeIn({ children, duration = 600, delay = 0, ...props }) {
  const ref = useAnimation({
    opacity: [0, 1],
    duration,
    delay,
    ease: 'outQuad'
  });

  return (
    <div ref={ref} style={{ opacity: 0 }} {...props}>
      {children}
    </div>
  );
}

/**
 * Slide up and fade in on mount
 */
export function SlideUp({
  children,
  distance = 30,
  duration = 800,
  delay = 0,
  ...props
}) {
  const ref = useAnimation({
    opacity: [0, 1],
    translateY: [distance, 0],
    duration,
    delay,
    ease: 'outExpo'
  });

  return (
    <div ref={ref} style={{ opacity: 0 }} {...props}>
      {children}
    </div>
  );
}

/**
 * Scale in on mount
 */
export function ScaleIn({
  children,
  scale = 0.9,
  duration = 500,
  delay = 0,
  ...props
}) {
  const ref = useAnimation({
    opacity: [0, 1],
    scale: [scale, 1],
    duration,
    delay,
    ease: 'outBack'
  });

  return (
    <div ref={ref} style={{ opacity: 0 }} {...props}>
      {children}
    </div>
  );
}

// =============================================================================
// STAGGERED ANIMATION COMPONENTS
// =============================================================================

/**
 * Stagger children animations
 */
export function StaggerChildren({
  children,
  staggerDelay = 50,
  animation = { opacity: [0, 1], translateY: [20, 0] },
  ...props
}) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (containerRef.current) {
      const items = containerRef.current.children;
      animate(items, {
        ...animation,
        delay: stagger(staggerDelay),
        duration: 600,
        ease: 'outQuad'
      });
    }
  }, [staggerDelay, animation]);

  return (
    <div ref={containerRef} {...props}>
      {children}
    </div>
  );
}

/**
 * Animated list component
 */
export function AnimatedList({ items, renderItem, staggerDelay = 75, ...props }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (containerRef.current) {
      animate(containerRef.current.children, {
        opacity: [0, 1],
        translateX: [-20, 0],
        delay: stagger(staggerDelay),
        duration: 500,
        ease: 'outQuad'
      });
    }
  }, [items, staggerDelay]);

  return (
    <ul ref={containerRef} {...props}>
      {items.map((item, index) => (
        <li key={item.id || index} style={{ opacity: 0 }}>
          {renderItem(item, index)}
        </li>
      ))}
    </ul>
  );
}

// =============================================================================
// INTERACTIVE COMPONENTS
// =============================================================================

/**
 * Hover animation component
 */
export function HoverScale({
  children,
  scale = 1.05,
  duration = 200,
  ...props
}) {
  const ref = useRef(null);

  const handleEnter = () => {
    animate(ref.current, { scale, duration, ease: 'outQuad' });
  };

  const handleLeave = () => {
    animate(ref.current, { scale: 1, duration, ease: 'outQuad' });
  };

  return (
    <div
      ref={ref}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      {...props}
    >
      {children}
    </div>
  );
}

/**
 * Animated button with press effect
 */
export function AnimatedButton({ children, onClick, ...props }) {
  const ref = useRef(null);

  const handleClick = (e) => {
    animate(ref.current, {
      scale: [1, 0.95, 1],
      duration: 200,
      ease: 'outQuad'
    });
    onClick?.(e);
  };

  return (
    <button ref={ref} onClick={handleClick} {...props}>
      {children}
    </button>
  );
}

/**
 * Toggle animation component
 */
export function AnimatedToggle({ isOpen, children, ...props }) {
  const ref = useRef(null);

  useEffect(() => {
    if (ref.current) {
      animate(ref.current, {
        height: isOpen ? [0, ref.current.scrollHeight] : [ref.current.scrollHeight, 0],
        opacity: isOpen ? [0, 1] : [1, 0],
        duration: 300,
        ease: isOpen ? 'outQuad' : 'inQuad'
      });
    }
  }, [isOpen]);

  return (
    <div ref={ref} style={{ overflow: 'hidden' }} {...props}>
      {children}
    </div>
  );
}

// =============================================================================
// TEXT ANIMATION COMPONENTS
// =============================================================================

/**
 * Animated heading with character reveal
 */
export function AnimatedHeading({
  children,
  as: Tag = 'h1',
  staggerDelay = 25,
  ...props
}) {
  const ref = useRef(null);

  useEffect(() => {
    if (ref.current) {
      const { chars } = splitText(ref.current, {
        chars: true,
        accessible: true
      });

      animate(chars, {
        opacity: [0, 1],
        translateY: [30, 0],
        delay: stagger(staggerDelay),
        duration: 600,
        ease: 'outExpo'
      });
    }
  }, [children, staggerDelay]);

  return <Tag ref={ref} {...props}>{children}</Tag>;
}

/**
 * Typewriter effect component
 */
export function Typewriter({ text, speed = 50, ...props }) {
  const ref = useRef(null);
  const [displayText, setDisplayText] = useState('');

  useEffect(() => {
    setDisplayText(text);
  }, [text]);

  useEffect(() => {
    if (ref.current && displayText) {
      const { chars } = splitText(ref.current, { chars: true });

      animate(chars, {
        opacity: [0, 1],
        delay: stagger(speed),
        duration: 1,
        ease: 'steps(1)'
      });
    }
  }, [displayText, speed]);

  return <span ref={ref} {...props}>{displayText}</span>;
}

// =============================================================================
// TIMELINE COMPONENTS
// =============================================================================

/**
 * Timeline-based page entrance
 */
export function PageEntrance({ children }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const tl = createTimeline({
      defaults: { duration: 800, ease: 'outExpo' }
    });

    const header = containerRef.current.querySelector('[data-animate="header"]');
    const content = containerRef.current.querySelector('[data-animate="content"]');
    const sidebar = containerRef.current.querySelector('[data-animate="sidebar"]');

    if (header) {
      tl.add(header, { translateY: [-30, 0], opacity: [0, 1] });
    }
    if (content) {
      tl.add(content, { translateY: [30, 0], opacity: [0, 1] }, '-=600');
    }
    if (sidebar) {
      tl.add(sidebar, { translateX: [-30, 0], opacity: [0, 1] }, '-=600');
    }

    return () => tl.cancel();
  }, []);

  return <div ref={containerRef}>{children}</div>;
}

/**
 * Modal with enter/exit animations
 */
export function AnimatedModal({ isOpen, onClose, children }) {
  const overlayRef = useRef(null);
  const contentRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);

      const tl = createTimeline();

      tl.add(overlayRef.current, {
        opacity: [0, 1],
        duration: 200
      }).add(contentRef.current, {
        scale: [0.9, 1],
        opacity: [0, 1],
        translateY: [20, 0],
        duration: 300,
        ease: 'outExpo'
      }, '-=100');
    } else if (isVisible) {
      const tl = createTimeline();

      tl.add(contentRef.current, {
        scale: [1, 0.9],
        opacity: [1, 0],
        duration: 200,
        ease: 'inQuad'
      }).add(overlayRef.current, {
        opacity: [1, 0],
        duration: 150
      }, '-=100');

      tl.then().then(() => setIsVisible(false));
    }
  }, [isOpen, isVisible]);

  if (!isVisible) return null;

  return (
    <div
      ref={overlayRef}
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: 0
      }}
    >
      <div
        ref={contentRef}
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: 'white',
          borderRadius: 8,
          padding: 24,
          maxWidth: 500,
          width: '90%',
          opacity: 0
        }}
      >
        {children}
      </div>
    </div>
  );
}

// =============================================================================
// SCROLL ANIMATION HOOK
// =============================================================================

/**
 * Intersection Observer based scroll animation
 */
export function useScrollAnimation(config = {}) {
  const ref = useRef(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (!ref.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;

          animate(ref.current, {
            opacity: [0, 1],
            translateY: [30, 0],
            duration: 600,
            ease: 'outExpo',
            ...config
          });

          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(ref.current);

    return () => observer.disconnect();
  }, [config]);

  return ref;
}

/**
 * Scroll reveal component
 */
export function ScrollReveal({
  children,
  animation = { opacity: [0, 1], translateY: [30, 0] },
  threshold = 0.1,
  ...props
}) {
  const ref = useScrollAnimation({ ...animation });

  return (
    <div ref={ref} style={{ opacity: 0 }} {...props}>
      {children}
    </div>
  );
}

// =============================================================================
// USAGE EXAMPLES
// =============================================================================

/*
// Basic entrance animations
<FadeIn>Content fades in</FadeIn>
<SlideUp distance={50}>Slides up from below</SlideUp>
<ScaleIn scale={0.8}>Scales in from smaller</ScaleIn>

// Staggered children
<StaggerChildren staggerDelay={100}>
  <div>Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
</StaggerChildren>

// Animated list
<AnimatedList
  items={[{ id: 1, name: 'Item 1' }, { id: 2, name: 'Item 2' }]}
  renderItem={(item) => <span>{item.name}</span>}
/>

// Interactive elements
<HoverScale scale={1.05}>Hover me</HoverScale>
<AnimatedButton onClick={() => console.log('clicked')}>Click me</AnimatedButton>

// Text animations
<AnimatedHeading>Hello World</AnimatedHeading>
<Typewriter text="Typing effect..." speed={30} />

// Modal
const [isOpen, setIsOpen] = useState(false);
<AnimatedModal isOpen={isOpen} onClose={() => setIsOpen(false)}>
  Modal content
</AnimatedModal>

// Scroll reveal
<ScrollReveal>This appears when scrolled into view</ScrollReveal>

// Page entrance with data attributes
<PageEntrance>
  <header data-animate="header">Header</header>
  <main data-animate="content">Content</main>
  <aside data-animate="sidebar">Sidebar</aside>
</PageEntrance>
*/
