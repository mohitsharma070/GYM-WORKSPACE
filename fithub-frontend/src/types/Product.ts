export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  quantity: number;
  category: string;
}

export interface ProductAssignment {
  id: number;
  assignedDate: string;
  product: Product;
}
