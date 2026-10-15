import type { LocationBranch } from '../types/product';

export const LOCATIONS: LocationBranch[] = [
  {
    id: 'heritage-quarter',
    name: 'Brew & Bloom — Heritage Quarter (Flagship)',
    address: '42 Solstice Avenue, Old Town Arts District',
    city: 'San Francisco, CA',
    distance: '0.8 miles away',
    hoursWeekday: '7:00 AM — 7:00 PM',
    hoursWeekend: '8:00 AM — 8:00 PM',
    phone: '+1 (415) 890-2341',
    image: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=800&q=80',
    amenities: ['Sunlit Courtyard', 'Pour-Over Bar', 'High-Speed Wi-Fi', 'Hearth Bakery', 'Pet Friendly'],
    isFeatured: true
  },
  {
    id: 'botanical-gardens',
    name: 'Brew & Bloom — The Greenhouse Pavilion',
    address: '108 Flora Lane, Beside the Conservatory',
    city: 'Portland, OR',
    distance: '2.4 miles away',
    hoursWeekday: '7:30 AM — 6:30 PM',
    hoursWeekend: '8:00 AM — 7:00 PM',
    phone: '+1 (503) 712-9980',
    image: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=800&q=80',
    amenities: ['Living Moss Wall', 'Quiet Reading Nooks', 'Single-Origin Flights', 'Outdoor Patio'],
    isFeatured: false
  },
  {
    id: 'canal-docklands',
    name: 'Brew & Bloom — The Old Timber Roastery',
    address: '19 Merchant Wharf, Pier 4',
    city: 'Seattle, WA',
    distance: '3.1 miles away',
    hoursWeekday: '6:30 AM — 8:00 PM',
    hoursWeekend: '7:30 AM — 9:00 PM',
    phone: '+1 (206) 430-8812',
    image: 'https://images.unsplash.com/photo-1442512595331-e89e73853f31?auto=format&fit=crop&w=800&q=80',
    amenities: ['Live Roastery View', 'Cupping Workshops', 'Espresso Lab', 'Dockside Seating'],
    isFeatured: false
  },
  {
    id: 'hilltop-library',
    name: 'Brew & Bloom — Hilltop Sanctuary',
    address: '77 Vista Crest Road, Near City Viewpoint',
    city: 'Austin, TX',
    distance: '4.5 miles away',
    hoursWeekday: '8:00 AM — 6:00 PM',
    hoursWeekend: '8:30 AM — 6:30 PM',
    phone: '+1 (512) 670-3490',
    image: 'https://images.unsplash.com/photo-1521017432531-fbd92d768814?auto=format&fit=crop&w=800&q=80',
    amenities: ['Curated Book Library', 'Acoustic Evenings', 'Artisan Loose Leaf Tea', 'Bike Racks'],
    isFeatured: false
  }
];
