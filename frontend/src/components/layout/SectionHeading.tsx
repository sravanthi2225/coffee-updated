import React from 'react';

interface SectionHeadingProps {
  overline?: string;
  title: string;
  subtitle?: string;
  align?: 'left' | 'center' | 'right';
  theme?: 'light' | 'dark';
  className?: string;
  action?: React.ReactNode;
}

export const SectionHeading: React.FC<SectionHeadingProps> = ({
  overline,
  title,
  subtitle,
  align = 'center',
  theme = 'light',
  className = '',
  action,
}) => {
  const alignClass = {
    left: 'text-left items-start',
    center: 'text-center items-center',
    right: 'text-right items-end',
  }[align];

  const overlineColor = theme === 'dark' ? 'text-[#C08A4E]' : 'text-[#5C6B4E]';
  const titleColor = theme === 'dark' ? 'text-[#FBF4E9]' : 'text-[#2B1B14]';
  const subColor = theme === 'dark' ? 'text-[#FBF4E9]/75' : 'text-[#5A3B2E]/80';

  return (
    <div className={`flex flex-col mb-12 sm:mb-16 ${alignClass} ${className}`}>
      {/* Editorial signature overline */}
      {overline && (
        <span className={`text-[11px] sm:text-xs font-bold tracking-[0.25em] uppercase mb-2.5 ${overlineColor}`}>
          {overline}
        </span>
      )}

      {/* Large luxury display heading */}
      <div className={`flex flex-col md:flex-row items-center justify-between gap-4 w-full ${align === 'left' ? 'md:items-end' : ''}`}>
        <h2 className={`font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight ${titleColor}`}>
          {title}
        </h2>
        {action && (
          <div className="mt-2 md:mt-0 flex-shrink-0">
            {action}
          </div>
        )}
      </div>

      {/* Hairline accent line under heading */}
      <div className={`h-0.5 w-12 my-4 bg-[#C08A4E] ${align === 'center' ? 'mx-auto' : ''}`} />

      {/* Supporting editorial subhead */}
      {subtitle && (
        <p className={`text-sm sm:text-base max-w-2xl font-sans leading-relaxed ${subColor}`}>
          {subtitle}
        </p>
      )}
    </div>
  );
};
