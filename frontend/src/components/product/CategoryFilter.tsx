import React from 'react';

export type FilterCategory = 'all' | 'coffee' | 'non-coffee' | 'dessert' | 'favorites';

interface CategoryFilterProps {
  activeCategory: FilterCategory;
  onSelectCategory: (category: FilterCategory) => void;
  favoritesCount?: number;
}

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  activeCategory,
  onSelectCategory,
  favoritesCount = 0,
}) => {
  const categories: { key: FilterCategory; label: string; badge?: number }[] = [
    { key: 'all', label: 'All Offerings' },
    { key: 'coffee', label: 'Specialty Coffee' },
    { key: 'non-coffee', label: 'Botanical & Tea' },
    { key: 'dessert', label: 'Hearth Bakery' },
    { key: 'favorites', label: 'Saved Favorites', badge: favoritesCount },
  ];

  return (
    <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 py-2">
      {categories.map((cat) => {
        const isActive = activeCategory === cat.key;
        return (
          <button
            key={cat.key}
            type="button"
            onClick={() => onSelectCategory(cat.key)}
            className={`px-4 sm:px-5 py-2 rounded-full text-xs font-semibold tracking-wider uppercase transition-all duration-200 flex items-center gap-2 ${
              isActive
                ? 'bg-[#2B1B14] text-[#FBF4E9] shadow-md scale-105'
                : 'bg-[#EFE2CF] hover:bg-[#E5D5BF] text-[#5A3B2E]'
            }`}
          >
            <span>{cat.label}</span>
            {cat.badge !== undefined && cat.badge > 0 && (
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  isActive ? 'bg-[#C08A4E] text-[#2B1B14]' : 'bg-[#5C6B4E] text-white'
                }`}
              >
                {cat.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
