export interface Part {
  id: number;
  name: string;
  category: string;
  price: number;
  image_url: string;
  created_at: string;
  updated_at: string;
}

export interface CartItem {
  part: Part;
  quantity: number;
}

export interface Cart {
  items: CartItem[];
  totalPrice: number;
}

export interface StoredCart {
  items: { partId: number; quantity: number }[];
  lastUpdated: string;
}

export const CATEGORIES = [
  '전체',
  '헤드',
  '코어',
  '팔',
  '다리',
  '무기',
  '액세서리'
] as const;

export type Category = typeof CATEGORIES[number];

export type ImageSize = 'small' | 'medium' | 'large';
