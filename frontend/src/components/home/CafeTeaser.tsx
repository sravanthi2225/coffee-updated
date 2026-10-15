import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Clock, ArrowRight, Wifi, Sparkles } from 'lucide-react';
import { SectionContainer } from '../layout/SectionContainer';
import { SectionHeading } from '../layout/SectionHeading';
import { LOCATIONS } from '../../data/locations';

export const CafeTeaser: React.FC = () => {
  const flagship = LOCATIONS[0];

  return (
    <SectionContainer bg="off-white" className="relative overflow-hidden">
      {/* Coffee-Themed Visual Decor on Flanks */}
      <div className="absolute top-8 -left-6 w-40 sm:w-52 pointer-events-none select-none opacity-60 z-0">
        <img src="/images/journey/beans-corner.png" alt="" className="w-full h-auto transform rotate-12" />
      </div>
      <div className="absolute -bottom-6 -right-6 w-44 sm:w-60 pointer-events-none select-none opacity-65 z-0">
        <img src="/images/journey/leaves-corner.png" alt="" className="w-full h-auto transform rotate-180 scale-x-[-1]" />
      </div>

      <SectionHeading
        overline="Find Your Next Little Pause"
        title="Our Neighborhood Sanctuaries"
        subtitle="Designed with wide communal wood tables, quiet reading alcoves, and sun-dappled courtyard gardens."
        action={
          <Link
            to="/locations"
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#2B1B14] hover:text-[#C08A4E] transition-colors"
          >
            <span>All 4 Locations</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        }
      />

      <div className="relative rounded-3xl overflow-hidden bg-[#EFE2CF] border border-[#E5D5BF] shadow-lg grid grid-cols-1 lg:grid-cols-12">
        {/* Café Image */}
        <div className="lg:col-span-7 relative h-72 sm:h-96 lg:h-auto overflow-hidden">
          <img
            src={flagship.image}
            alt={flagship.name}
            loading="lazy"
            className="w-full h-full object-cover object-center hover:scale-105 transition-transform duration-700"
          />
          <div className="absolute top-4 left-4 px-3.5 py-1 rounded-full bg-[#2B1B14]/85 backdrop-blur-md text-[#FBF4E9] text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#C08A4E]" />
            Flagship Roastery
          </div>
        </div>

        {/* Details & Amenities Column */}
        <div className="lg:col-span-5 p-6 sm:p-8 lg:p-10 flex flex-col justify-between bg-[#FBF4E9] space-y-6">
          <div className="space-y-4">
            <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#2B1B14]">
              {flagship.name}
            </h3>

            <div className="space-y-2 text-xs sm:text-sm text-[#5A3B2E]">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#C08A4E] flex-shrink-0 mt-0.5" />
                <span>{flagship.address}, {flagship.city}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-[#C08A4E] flex-shrink-0" />
                <span>Mon–Fri: {flagship.hoursWeekday} • Sat–Sun: {flagship.hoursWeekend}</span>
              </div>
            </div>

            <div className="pt-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#5C6B4E] block mb-2">
                Café Amenities
              </span>
              <div className="flex flex-wrap gap-2">
                {flagship.amenities.map((amenity) => (
                  <span
                    key={amenity}
                    className="text-xs px-3 py-1 rounded-full bg-[#EFE2CF] text-[#2B1B14] font-medium"
                  >
                    {amenity}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-[#EFE2CF] flex flex-col sm:flex-row items-center gap-3">
            <Link
              to="/locations"
              className="w-full sm:w-auto px-6 py-3 rounded-full bg-[#2B1B14] hover:bg-[#5A3B2E] text-[#FBF4E9] text-xs font-semibold uppercase tracking-wider text-center transition-all shadow-sm"
            >
              View Hours &amp; Directions
            </Link>
            <Link
              to="/menu"
              className="w-full sm:w-auto px-6 py-3 rounded-full border border-[#2B1B14] hover:bg-[#EFE2CF] text-[#2B1B14] text-xs font-semibold uppercase tracking-wider text-center transition-all"
            >
              Order Ahead
            </Link>
          </div>
        </div>
      </div>
    </SectionContainer>
  );
};
