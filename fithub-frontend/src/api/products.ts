import type { Product, ProductAssignment } from "../types/Product";

/**
 * Fetch all available products
 */
export async function fetchAllProducts(): Promise<Product[]> {
  const res = await fetch("http://localhost:8002/products");
  if (!res.ok) return [];
  return (await res.json()) as Product[];
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
