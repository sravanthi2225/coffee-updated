import React from 'react';

// Custom SVG Icons matching the exact icons from the reference image
const SourcingIcon: React.FC = () => (
  <svg viewBox="0 0 36 36" fill="none" className="w-9 h-9 sm:w-10 sm:h-10" xmlns="http://www.w3.org/2000/svg">
    {/* Central Stem */}
    <path d="M18 30V13" stroke="#8C6239" strokeWidth="2.4" strokeLinecap="round" />
    {/* Left Leaf */}
    <path d="M18 20C10.5 19 6.5 13 6.5 9C10.5 9 18 13 18 20Z" fill="#4D7F3B" stroke="#77AC63" strokeWidth="1.4" />
    {/* Right Leaf */}
    <path d="M18 16C25.5 15 29.5 9 29.5 5C25.5 5 18 9 18 16Z" fill="#3E6B2E" stroke="#689E53" strokeWidth="1.4" />
    {/* Top Center Leaf */}
    <path d="M18 13C14 7 16.5 2.5 18 1.5C19.5 2.5 22 7 18 13Z" fill="#5F974B" stroke="#8CC674" strokeWidth="1.4" />
    {/* Clustered Red Coffee Cherries */}
    <circle cx="13.5" cy="24.5" r="3.2" fill="#D32F2F" stroke="#FF5252" strokeWidth="0.8" />
    <circle cx="21" cy="23.5" r="3" fill="#C62828" stroke="#EF5350" strokeWidth="0.8" />
    <circle cx="17" cy="27" r="2.8" fill="#B71C1C" />
    <circle cx="14.5" cy="23.5" r="0.8" fill="#FFE5E5" />
    <circle cx="22" cy="22.5" r="0.8" fill="#FFE5E5" />
  </svg>
);

const RoastingIcon: React.FC = () => (
  <svg viewBox="0 0 36 36" fill="none" className="w-9 h-9 sm:w-10 sm:h-10" xmlns="http://www.w3.org/2000/svg">
    {/* Left Bean */}
    <g transform="translate(11, 18) rotate(-22) translate(-11, -18)">
      <path
        d="M11 7.5C16 7.5 18.5 12.5 18.5 18C18.5 23.5 16 28.5 11 28.5C6 28.5 3.5 23.5 3.5 18C3.5 12.5 6 7.5 11 7.5Z"
        fill="#261307"
        stroke="#E5A958"
        strokeWidth="2"
      />
      <path d="M11 9.5C10 13.5 12.5 16 11.8 18.5C11 21 9 23 10.2 26.5" stroke="#E5A958" strokeWidth="1.8" strokeLinecap="round" />
    </g>
    {/* Right Bean */}
    <g transform="translate(23, 18) rotate(22) translate(-23, -18)">
      <path
        d="M23 7.5C28 7.5 30.5 12.5 30.5 18C30.5 23.5 28 28.5 23 28.5C18 28.5 15.5 23.5 15.5 18C15.5 12.5 18 7.5 23 7.5Z"
        fill="#321A0A"
        stroke="#E5A958"
        strokeWidth="2"
      />
      <path d="M23 9.5C22 13.5 24.5 16 23.8 18.5C23 21 21 23 22.2 26.5" stroke="#E5A958" strokeWidth="1.8" strokeLinecap="round" />
    </g>
  </svg>
);

const BrewingIcon: React.FC = () => (
  <svg viewBox="0 0 36 36" fill="none" className="w-9 h-9 sm:w-10 sm:h-10" xmlns="http://www.w3.org/2000/svg">
    {/* Steam Lines */}
    <path d="M13 6C12 8.5 14 10 13 12.5" stroke="#36B39E" strokeWidth="2" strokeLinecap="round" />
    <path d="M18 4.5C17 7.5 19 9 18 12.5" stroke="#36B39E" strokeWidth="2" strokeLinecap="round" />
    <path d="M23 6C22 8.5 24 10 23 12.5" stroke="#36B39E" strokeWidth="2" strokeLinecap="round" />
    {/* Cup Body */}
    <path
      d="M8.5 15H26.5V21C26.5 25.5 22.5 28 17.5 28C12.5 28 8.5 25.5 8.5 21V15Z"
      stroke="#36B39E"
      strokeWidth="2.2"
      strokeLinejoin="round"
    />
    {/* Cup Handle */}
    <path
      d="M26.5 17H29.5C31.2 17 32.5 18.3 32.5 20C32.5 21.7 31.2 23 29.5 23H25.5"
      stroke="#36B39E"
      strokeWidth="2"
      strokeLinecap="round"
    />
    {/* Saucer */}
    <path d="M6.5 30H28.5" stroke="#36B39E" strokeWidth="2.2" strokeLinecap="round" />
  </svg>
);

