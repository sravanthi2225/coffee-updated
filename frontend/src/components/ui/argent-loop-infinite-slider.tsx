import * as React from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export interface ProjectData {
  title: string;
  image: string;
  category: string;
  year: string;
  description: string;
}

// Exactly 3 curated photos (bounded, non-infinite slider)
export const PROJECT_DATA: ProjectData[] = [
  {
    title: 'Single-Origin Pour Over',
    image:
      'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=1600&auto=format&fit=crop',
    category: 'Ethiopian Yirgacheffe',
    year: '2024',
    description: 'Jasmine floral notes & citrus bergamot',
  },
  {
    title: 'Velvet Espresso Crema',
    image:
      'https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?q=80&w=1600&auto=format&fit=crop',
    category: 'Colombian Huila Reserve',
    year: '2024',
    description: 'Honey anaerobic dark roast & toasted hazelnut',
  },
  {
    title: 'Artisan Latte Rosette',
    image:
      'https://images.unsplash.com/photo-1534778101976-62847782c213?q=80&w=1600&auto=format&fit=crop',
    category: 'Signature Microfoam',
    year: '2024',
    description: 'Silky steamed oat milk & chocolate undertone',
  },
];

const CONFIG = {
  SCROLL_SPEED: 0.75,
  LERP_FACTOR: 0.09,
  SNAP_DURATION: 450,
};

// Utility functions
const lerp = (start: number, end: number, factor: number) =>
  start + (end - start) * factor;

interface ArgentLoopInfiniteSliderProps {
  projects?: ProjectData[];
  className?: string;
  triggerRef?: React.RefObject<HTMLElement | null>;
  pinnedRef?: React.RefObject<HTMLDivElement | null>;
  onSlideChange?: (index: number) => void;
}

