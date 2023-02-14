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
}

export interface Price {
  id: string,
  date: string,
  entpId: string,
  goodId: string,
  goodPrice: number,
  goodName: string,
  review: string,
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
}

export interface ProductUplaod {
  goodId: string,
  goodName: string,
  goodSmlclsCode: string,
}

export type ProductUploads = Array<ProductUplaod>