const CraftingIcon: React.FC = () => (
  <svg viewBox="0 0 36 36" fill="none" className="w-9 h-9 sm:w-10 sm:h-10" xmlns="http://www.w3.org/2000/svg">
    {/* Outer Cup Rim */}
    <circle cx="18" cy="18" r="14" stroke="#E08D79" strokeWidth="2.2" />
    {/* Crema Arc Layer */}
    <path d="M7 18C7 24.075 11.925 29 18 29C24.075 29 29 24.075 29 18" stroke="#E08D79" strokeWidth="1.2" strokeDasharray="3 2" opacity="0.6" />
    {/* Latte Art Heart */}
    <path
      d="M18 22C18 22 13 18.5 13 15C13 13 14.8 11.5 16.6 12.8C17.4 13.5 18 14.3 18 14.3C18 14.3 18.6 13.5 19.4 12.8C21.2 11.5 23 13 23 15C23 18.5 18 22 18 22Z"
      fill="#E08D79"
    />
    {/* Outer Swirl Accents */}
    <path d="M12 16.5C10 14 11 11 14 10" stroke="#E08D79" strokeWidth="1.2" strokeLinecap="round" opacity="0.8" />
    <path d="M24 16.5C26 14 25 11 22 10" stroke="#E08D79" strokeWidth="1.2" strokeLinecap="round" opacity="0.8" />
  </svg>
);

