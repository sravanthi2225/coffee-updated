import React from 'react';

interface SectionContainerProps {
  children: React.ReactNode;
  className?: string;
  id?: string;
  bg?: 'cream' | 'off-white' | 'espresso' | 'beige';
}

export const SectionContainer: React.FC<SectionContainerProps> = ({
  children,
  className = '',
  id,
  bg = 'cream',
}) => {
  const bgStyles = {
    cream: 'bg-[#FBF4E9] text-[#2A2723]',
    'off-white': 'bg-[#F7F1E6] text-[#2A2723]',
    espresso: 'bg-[#2B1B14] text-[#FBF4E9]',
    beige: 'bg-[#EFE2CF] text-[#2A2723]',
  };

  return (
    <section id={id} className={`py-16 md:py-24 transition-colors duration-300 ${bgStyles[bg]} ${className}`}>
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        {children}
      </div>
    </section>
  );
};
