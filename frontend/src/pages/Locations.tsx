import React, { useState } from 'react';
import { MapPin, Clock, Phone, Sparkles, Navigation, Check } from 'lucide-react';
import { SectionContainer } from '../components/layout/SectionContainer';
import { SectionHeading } from '../components/layout/SectionHeading';
import { LOCATIONS } from '../data/locations';

export const Locations: React.FC = () => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopyAddress = (id: string, address: string) => {
    navigator.clipboard.writeText(address);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <main className="pt-24 sm:pt-28 pb-12 sm:pb-16">
      <SectionContainer bg="cream" className="!py-0">
        
        <SectionHeading
          title="Find Your Next Little Pause"
          subtitle="Our spaces are intentionally designed to be tranquil respites in the heart of the city. Featuring warm timber furnishings, living greenery, and calm acoustics."
        />

        {/* Locations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10">
          {LOCATIONS.map((branch) => (
            <div
              key={branch.id}
              className="bg-[#F7F1E6] rounded-3xl overflow-hidden border border-[#EFE2CF] shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
            >
              {/* Branch Image */}
              <div className="relative aspect-video overflow-hidden bg-[#EFE2CF]">
                <img
                  src={branch.image}
                  alt={branch.name}
                  loading="lazy"
                  className="w-full h-full object-cover object-center hover:scale-105 transition-transform duration-700"
                />
                
                {branch.isFeatured && (
                  <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-[#2B1B14]/85 text-[#FBF4E9] text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 backdrop-blur-md">
                    <Sparkles className="w-3 h-3 text-[#C08A4E]" />
                    Flagship &amp; Roastery
                  </div>
                )}

                <div className="absolute bottom-3 right-3 px-3 py-1 rounded-full bg-black/60 text-white text-xs font-semibold backdrop-blur-md">
                  {branch.distance}
                </div>
              </div>

              {/* Branch Details */}
              <div className="p-6 sm:p-8 flex flex-col flex-grow justify-between space-y-6">
                <div className="space-y-3">
                  <h3 className="font-serif text-2xl font-bold text-[#2B1B14]">
                    {branch.name}
                  </h3>

                  <div className="space-y-2 text-xs sm:text-sm text-[#5A3B2E]">
                    <div className="flex items-start gap-2.5">
                      <MapPin className="w-4 h-4 text-[#C08A4E] flex-shrink-0 mt-0.5" />
                      <span>{branch.address}, {branch.city}</span>
                    </div>

                    <div className="flex items-start gap-2.5">
                      <Clock className="w-4 h-4 text-[#C08A4E] flex-shrink-0 mt-0.5" />
                      <div>
                        <p>Mon–Fri: {branch.hoursWeekday}</p>
                        <p>Sat–Sun: {branch.hoursWeekend}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <Phone className="w-4 h-4 text-[#5C6B4E] flex-shrink-0" />
                      <span>{branch.phone}</span>
                    </div>
                  </div>

                  {/* Amenities */}
                  <div className="pt-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#5A3B2E]/70 block mb-2">
                      Sanctuary Features
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {branch.amenities.map((amenity) => (
                        <span
                          key={amenity}
                          className="text-[11px] px-2.5 py-1 rounded-full bg-[#EFE2CF] text-[#2B1B14] font-medium"
                        >
                          {amenity}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-4 border-t border-[#EFE2CF] flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => handleCopyAddress(branch.id, `${branch.address}, ${branch.city}`)}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#5A3B2E] hover:text-[#2B1B14] transition-colors"
                  >
                    {copiedId === branch.id ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-[#5C6B4E]" />
                        <span>Address Copied!</span>
                      </>
                    ) : (
                      <>
                        <Navigation className="w-3.5 h-3.5 text-[#C08A4E]" />
                        <span>Copy Address</span>
                      </>
                    )}
                  </button>

                  <a
                    href="https://maps.google.com"
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2 rounded-full bg-[#2B1B14] hover:bg-[#5A3B2E] text-white text-xs font-semibold uppercase tracking-wider transition-all"
                  >
                    Get Directions
                  </a>
                </div>

              </div>
            </div>
          ))}
        </div>

        {/* Fictional Disclaimer */}
        <div className="mt-12 p-4 rounded-2xl bg-[#EFE2CF]/70 text-center text-xs text-[#5A3B2E]/80 max-w-xl mx-auto">
          <p>
            *Note: All branch locations, operating hours, and telephone coordinates listed above are fictional demonstration content created for the Brew &amp; Bloom showcase.
          </p>
        </div>

      </SectionContainer>
    </main>
  );
};