const QualityCheckIcon: React.FC = () => (
  <svg viewBox="0 0 36 36" fill="none" className="w-9 h-9 sm:w-10 sm:h-10" xmlns="http://www.w3.org/2000/svg">
    {/* Shield Outline */}
    <path
      d="M18 5.5L8.5 10V18C8.5 24.5 12.5 30 18 32C23.5 30 27.5 24.5 27.5 18V10L18 5.5Z"
      stroke="#A682D4"
      strokeWidth="2.2"
      strokeLinejoin="round"
    />
    {/* Inner Checkmark */}
    <path
      d="M13.5 18.5L16.5 22L22.8 15"
      stroke="#A682D4"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const PerfectCupIcon: React.FC = () => (
  <svg viewBox="0 0 36 36" fill="none" className="w-9 h-9 sm:w-10 sm:h-10" xmlns="http://www.w3.org/2000/svg">
    {/* Floating Heart above cup */}
    <path
      d="M18 7.5C18 7.5 15.5 5.2 14 5.2C12.2 5.2 11.2 6.6 12.2 8C13 9.2 18 12 18 12C18 12 23 9.2 23.8 8C24.8 6.6 23.8 5.2 22 5.2C20.5 5.2 18 7.5 18 7.5Z"
      fill="#F0B858"
    />
    {/* Cup Body */}
    <path
      d="M9.5 14.5H25.5V20.5C25.5 24.8 22.2 27 17.5 27C12.8 27 9.5 24.8 9.5 20.5V14.5Z"
      stroke="#F0B858"
      strokeWidth="2.2"
    />
    {/* Smiling Face Curve */}
    <path
      d="M14.5 20.5C15.5 22 19.5 22 20.5 20.5"
      stroke="#F0B858"
      strokeWidth="2"
      strokeLinecap="round"
    />
    {/* Cup Handle */}
    <path
      d="M25.5 16.5H28.5C30.2 16.5 31.5 17.8 31.5 19.5C31.5 21.2 30.2 22.5 28.5 22.5H24.5"
      stroke="#F0B858"
      strokeWidth="2"
      strokeLinecap="round"
    />
    {/* Saucer */}
    <path d="M7.5 30H27.5" stroke="#F0B858" strokeWidth="2.2" strokeLinecap="round" />
  </svg>
);

export const BeanToCupTimeline: React.FC = () => {
  const steps = [
    {
      num: '01',
      title: 'Sourcing',
      desc: 'We choose the finest coffee beans from sustainable farms around the world.',
      IconComponent: SourcingIcon,
      ringColor: '#D49B55',
      glowShadow: 'shadow-[0_0_22px_rgba(212,155,85,0.4)]',
      watermark: (
        <svg viewBox="0 0 60 60" fill="none" className="w-20 h-20 opacity-15 pointer-events-none">
          <path d="M15 45C25 40 32 28 45 15C40 25 28 32 15 45Z" fill="#D49B55" />
          <path d="M30 30C37 25 42 18 47 10" stroke="#D49B55" strokeWidth="2.5" />
          <circle cx="20" cy="40" r="4" fill="#D49B55" />
        </svg>
      ),
    },
    {
      num: '02',
      title: 'Roasting',
      desc: 'Our beans are roasted with precision to unlock their unique aroma, flavor and character.',
      IconComponent: RoastingIcon,
      ringColor: '#E5A958',
      glowShadow: 'shadow-[0_0_22px_rgba(229,169,88,0.4)]',
      watermark: (
        <svg viewBox="0 0 60 60" fill="none" className="w-20 h-20 opacity-15 pointer-events-none">
          <ellipse cx="25" cy="35" rx="14" ry="18" stroke="#E5A958" strokeWidth="2.5" />
          <path d="M25 20C23 27 27 33 25 48" stroke="#E5A958" strokeWidth="2.5" />
        </svg>
      ),
    },
    {
      num: '03',
      title: 'Brewing',
      desc: 'Expertly brewed using the right balance of time, temperature and care.',
      IconComponent: BrewingIcon,
      ringColor: '#36B39E',
      glowShadow: 'shadow-[0_0_22px_rgba(54,179,158,0.4)]',
      watermark: (
        <svg viewBox="0 0 60 60" fill="none" className="w-20 h-20 opacity-15 pointer-events-none">
          <path d="M15 24H45V36C45 44 38 48 30 48C22 48 15 44 15 36V24Z" stroke="#36B39E" strokeWidth="2.5" />
          <path d="M22 14C21 16 23 18 22 20" stroke="#36B39E" strokeWidth="2" />
          <path d="M30 12C29 15 31 17 30 20" stroke="#36B39E" strokeWidth="2" />
        </svg>
      ),
    },
    {
      num: '04',
      title: 'Crafting',
      desc: 'Each cup is crafted by skilled baristas who value quality in every detail.',
      IconComponent: CraftingIcon,
      ringColor: '#E08D79',
      glowShadow: 'shadow-[0_0_22px_rgba(224,141,121,0.4)]',
      watermark: (
        <svg viewBox="0 0 60 60" fill="none" className="w-20 h-20 opacity-15 pointer-events-none">
          <circle cx="30" cy="30" r="20" stroke="#E08D79" strokeWidth="2.5" />
          <path d="M30 35C30 35 22 30 22 25C22 22 25 20.5 27.5 22.5C28.8 23.8 30 25 30 25C30 25 31.2 23.8 32.5 22.5C35 20.5 38 22 38 25C38 30 30 35 30 35Z" fill="#E08D79" />
        </svg>
      ),
    },
    {
      num: '05',
      title: 'Quality Check',
      desc: 'We ensure every cup meets our highest standards of taste, freshness and hygiene.',
      IconComponent: QualityCheckIcon,
      ringColor: '#A682D4',
      glowShadow: 'shadow-[0_0_22px_rgba(166,130,212,0.4)]',
      watermark: (
        <svg viewBox="0 0 60 60" fill="none" className="w-20 h-20 opacity-15 pointer-events-none">
          <path d="M30 10L15 17V30C15 40 21 47 30 50C39 47 45 40 45 30V17L30 10Z" stroke="#A682D4" strokeWidth="2.5" />
        </svg>
      ),
    },
    {
      num: '06',
      title: 'Your Perfect Cup',
      desc: 'Finally, it reaches you — rich in flavor, comforting in every sip.',
      IconComponent: PerfectCupIcon,
      ringColor: '#F0B858',
      glowShadow: 'shadow-[0_0_22px_rgba(240,184,88,0.4)]',
      watermark: (
        <svg viewBox="0 0 60 60" fill="none" className="w-20 h-20 opacity-15 pointer-events-none">
          <path d="M30 22C30 22 24 16 21 16C17 16 15 19 17 22C19 25 30 34 30 34C30 34 41 25 43 22C45 19 43 16 39 16C36 16 30 22 30 22Z" stroke="#F0B858" strokeWidth="2.5" />
        </svg>
      ),
    },
  ];

  return (
    <section className="relative w-full overflow-hidden bg-[#180C07] text-[#FDF8F0] py-20 sm:py-24 lg:py-28 select-none">
      {/* ─────────────────────────────────────────────────────────────
          1. AMBIENT BACKGROUND & WARM CENTER SPOTLIGHT
      ───────────────────────────────────────────────────────────── */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#1A0D08] via-[#21110A] to-[#150A05] pointer-events-none" />
      
      {/* Warm Golden Center Spotlight blur */}
      <div 
        className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[950px] h-[480px] pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(195, 125, 60, 0.2) 0%, rgba(140, 70, 25, 0.08) 55%, transparent 75%)',
          filter: 'blur(50px)',
        }}
      />

      {/* ─────────────────────────────────────────────────────────────
          2. CORNER BOTANICALS & ROASTED BEANS DECOR (EXACT REFERENCE)
      ───────────────────────────────────────────────────────────── */}

      {/* TOP-LEFT: Fresh Green Coffee Leaves Branch */}
      <div className="absolute -top-10 -left-10 w-52 sm:w-64 md:w-76 lg:w-84 pointer-events-none z-10 select-none opacity-90 drop-shadow-[0_8px_20px_rgba(0,0,0,0.7)]">
        <img
          src="/images/journey/leaves-corner.png"
          alt=""
          className="w-full h-auto transform -rotate-6"
        />
      </div>

      {/* BOTTOM-LEFT: Real Roasted Coffee Beans + Botanical Watermark */}
      <div className="absolute -bottom-10 -left-8 w-56 sm:w-64 md:w-72 lg:w-80 pointer-events-none z-10 select-none">
        {/* Faint botanical leaf watermark behind beans */}
        <svg viewBox="0 0 180 140" fill="none" className="absolute bottom-10 left-10 w-36 h-36 opacity-25" xmlns="http://www.w3.org/2000/svg">
          <path d="M10 130 C40 100, 70 80, 110 70" stroke="#C59B63" strokeWidth="1.8" />
          <path d="M50 110 C35 90, 45 75, 70 85 C80 95, 65 110, 50 110 Z" stroke="#C59B63" strokeWidth="1.4" />
          <path d="M90 85 C80 65, 95 50, 120 60 C130 75, 110 90, 90 85 Z" stroke="#C59B63" strokeWidth="1.4" />
        </svg>
        <img
          src="/images/journey/beans-corner.png"
          alt=""
          className="w-full h-auto drop-shadow-[0_8px_16px_rgba(0,0,0,0.7)]"
        />
      </div>

      {/* BOTTOM-RIGHT: Fresh Green Coffee Leaves */}
      <div className="absolute -bottom-12 -right-10 w-48 sm:w-60 md:w-72 lg:w-80 pointer-events-none z-10 select-none opacity-90 drop-shadow-[0_8px_20px_rgba(0,0,0,0.7)]">
        <img
          src="/images/journey/leaves-corner.png"
          alt=""
          className="w-full h-auto transform rotate-180 scale-x-[-1]"
        />
      </div>

      {/* ─────────────────────────────────────────────────────────────
          3. SECTION HEADER (EXACT TYPOGRAPHY & OVERLINE)
      ───────────────────────────────────────────────────────────── */}
      <div className="relative max-w-[1540px] mx-auto px-4 sm:px-6 lg:px-10 z-20">
        <div className="flex flex-col items-center justify-center text-center mb-12 sm:mb-16">
          
          {/* Overline with Hairline Rules: ─── YOUR COFFEE JOURNEY ─── */}
          <div className="flex items-center justify-center gap-3 sm:gap-4 mb-3.5">
            <div className="w-10 sm:w-16 h-[1px] bg-[#C59B63]/75" />
            <span className="text-[11px] sm:text-xs font-bold uppercase tracking-[0.28em] text-[#C59B63]">
              YOUR COFFEE JOURNEY
            </span>
            <div className="w-10 sm:w-16 h-[1px] bg-[#C59B63]/75" />
          </div>

          {/* Main Title: The Alchemy of Every Sip */}
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-[54px] font-bold text-[#FFF8F0] tracking-tight leading-tight">
            The Alchemy of Every Sip
          </h2>

          {/* Subtitle Description */}
          <p className="max-w-xl mx-auto text-xs sm:text-sm md:text-[14.5px] text-[#C6B4A3] leading-relaxed font-sans mt-3 px-4 font-normal">
            From carefully selected beans to a perfect cup, every step is a blend of{' '}
            <span className="block sm:inline">passion, precision and years of expertise.</span>
          </p>
        </div>

        {/* ─────────────────────────────────────────────────────────────
            4. 6-CARD HORIZONTAL PROCESS ROW WITH CONNECTING ARROWS
        ───────────────────────────────────────────────────────────── */}
        <div className="flex flex-col sm:grid sm:grid-cols-2 lg:grid-cols-3 xl:flex xl:flex-row items-stretch justify-center gap-3.5 xl:gap-2.5 relative">
          {steps.map((step, idx) => {
            const Icon = step.IconComponent;
            const isLast = idx === steps.length - 1;

            return (
              <React.Fragment key={step.num}>
                {/* Process Card */}
                <div className="flex-1 min-w-[172px] max-w-full relative flex flex-col items-center text-center p-5 sm:py-7 sm:px-4 rounded-2xl bg-gradient-to-b from-[#2A150C]/75 via-[#1E0D06]/85 to-[#130703]/95 border border-[#4A2917]/70 hover:border-[#C59B63]/85 shadow-[0_10px_28px_rgba(0,0,0,0.45)] hover:shadow-[0_16px_36px_rgba(197,155,99,0.2)] hover:-translate-y-1.5 transition-all duration-300 overflow-hidden group">
                  
                  {/* Subtle Corner Watermark Illustration */}
                  <div className="absolute bottom-0 left-0 pointer-events-none select-none">
                    {step.watermark}
                  </div>

                  {/* Top Circular Badge with Custom Glowing Border Ring */}
                  <div
                    className={`w-[74px] h-[74px] sm:w-[78px] sm:h-[78px] rounded-full bg-[#100502] flex items-center justify-center relative mb-4.5 transition-transform duration-300 group-hover:scale-105 ${step.glowShadow}`}
                    style={{
                      border: `2.4px solid ${step.ringColor}`,
                    }}
                  >
                    <Icon />
                  </div>

                  {/* Stage Number: — 01 — */}
                  <span className="text-[11px] sm:text-xs font-mono font-medium tracking-widest text-[#C59B63] mb-1.5 block">
                    — {step.num} —
                  </span>

                  {/* Step Title */}
                  <h3 className="font-serif text-lg sm:text-[20px] font-bold text-[#FFF8F0] tracking-tight mb-2">
                    {step.title}
                  </h3>

                  {/* Step Description */}
                  <p className="text-[11.5px] sm:text-[12px] text-[#C6B4A3]/90 leading-relaxed font-sans font-normal">
                    {step.desc}
                  </p>
                </div>

                {/* Connecting Arrow for Desktop (hidden on the last item) */}
                {!isLast && (
                  <div className="hidden xl:flex items-center justify-center text-[#C59B63]/80 shrink-0 px-0.5 pointer-events-none">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="#C59B63" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14" />
                      <path d="m12 5 7 7-7 7" />
                    </svg>
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>

      </div>
    </section>
  );
};
