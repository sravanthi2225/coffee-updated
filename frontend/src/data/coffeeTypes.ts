import type { CoffeeTypeGuide } from '../types/product';

export const COFFEE_TYPES: CoffeeTypeGuide[] = [
  {
    id: 'espresso',
    name: 'Espresso',
    tagline: 'The Heart of Every Cup',
    ratio: '1:2 (18g ground coffee to 36g liquid yield)',
    description: 'Extracted in 27–30 seconds under 9 bars of pressure. Intense, rich, with golden-russet crema and concentrated oils.',
    flavorProfile: ['Dense Body', 'Dark Bittersweet Cocoa', 'Hazelnut Crema'],
    bestServed: 'Immediately after extraction in a pre-warmed porcelain cup.',
    strength: 5,
    image: 'https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?auto=format&fit=crop&w=800&q=80',
    artType: 'Tiger Crema'
  },
  {
    id: 'americano',
    name: 'Americano',
    tagline: 'Pure Clarity & Depth',
    ratio: '1:4 (Double espresso topped with 180ml hot water)',
    description: 'Maintains the aromatic nuances of espresso while softening intensity. A clean, lingering brew that reveals subtle single-origin floral notes.',
    flavorProfile: ['Crisp Acidity', 'Stone Fruit', 'Gentle Cocoa Finish'],
    bestServed: '88°C water poured gently over espresso to preserve the crema ring.',
    strength: 3,
    image: 'https://images.unsplash.com/photo-1551030173-122aabc4489c?auto=format&fit=crop&w=800&q=80',
    artType: 'Crema Ring'
  },
  {
    id: 'latte',
    name: 'Caffè Latte',
    tagline: 'Silky Harmony of Milk & Bean',
    ratio: '1:5 (Double espresso + 200ml steamed milk + 1cm microfoam)',
    description: 'The gentlest canvas for espresso. Sweet steamed milk mellows roast notes, topped with delicate latte art poured by our master baristas.',
    flavorProfile: ['Sweet Dairy Cream', 'Subtle Toffee', 'Mellow Hazelnut'],
    bestServed: '65°C in an 8oz ceramic bowl cup for comfortable sipping.',
    strength: 2,
    image: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&w=800&q=80',
    artType: 'Rosetta Feather'
  },
  {
    id: 'cappuccino',
    name: 'Cappuccino',
    tagline: 'The Classic Italian Golden Thirds',
    ratio: '1:1:1 (Equal parts espresso, hot milk, and pillowy foam)',
    description: 'A luxurious dome of micro-bubble foam holding a dusting of Valrhona cocoa. The contrast between hot liquid and cool airy foam is timeless.',
    flavorProfile: ['Bold Espresso Punch', 'Airy Sweet Foam', 'Warm Biscuit'],
    bestServed: 'Mornings between 8am and 11am with a warm flake croissant.',
    strength: 4,
    image: 'https://images.unsplash.com/photo-1534778101976-62847782c213?auto=format&fit=crop&w=800&q=80',
    artType: 'Velvet Dome'
  },
  {
    id: 'mocha',
    name: 'Caffè Mocha',
    tagline: 'Espresso Meets Artisan Ganache',
    ratio: '1:1:4 (Single-origin chocolate + espresso + textured milk)',
    description: 'Crafted with melted bean-to-bar dark chocolate ganache, never powder syrups. A decadent, comforting indulgence for chilly mornings.',
    flavorProfile: ['70% Dark Chocolate', 'Roasted Coffee', 'Caramelized Molasses'],
    bestServed: 'With a sprinkle of Maldon sea salt and hand-whipped vanilla cream.',
    strength: 3,
    image: 'https://images.unsplash.com/photo-1578314675249-a6910f80cc4e?auto=format&fit=crop&w=800&q=80',
    artType: 'Ganache Swirl'
  },
  {
    id: 'flat-white',
    name: 'Flat White',
    tagline: 'Bold Espresso with Velveteen Texture',
    ratio: '1:3 (Double ristretto with 140ml micro-textured milk)',
    description: 'Born in the southern antipodes. Free of stiff foam, flat whites preserve the potent sweetness of short-shot ristretto with glossy, fluid milk.',
    flavorProfile: ['Intense Roasted Grain', 'Buttery Sweetness', 'Rich Body'],
    bestServed: 'In a 6oz glass or ceramic tumbler to showcase microfoam integration.',
    strength: 4,
    image: 'https://images.unsplash.com/photo-1577968897966-3d4325b36b61?auto=format&fit=crop&w=800&q=80',
    artType: 'Layered Tulip'
  },
  {
    id: 'cold-brew',
    name: 'Cold Brew',
    tagline: 'Steeped Overnight, Drunk Unhurried',
    ratio: '1:8 (Coarse grind steeped in filtered ice water for 20 hours)',
    description: 'Cold water extraction bypasses volatile acids, yielding a naturally sweet, low-bitterness elixir with rich chocolate and blueberry undertones.',
    flavorProfile: ['Dark Berry', 'Smooth Molasses', 'Zero Sharp Acidity'],
    bestServed: 'Over a single clear hand-carved ice sphere with an orange twist.',
    strength: 4,
    image: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?auto=format&fit=crop&w=800&q=80',
    artType: 'Cold Cascade'
  },
  {
    id: 'iced-latte',
    name: 'Iced Latte',
    tagline: 'Chilled Milk with Espresso Float',
    ratio: '1:4 (Ice cubes + whole/oat milk + freshly pulled espresso poured on top)',
    description: 'The dramatic visual of golden espresso cascading through chilled white milk. Crisp, revitalizing, and customizable with vanilla or cinnamon.',
    flavorProfile: ['Refreshing Cold Milk', 'Bold Espresso Snap', 'Light Sweetness'],
    bestServed: 'In a tall ribbed highball glass with a reusable glass straw.',
    strength: 3,
    image: 'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?auto=format&fit=crop&w=800&q=80',
    artType: 'Espresso Cascade'
  },
  {
    id: 'macchiato',
    name: 'Espresso Macchiato',
    tagline: 'Espresso "Stained" with Warm Foam',
    ratio: '3:1 (Double espresso stained with a dollop of hot milk foam)',
    description: 'From the Italian word for "spotted". Built for purists who desire full espresso intensity with just a tender spoonful of milk foam.',
    flavorProfile: ['Pungent Roast', 'Warm Nutty Crema', 'Fleeting Creaminess'],
    bestServed: 'In a 3oz demitasse, stirred once with a silver spoon.',
    strength: 5,
    image: 'https://images.unsplash.com/photo-1485808191679-5f86510681a2?auto=format&fit=crop&w=800&q=80',
    artType: 'White Dot Stain'
  },
  {
    id: 'matcha',
    name: 'Ceremonial Matcha',
    tagline: 'Ancient Kyoto Zen in a Modern Bowl',
    ratio: '2g Ceremonial Tencha whisked with 60ml 80°C spring water',
    description: 'Stone-ground young green tea leaves rich in L-theanine and antioxidants. Promotes calm alertness without the jitters.',
    flavorProfile: ['Vibrant Umami', 'Sweet Spring Grass', 'Creamy Vegetal Cleanliness'],
    bestServed: 'In a handmade chawan bowl, whisked to a delicate emerald foam.',
    strength: 2,
    image: 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?auto=format&fit=crop&w=800&q=80',
    artType: 'Emerald Micro-froth'
  },
  {
    id: 'tea',
    name: 'Botanical Loose-Leaf Tea',
    tagline: 'Single-Estate Whole Leaves & Herbs',
    ratio: '3g whole leaf infused in 250ml temperature-controlled water',
    description: 'Carefully curated harvests from Darjeeling, Ceylon, and Taiwan. From fragrant floral oolongs to robust malty breakfast blends.',
    flavorProfile: ['Bergamot', 'Muscatel Grape', 'Himalayan Wildflower'],
    bestServed: 'In transparent glass teapots with sand timer for precise steeping.',
    strength: 2,
    image: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=800&q=80',
    artType: 'Amber Infusion'
  },
  {
    id: 'desserts',
    name: 'Artisanal Bakery & Desserts',
    tagline: 'Slow-Fermented Hearth Pastries',
    ratio: 'Crafted daily at 4:30am by master pastry chefs',
    description: 'Every morning bun, flaky croissant, and financier is designed specifically to harmonize with our single-origin espresso roasts.',
    flavorProfile: ['Cultured French Butter', 'Cardamom Crust', 'Valrhona Ganache'],
    bestServed: 'Warmed gently in our hearth stone oven alongside your coffee.',
    strength: 1,
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80',
    artType: 'Golden Flaky Crumb'
  }
];
