export interface Host {
  id: number;
  name: string;
  avatar: string;
}

export interface Rating {
  total: number;
  count: number;
}

export interface Picture {
  name: string;
  preview: string;
  url: string;
}

export interface Pictures {
  total: number;
  items: Picture[];
}

export interface Geo {
  lat: number;
  lng: number;
}

export interface Extra {
  count: number;
  price: number;
  total: number;
}

export interface Discount {
  type: string;
  percent: number;
  amount: number;
}

export interface Invoice {
  extra: Extra;
  discounts: Discount[];
  final: number;
  prices: {
    [key: string]: number;
  };
}

export interface Location {
  id: number;
  host: Host;
  province_name: string;
  city_name: string;
  url: string;
  short_url: string;
  title: string;
  room_number: number;
  floor_area: number;
  guest_number: number;
  max_guest_number: number;
  is_clean: boolean;
  is_plus: boolean;
  is_new: boolean;
  price: number;
  firstbook_discount: number;
  rating: Rating;
  pictures: Pictures;
  success_books: number;
  published_at: string;
  extra_price: number;
  price_after_discount: number;
  weekly_discount: number;
  weekly_discount_min_nights: number;
  monthly_discount: number;
  monthly_discount_min_nights: number;
  geo: Geo;
  is_instant: boolean;
  bedrooms: number;
  units_count: number;
  min_price: number;
  invoice: Invoice;
} 