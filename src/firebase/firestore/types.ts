export interface ProductForm {
  name: string,
  price: number,
  review: string,
}

export interface Product extends ProductForm {
  id: string,
  updatedTime: string,
}

export type Products = Array<Product>


export interface PriceForm {
  goodId: string,
  goodPrice: number,
}

export interface Price {
  id: string,
  date: string,
  entpId: string,
  goodId: string,
  goodPrice: number,
  goodName: string,
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