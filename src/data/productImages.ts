export interface ProductImageData {
  id: string;
  name: string;
  image: string;
  disclaimer: string;
}

export const DISCLAIMER_TEXT = "The images are for booking purpose only. The original product may change.";

export const PRODUCT_IMAGES_MAP: Record<string, ProductImageData> = {
  'desk-table': {
    id: 'desk-table',
    name: 'Desk Table',
    image: '/images/extras/desk-table.jpg',
    disclaimer: DISCLAIMER_TEXT
  },
  'reception-counter': {
    id: 'reception-counter',
    name: 'Lockable Counter Table',
    image: '/images/extras/reception-counter.jpg',
    disclaimer: DISCLAIMER_TEXT
  },
  'glass-round-table': {
    id: 'glass-round-table',
    name: 'Glass Round Table',
    image: '/images/extras/glass-round-table.jpg',
    disclaimer: DISCLAIMER_TEXT
  },
  'glass-table': {
    id: 'glass-table',
    name: 'Round Glass Meeting Table',
    image: '/images/extras/glass-table.jpg',
    disclaimer: DISCLAIMER_TEXT
  },
  'white-chair': {
    id: 'white-chair',
    name: 'White Chair',
    image: '/images/extras/white-chair.jpg',
    disclaimer: DISCLAIMER_TEXT
  },
  'exhibition-chair': {
    id: 'exhibition-chair',
    name: 'Standard Visitor Chair',
    image: '/images/extras/exhibition-chair.jpg',
    disclaimer: DISCLAIMER_TEXT
  },
  'cushioned-chair': {
    id: 'cushioned-chair',
    name: 'Cushioned Chair',
    image: '/images/extras/cushioned-chair.jpg',
    disclaimer: DISCLAIMER_TEXT
  },
  'sofa-single': {
    id: 'sofa-single',
    name: 'Single Seater Armchair',
    image: '/images/extras/sofa-single.jpg',
    disclaimer: DISCLAIMER_TEXT
  },
  'sofa-double': {
    id: 'sofa-double',
    name: 'Sofa — Double Seat',
    image: '/images/extras/sofa-double.jpg',
    disclaimer: DISCLAIMER_TEXT
  },
  'sofa-2seater': {
    id: 'sofa-2seater',
    name: 'VIP 2-Seater Leather Sofa',
    image: '/images/extras/sofa-2seater.jpg',
    disclaimer: DISCLAIMER_TEXT
  },
  'sofa-three': {
    id: 'sofa-three',
    name: 'Sofa — Three Seat',
    image: '/images/extras/sofa-three.jpg',
    disclaimer: DISCLAIMER_TEXT
  },
  'glass-centre-table': {
    id: 'glass-centre-table',
    name: 'Glass Centre Table',
    image: '/images/extras/glass-centre-table.jpg',
    disclaimer: DISCLAIMER_TEXT
  },
  'brochure-rack': {
    id: 'brochure-rack',
    name: 'Brochure Rack',
    image: '/images/extras/brochure-rack.jpg',
    disclaimer: DISCLAIMER_TEXT
  },
  'brochure-stand': {
    id: 'brochure-stand',
    name: 'Acrylic Catalogue / Brochure Stand',
    image: '/images/extras/brochure-stand.jpg',
    disclaimer: DISCLAIMER_TEXT
  },
  'glass-shelf': {
    id: 'glass-shelf',
    name: 'Glass Shelf',
    image: '/images/extras/glass-shelf.jpg',
    disclaimer: DISCLAIMER_TEXT
  },
  'wooden-shelf': {
    id: 'wooden-shelf',
    name: 'Wooden Shelf',
    image: '/images/extras/wooden-shelf.jpg',
    disclaimer: DISCLAIMER_TEXT
  },
  'garment-stand': {
    id: 'garment-stand',
    name: 'Garment Stand',
    image: '/images/extras/garment-stand.jpg',
    disclaimer: DISCLAIMER_TEXT
  },
  'display-rack': {
    id: 'display-rack',
    name: 'Fabric Hangers / Garment Display Rack',
    image: '/images/extras/display-rack.jpg',
    disclaimer: DISCLAIMER_TEXT
  },
  'spot-light': {
    id: 'spot-light',
    name: 'Spot Light (50W)',
    image: '/images/extras/spot-light.jpg',
    disclaimer: DISCLAIMER_TEXT
  },
  'metal-halide': {
    id: 'metal-halide',
    name: 'Metal Halide Light',
    image: '/images/extras/metal-halide.jpg',
    disclaimer: DISCLAIMER_TEXT
  },
  'power-socket': {
    id: 'power-socket',
    name: 'Power Socket Connection',
    image: '/images/extras/power-socket.jpg',
    disclaimer: DISCLAIMER_TEXT
  },
  'plug-point': {
    id: 'plug-point',
    name: 'Plug Point',
    image: '/images/extras/plug-point.jpg',
    disclaimer: DISCLAIMER_TEXT
  },
  'tv-screen': {
    id: 'tv-screen',
    name: '55" 4K Smart TV',
    image: '/images/extras/tv-screen.jpg',
    disclaimer: DISCLAIMER_TEXT
  },
  'plasma-32': {
    id: 'plasma-32',
    name: 'Plasma Screen with Stand — 32"',
    image: '/images/extras/plasma-32.jpg',
    disclaimer: DISCLAIMER_TEXT
  },
  'pedestal-fan': {
    id: 'pedestal-fan',
    name: 'Pedestal Fan',
    image: '/images/extras/pedestrian-fan.jpg',
    disclaimer: DISCLAIMER_TEXT
  },
  'female-model': {
    id: 'female-model',
    name: 'Promotional Female Model / Hostess',
    image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80',
    disclaimer: DISCLAIMER_TEXT
  },
  'male-model': {
    id: 'male-model',
    name: 'Promotional Male Model / Host',
    image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=600&q=80',
    disclaimer: DISCLAIMER_TEXT
  }
};

export function getProductImage(productId: string): string {
  return PRODUCT_IMAGES_MAP[productId]?.image || '/images/extras/desk-table.jpg';
}
