export interface Logo {
  id: string;
  name: string;
  variant: 'horizontal' | 'icon' | 'dark' | 'light' | string;
  preview: string;
  svg?: string;
  png?: string;
}

export interface Favicon {
  preview: string;
  svg?: string;
  png?: string;
  ico?: string;
}

export interface Color {
  name: string;
  hex: string;
  rgb: string;
}

export interface Guidelines {
  preview: string;
  pdf?: string;
}

export interface ProductAssets {
  logos?: Logo[];
  favicon?: Favicon;
  colors: Color[];
  guidelines?: Guidelines;
}

export interface Product {
  id: string;
  name: string;
  tagline: string;
  logoUrl: string;
  assets: ProductAssets;
  createdAt?: string;
  updatedAt?: string;
}