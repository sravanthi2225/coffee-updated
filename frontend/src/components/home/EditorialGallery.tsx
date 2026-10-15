import React, { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useReducedMotion } from '../../hooks/useReducedMotion';

gsap.registerPlugin(ScrollTrigger);

interface GalleryImage {
  src: string;
  alt: string;
  caption: string;
}

const GALLERY_IMAGES: GalleryImage[] = [
  { src: '/images/sections/gallery-perfect-brew.jpg', alt: 'The Perfect Brew', caption: 'The Perfect Brew' },
  { src: '/images/sections/gallery-rich-aroma.jpg', alt: 'Rich Aroma', caption: 'Rich Aroma' },
  { src: '/images/sections/gallery-sweet-pairings.jpg', alt: 'Sweet Pairings', caption: 'Sweet Pairings' },
  { src: '/images/sections/gallery-place-to-unwind.jpg', alt: 'A Place to Unwind', caption: 'A Place to Unwind' },
  { src: '/images/sections/journey-mug.png', alt: 'Artisan Coffee', caption: 'Artisan Coffee' },
];

/**
 * EditorialGallery — GSAP horizontal scroll within a pinned section.
 * Images have parallax depth (foreground moves faster).
 * Subtle Anime.js sparkle overlay adds warmth.
 */
export const EditorialGallery: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const panelsRef = useRef<HTMLDivElement>(null);
  const sparkleCanvasRef = useRef<HTMLCanvasElement>(null);
  const reducedMotion = useReducedMotion();

  // Horizontal scroll with GSAP ScrollTrigger
  useEffect(() => {
    if (reducedMotion || !sectionRef.current || !panelsRef.current) return;

    const panels = panelsRef.current;
    const totalWidth = panels.scrollWidth - window.innerWidth;

    const ctx = gsap.context(() => {
      gsap.to(panels, {
        x: -totalWidth,
        ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: () => `+=${totalWidth}`,
          pin: true,
          scrub: 0.8,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });

      // Parallax on individual images (foreground layer faster)
      const images = panels.querySelectorAll('.gallery-parallax-img');
      images.forEach((img) => {
        gsap.fromTo(
          img,
          { x: -40 },
          {
            x: 40,
            ease: 'none',
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top top',
              end: () => `+=${totalWidth}`,
              scrub: 0.5,
            },
          }
        );
      });
    }, sectionRef);

    return () => ctx.revert();
  }, [reducedMotion]);

  // Sparkle/dust particle canvas overlay
  useEffect(() => {
    if (reducedMotion || !sparkleCanvasRef.current) return;

    const canvas = sparkleCanvasRef.current;
    const ctxCanvas = canvas.getContext('2d');
    if (!ctxCanvas) return;

    let animFrame: number;
    const particles: Array<{ x: number; y: number; vx: number; vy: number; size: number; opacity: number; life: number }> = [];

    const resize = () => {
      canvas.width = canvas.clientWidth;
      canvas.height = canvas.clientHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // Initialize particles
    for (let i = 0; i < 35; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: -Math.random() * 0.4 - 0.1,
        size: Math.random() * 2 + 0.5,
        opacity: Math.random() * 0.3,
        life: Math.random(),
      });
    }

    const draw = () => {
      ctxCanvas.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.life += 0.003;

        if (p.life > 1) {
          p.x = Math.random() * canvas.width;
          p.y = canvas.height + 10;
          p.life = 0;
          p.opacity = Math.random() * 0.3;
        }

        const alpha = p.opacity * Math.sin(p.life * Math.PI);
        ctxCanvas.beginPath();
        ctxCanvas.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctxCanvas.fillStyle = `rgba(232, 194, 138, ${alpha})`;
        ctxCanvas.fill();
      });

      animFrame = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(animFrame);
      window.removeEventListener('resize', resize);
    };
  }, [reducedMotion]);

  return (
    <section ref={sectionRef} className="relative w-full bg-[#FAF6EE] text-[#1E0F07] overflow-hidden select-none">
      {/* Section header (outside pinned area) */}
      <div className="relative py-16 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center z-10">
        {/* Corner botanicals */}
        <div className="absolute -top-6 -left-6 sm:-top-4 sm:-left-4 w-52 sm:w-68 md:w-80 pointer-events-none z-10 select-none opacity-95 drop-shadow-[0_8px_16px_rgba(43,27,20,0.12)]">
          <img src="/images/journey/leaves-corner.png" alt="" className="w-full h-auto transform -rotate-12" />
        </div>
        <div className="absolute top-8 right-6 w-32 sm:w-44 pointer-events-none z-10 select-none opacity-85">
          <img src="/images/journey/beans-corner.png" alt="" className="w-full h-auto transform rotate-45" />
        </div>

        <div className="flex items-center justify-center gap-3.5 mb-3.5">
          <div className="w-12 sm:w-20 h-[1.5px] bg-[#C5A882]" />
          <div className="w-4 h-4 rounded-full bg-[#8C6239] flex items-center justify-center text-white text-[9px] shadow-sm">
            ☕
          </div>
          <span className="text-[11px] sm:text-xs font-bold uppercase tracking-[0.25em] text-[#8C6239] font-sans">
            CREATIVE COFFEE GALLERY
          </span>
          <div className="w-12 sm:w-20 h-[1.5px] bg-[#C5A882]" />
        </div>

        <h2 className="font-serif text-3xl sm:text-5xl lg:text-[54px] font-bold text-[#1C0E07] tracking-tight leading-tight">
          Scenes from the <span className="italic font-normal font-serif">Sanctuary</span>
        </h2>

        <p className="text-xs sm:text-sm md:text-[15px] text-[#554033] mt-3.5 max-w-2xl mx-auto leading-relaxed font-sans font-normal">
          Moments of aroma, warmth and serenity — from our daily brews to the quiet corners that make coffee more than a drink, but a feeling.
        </p>
      </div>

      {/* Horizontal scroll track */}
      <div ref={trackRef} className="relative w-full min-h-[70vh]">
        {/* Sparkle canvas overlay */}
        <canvas
          ref={sparkleCanvasRef}
          className="absolute inset-0 w-full h-full pointer-events-none z-20"
          style={{ opacity: 0.5 }}
        />

        <div ref={panelsRef} className="horizontal-scroll-panel h-[70vh]">
          {GALLERY_IMAGES.map((img, i) => (
            <div
              key={i}
              className="relative flex-shrink-0 w-[80vw] sm:w-[60vw] lg:w-[45vw] h-full p-3 sm:p-4"
            >
              <div className="relative w-full h-full rounded-[28px] overflow-hidden bg-[#2B1B14] shadow-[0_12px_32px_rgba(43,27,20,0.1)] border border-[#EAE0D2] group">
                <img
                  src={img.src}
                  alt={img.alt}
                  className="gallery-parallax-img w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                />
                {/* Caption overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-6 bg-gradient-to-t from-black/60 to-transparent">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#E8C28A] block mb-1">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <h3 className="font-serif text-lg sm:text-xl font-bold text-white">{img.caption}</h3>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
