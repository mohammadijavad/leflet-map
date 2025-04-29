export interface Location {
  lat: number;
  long: number;
  price: number;
  image:string;
  title:string
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
    [key: string]: number | undefined;
  };
} 