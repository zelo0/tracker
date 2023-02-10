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