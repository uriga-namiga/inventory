export interface Product {
  id: number;
  name: string;
  image_url: string;
  purchase_price: number;
  sale_price: number;
  margin_rate: number;
  quantity: number;
  link: string;
  supplier: string | null;
  purchase_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface Supplier {
  id: number;
  name: string;
  created_at: string;
}
