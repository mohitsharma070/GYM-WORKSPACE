import { useState, useMemo } from "react";
import type { Product } from "../types/Product";

interface Props {
  products: Product[];
  loading?: boolean;
  onSelect: (productId: number) => void;
  onClose: () => void;
}

export default function AssignProductModal({
  products,
  loading = false,
  onSelect,
  onClose,
}: Props) {
  const [search, setSearch] = useState("");

  const filteredProducts = useMemo(() => {
    return products.filter((p) =>
      p.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [search, products]);

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center">
      <div className="bg-white p-6 rounded-lg w-96 shadow-lg">
        <h2 className="text-xl font-bold mb-4">Assign Product</h2>

        {/* SEARCH */}
        <input
          type="text"
          placeholder="Search product..."
          className="w-full border p-2 rounded mb-3"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {/* LOADING STATE */}
        {loading && (
          <div className="text-center py-6 text-gray-500">Loading...</div>
        )}

        {/* EMPTY STATE */}
        {!loading && filteredProducts.length === 0 && (
          <div className="text-center py-6 text-gray-500">
            No products found.
          </div>
        )}

        {/* PRODUCT LIST */}
        {!loading && filteredProducts.length > 0 && (
          <ul className="space-y-3 max-h-72 overflow-auto">
            {filteredProducts.map((prod) => (
              <li
                key={prod.id}
                className="p-3 border rounded bg-gray-50 hover:bg-gray-100 cursor-pointer transition"
                onClick={() => onSelect(prod.id)}
              >
                <strong>{prod.name}</strong> — ₹{prod.price}
                <p className="text-sm text-gray-600">{prod.description}</p>
              </li>
            ))}
          </ul>
        )}

        {/* FOOTER */}
        <div className="flex justify-end mt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded hover:bg-gray-100"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
