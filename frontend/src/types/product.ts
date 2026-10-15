export type ProductCategory = 'coffee' | 'non-coffee' | 'dessert';

export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  description: string;
  price: number;
  image: string;
  flavorNotes: string[];
  sizes?: string[];
  milkOptions?: string[];
  sweetnessOptions?: string[];
  availableExtras?: string[];
  isFavorite?: boolean;
  calories?: number;
  rating?: number;
  reviewsCount?: number;
  origin?: string;
  brewMethod?: string;
  roastLevel?: string;
  intensity?: number;
  size?: string;
  isBestSeller?: boolean;
  notes?: string[];
}

export interface HeroDrink {
  id: string;
  selectorName: string;
  titleName: string;
  subtitleGhost: string;
  price: number;
  rating: number;
  aboutText: string;
  temperature: 'hot' | 'cold';
  flavorNotes: string[];
  bestServed: string;
  latteArt: 'rosette' | 'tulip' | 'heart' | 'cinnamon' | 'crema';
  bgGradient?: string;
}

export interface CartCustomization {
  size: string;
  milk: string;
  sweetness: string;
  extras: string[];
}

export interface CartItem {
  cartItemId: string;
  productId: string;
  name: string;
  category: ProductCategory;
  basePrice: number;
  price: number;
  image: string;
  customization: CartCustomization;
  quantity: number;
  selectedOptionIds?: string[];
  optionsBreakdown?: Array<{
    optionId: string;
    groupName: string;
    optionName: string;
    priceModifier: number;
  }>;
}

export interface CoffeeTypeGuide {
  id: string;
  name: string;
  tagline: string;
  ratio: string;
  description: string;
  flavorProfile: string[];
  bestServed: string;
  strength: number; // 1-5
  image: string;
  artType: string;
}

export interface LocationBranch {
  id: string;
  name: string;
  address: string;
  city: string;
  distance: string;
  hoursWeekday: string;
  hoursWeekend: string;
  phone: string;
  image: string;
  amenities: string[];
  isFeatured?: boolean;
}
