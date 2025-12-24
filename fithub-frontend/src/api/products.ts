import type { Product, ProductAssignment } from "../types/Product";

/**
 * Fetch all available products with pagination, sorting, and filtering
 */
export interface ProductPage {
  content: Product[];
  totalPages: number;
  totalElements: number;
  number: number; // current page (0-based)
  size: number;
}

export async function fetchAllProducts({
  page = 0,
  size = 10,
  sortBy = 'id',
  sortDir = 'asc',
  search = ''
}: {
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: string;
  search?: string;
} = {}): Promise<ProductPage | null> {
  const params = new URLSearchParams({
    page: String(page),
    size: String(size),
    sortBy,
    sortDir,
  });
  if (search) params.append('search', search);
  const res = await fetch(`http://localhost:8002/products?${params.toString()}`);
  if (!res.ok) return null;
  return (await res.json()) as ProductPage;
}

/**
 * Fetch assigned products for a member
 */
export async function loadProducts(memberId: number): Promise<ProductAssignment[]> {
  const res = await fetch(`http://localhost:8002/products/assigned/${memberId}`);
  if (!res.ok) return [];
  return (await res.json()) as ProductAssignment[];
}

/**
 * Assign a product to a member
 */
export async function assignProductToMember(
  memberId: number,
  productId: number
): Promise<boolean> {
  const res = await fetch(
    `http://localhost:8002/products/assign/${memberId}/${productId}`,
    { method: "POST" }
  );
  return res.ok;
}

/**
 * Remove an assigned product
 */
export async function deleteAssignedProduct(id: number): Promise<boolean> {
  const res = await fetch(
    `http://localhost:8002/products/assigned/delete/${id}`,
    { method: "DELETE" }
  );
  return res.ok;
}
