export interface CategoryItem {
  _id: string;
  categoryname: string;
  subCategories?: string[];
  order?: number;
}

export interface MediaItem {
  _id: string;
  title?: string;
  key: string;
  mediaUrl: string;
  mediaType: "image" | "video";
  createdAt?: string;
}

export interface ProductSize {
  label: string;
  regularPrice: number;
  salePrice: number;
  discount?: string;
}

export interface ProductItem {
  _id: string;
  slug?: string;
  name: string;
  categoryname?: { _id: string; categoryname: string } | string;
  subCategory?: string;
  stock: number;
  regularPrice: number;
  salePrice: number;
  discount?: string;
  description?: string;
  images: string[];
  colors?: string[];
  colorSwatches?: { name: string; hex?: string }[];
  sizes?: ProductSize[];
  isPublished?: boolean;
  isBestSeller?: boolean;
  isNewArrival?: boolean;
  ratings?: number;
  numReviews?: number;
}

export type Product = ProductItem;