export function Component({
  projects = PROJECT_DATA,
  className = '',
  triggerRef,
  pinnedRef,
  onSlideChange,
}: ArgentLoopInfiniteSliderProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const dataList = projects && projects.length > 0 ? projects.slice(0, 3) : PROJECT_DATA.slice(0, 3);
  const [activeIndex, setActiveIndex] = React.useState(0);
  const activeIndexRef = React.useRef(0);
  const scrollTriggerRef = React.useRef<ScrollTrigger | null>(null);

  // Refs for animation state
  const state = React.useRef({
    currentProgress: 0, // 0 to -(dataList.length - 1)
    targetProgress: 0,
    isSnapping: false,
    snapStart: { time: 0, progress: 0, target: 0 },
    projectWidth: typeof window !== 'undefined' ? window.innerWidth : 1200,
    minimapWidth: 250,
    minimapCardWidth: 600,
  });

  // Refs to store DOM elements
  const projectsRef = React.useRef<Map<number, HTMLDivElement>>(new Map());
  const minimapRef = React.useRef<Map<number, HTMLDivElement>>(new Map());
  const infoRef = React.useRef<Map<number, HTMLDivElement>>(new Map());
  const requestRef = React.useRef<number>(undefined);

  // Helper to update horizontal parallax for a single image
  const updateParallax = (
    img: HTMLImageElement | null,
    offsetIndex: number,
    baseWidth: number
  ) => {
    if (!img) return;
    if (!img.dataset.parallaxCurrent) {
      img.dataset.parallaxCurrent = '0';
    }

    let current = parseFloat(img.dataset.parallaxCurrent);
    const target = offsetIndex * baseWidth * -0.22;
    current = lerp(current, target, 0.1);

    if (Math.abs(current - target) > 0.01) {
      img.style.transform = `translateX(${current}px) scale(1.35)`;
      img.dataset.parallaxCurrent = current.toString();
    }
  };

  const updateSnap = () => {
    const s = state.current;
    const progress = Math.min((Date.now() - s.snapStart.time) / CONFIG.SNAP_DURATION, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    s.targetProgress = s.snapStart.progress + (s.snapStart.target - s.snapStart.progress) * eased;
    if (progress >= 1) s.isSnapping = false;
  };

  const goToIndex = (index: number) => {
    if (scrollTriggerRef.current) {
      const st = scrollTriggerRef.current;
      const targetScroll = st.start + (index / (dataList.length - 1)) * (st.end - st.start);
      window.scrollTo({ top: targetScroll, behavior: 'smooth' });
    } else {
      const s = state.current;
      const maxIndex = dataList.length - 1;
      const clamped = Math.max(0, Math.min(maxIndex, index));
      s.isSnapping = true;
      s.snapStart = {
        time: Date.now(),
        progress: s.currentProgress,
        target: -clamped,
      };
    }
  };

  const updatePositions = () => {
    const s = state.current;

    // 1. Update Background Projects (Slide in horizontally from the right)
    projectsRef.current.forEach((el, index) => {
      const offset = index + s.currentProgress;
      const x = offset * s.projectWidth;
      el.style.transform = `translateX(${x}px)`;
      const img = el.querySelector('img');
      updateParallax(img, offset, s.projectWidth);
    });

    // 2. Update Minimap Images (2nd image and subsequent images come from the right side)
    minimapRef.current.forEach((el, index) => {
      const offset = index + s.currentProgress;
      const x = offset * s.minimapWidth;
      el.style.transform = `translateX(${x}px)`;
      const img = el.querySelector('img');
      if (img) {
        updateParallax(img, offset, s.minimapWidth);
      }
    });

    // 3. Update Minimap Info (Text rows slide in horizontally from the right)
    infoRef.current.forEach((el, index) => {
      const offset = index + s.currentProgress;
      const x = offset * s.minimapCardWidth;
      el.style.transform = `translateX(${x}px)`;
      const dist = Math.abs(offset);
      el.style.opacity = Math.max(0, 1 - dist * 1.5).toString();
    });
  };

  const animate = () => {
    const s = state.current;

    if (s.isSnapping) updateSnap();
    s.currentProgress += (s.targetProgress - s.currentProgress) * CONFIG.LERP_FACTOR;

    updatePositions();

    // Track active index for pagination dots and callbacks
    const idx = Math.max(0, Math.min(dataList.length - 1, Math.round(-s.currentProgress)));
    if (idx !== activeIndexRef.current) {
      activeIndexRef.current = idx;
      setActiveIndex(idx);
      onSlideChange?.(idx);
    }
  };

  const animationLoop = () => {
    animate();
    requestRef.current = requestAnimationFrame(animationLoop);
  };

  React.useEffect(() => {
    const updateDimensions = () => {
      const el = containerRef.current;
      state.current.projectWidth = el ? el.clientWidth || window.innerWidth : window.innerWidth;

      const previewEl = containerRef.current?.querySelector('.minimap-img-preview') as HTMLElement;
      if (previewEl) {
        state.current.minimapWidth = previewEl.clientWidth || (window.innerWidth <= 640 ? 200 : 290);
      } else {
        state.current.minimapWidth = window.innerWidth <= 640 ? 200 : 290;
      }

      const minimapEl = containerRef.current?.querySelector('.minimap') as HTMLElement;
      if (minimapEl) {
        state.current.minimapCardWidth = minimapEl.clientWidth || 700;
      }
    };

    updateDimensions();

    const triggerEl = triggerRef?.current || containerRef.current;
    const pinEl = pinnedRef?.current || containerRef.current;

    let st: ScrollTrigger | null = null;
    if (triggerEl && pinEl) {
      st = ScrollTrigger.create({
        trigger: triggerEl,
        start: 'top top',
        end: '+=250%',
        pin: pinEl,
        scrub: 0.8,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        snap: {
          snapTo: 1 / (dataList.length - 1),
          duration: { min: 0.25, max: 0.5 },
          delay: 0.08,
          ease: 'power1.inOut',
        },
        onUpdate: (self) => {
          const s = state.current;
          s.targetProgress = -self.progress * (dataList.length - 1);
        },
      });

      scrollTriggerRef.current = st;
    }

    const onResize = () => {
      updateDimensions();
      ScrollTrigger.refresh();
    };

    window.addEventListener('resize', onResize);

    // Start Animation Loop
    requestRef.current = requestAnimationFrame(animationLoop);

    return () => {
      window.removeEventListener('resize', onResize);
      if (st) st.kill();
      scrollTriggerRef.current = null;
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [dataList.length, triggerRef, pinnedRef]);

  return (
    <div ref={containerRef} className={`parallax-container ${className}`}>
      {/* ── Background Project Images (3 Photos Only) ── */}
      <ul className="project-list">
        {dataList.map((data, index) => (
          <div
            key={index}
            className="project"
            ref={(el) => {
              if (el) projectsRef.current.set(index, el);
              else projectsRef.current.delete(index);
            }}
          >
            <img src={data.image} alt={data.title} />
          </div>
        ))}
      </ul>

      {/* ── Floating Center Minimap Card ── */}
      <div className="minimap">
        <div className="minimap-wrapper">
          {/* Centered Image Thumbnail Preview */}
          <div className="minimap-img-preview">
            {dataList.map((data, index) => (
              <div
                key={index}
                className="minimap-img-item"
                ref={(el) => {
                  if (el) minimapRef.current.set(index, el);
                  else minimapRef.current.delete(index);
                }}
              >
                <img src={data.image} alt={data.title} />
              </div>
            ))}
          </div>

          {/* Side Typography & Info Rows */}
          <div className="minimap-info-list">
            {dataList.map((data, index) => {
              const num = (index + 1).toString().padStart(2, '0');
              return (
                <div
                  key={index}
                  className="minimap-item-info"
                  ref={(el) => {
                    if (el) infoRef.current.set(index, el);
                    else infoRef.current.delete(index);
                  }}
                >
                  <div className="minimap-item-info-row">
                    <p>{num}</p>
                    <p>{data.title}</p>
                  </div>
                  <div className="minimap-item-info-row">
                    <p>{data.category}</p>
                    <p>{data.year}</p>
                  </div>
                  <div className="minimap-item-info-row">
                    <p>{data.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Direct 3-Slide Switcher Navigation Dots ── */}
        <div className="flex items-center justify-center gap-2.5 pt-6 mt-2 border-t border-black/10">
          {dataList.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => goToIndex(i)}
              className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                i === activeIndex
                  ? 'w-8 bg-[#180A04]'
                  : 'w-2 bg-black/20 hover:bg-black/40'
              }`}
              aria-label={`Go to photo ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// Named alias export for convenience
export const ArgentLoopInfiniteSlider = Component;
export default Component;
