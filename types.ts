export interface Product {
  id: string;
  name: string;
  category: string;
  type?: 'clothing' | 'footwear'; // New field for Type Selector
  price: number;
  originalPrice?: number;
  images: string[];
  sizes: string[];
  fit?: string;
  tags: string[];
  isNew?: boolean;
  description?: string;
}

export interface Category {
  id: string;
  name: string;
  image?: string;
}

export interface HeroSlide {
  id: string;
  title: string;
  subtitle: string;
  buttonText: string;
  image: string;
}


export interface Order {
  id: string; // UUID
  display_id: number; // #1024
  product_ids: string[]; // Array of SVG IDs
  status: 'Pendiente' | 'Confirmado en Mercado' | 'En Camino' | 'Entregado';
  supplier_info?: string;
  payment_method?: 'Efectivo' | 'QR' | 'Transferencia';
  total_amount: number;
  delivery_cost: number;
  created_at?: string;
  customerInfo?: {
    name?: string;
    phone?: string;
    location?: {
      lat: number;
      lng: number;
    }
  };
  // Optional expanded items for UI (fetched separately or joined)
  items?: Product[];
}

export interface SocialConfig {
  instagram: string;
  tiktok: string;
  facebook?: string;
  email: string;
  whatsapp: string;
  address?: string;
  shippingText?: string;
}

export interface BlogPost {
  id: string;
  title: string;
  image: string;
  content: string; // The "comentario" or body
  author: string;
  date: string;
  rating?: number; // For the "5 stars" request
  tags?: string[];
  tag?: string; // Singular tag for older posts or specific override
}

export interface DeliveryZone {
  id: string;
  name: string;
  price: number;
  points: { lat: number; lng: number }[]; // Polygon coordinates
  color: string;
}

// Point in Polygon Algorithm (Ray Casting)
export const isPointInPolygon = (point: { lat: number, lng: number }, vs: { lat: number, lng: number }[]) => {
  // ray-casting algorithm based on
  // https://github.com/substack/point-in-polygon
  const x = point.lat, y = point.lng;
  let inside = false;
  for (let i = 0, j = vs.length - 1; i < vs.length; j = i++) {
    const xi = vs[i].lat, yi = vs[i].lng;
    const xj = vs[j].lat, yj = vs[j].lng;

    const intersect = ((yi > y) !== (yj > y))
      && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
};

export interface NavbarLink {
  id: string;
  label: string;
  path: string;
}

export interface BannerBento {
  id: string; // 'large', 'top_right', 'bottom_right'
  title: string;
  subtitle?: string;
  buttonText?: string;
  image: string;
  link: string;
}

export interface LifestyleConfig {
  sectionTitle: string;
  sectionSubtitle: string;
  buttonText: string;
  buttonLink: string;
}
