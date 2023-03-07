import type { Place } from "@/components/KakaoMap";

export interface ProductForm {
  goodName: string,
  description: string | undefined,
}

export interface Product extends ProductForm {
  id: string,
  updatedTime: string,
}

export type Products = Array<Product>


export interface PriceForm {
  goodId: string,
  goodPrice: number,
  review: string,
  place: Place | null
}

export interface Price {
  id: string,
  date: string,
  placeId?: string,
  goodId: string,
  goodPrice: number,
  goodName: string,
  review: string,
  userEmail: string
}

export type Prices = Array<Price>;


export interface StatisticUpload {
  goodId: string,
  date: Date,
  minPrice: number,
  maxPrice: number,
  // medianPrice: number
}

export interface PriceUpload {
  goodId: string,
  goodPrice: number
  date: Date,
  userEmail: String,
  placeId?: String,
}

export interface ProductUplaod {
  goodId: string,
  goodName: string,
  goodSmlclsCode: string,
}

export type ProductUploads = Array<ProductUplaod>

export interface PlaceResponse extends Place {
  id: String
}

export interface MinMaxPrice { 
  date: string, 
  minPrice: number, 
  maxPrice: number, 
}