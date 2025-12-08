import { useEffect, useState } from "react";

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  quantity: number;
  category: string;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);

  // Form states
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    quantity: "",
    category: "",
  });

  // -------------------------------
  // Load Products
  // -------------------------------
  async function loadProducts() {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("http://localhost:8002/products");

      if (!res.ok) {
        setError("Failed to fetch products");
        return;
      }

      const data = await res.json();
      setProducts(data || []);
    } catch {
      setError("Server unreachable");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProducts();
  }, []);

  // -------------------------------
  // Handle Input
  // -------------------------------
  function updateForm(e: any) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  // -------------------------------
  // Open Modal (Add or Edit)
  // -------------------------------
  function openModal(product?: Product) {
    if (product) {
      setEditProduct(product);
      setForm({
        name: product.name,
        description: product.description,
        price: product.price.toString(),
        quantity: product.quantity.toString(),
        category: product.category,
      });
    } else {
      setEditProduct(null);
      setForm({
        name: "",
        description: "",
        price: "",
        quantity: "",
        category: "",
      });
    }
    setShowModal(true);
  }

  // -------------------------------
  // Save Product (Create / Update)
  // -------------------------------
  async function saveProduct() {
    const payload = {
      name: form.name,
      description: form.description,
      price: Number(form.price),
      quantity: Number(form.quantity),
      category: form.category,
    };

    const url = editProduct
      ? `http://localhost:8002/products/${editProduct.id}`
      : "http://localhost:8002/products";

    const method = editProduct ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      alert("Failed to save product");
      return;
    }

    setShowModal(false);
    loadProducts();
  }

  // -------------------------------
  // Delete Product
  // -------------------------------
  async function deleteProduct(id: number) {
    if (!confirm("Are you sure?")) return;

    const res = await fetch(`http://localhost:8002/products/${id}`, {
      method: "DELETE",
    });

    if (!res.ok) {
      alert("Delete failed");
      return;
    }

    loadProducts();
  }

  // -------------------------------
  // UI
  // -------------------------------
  if (loading)
    return <p className="text-gray-600 text-lg">Loading products...</p>;

  if (error)
    return <p className="text-red-600 text-lg">{error}</p>;

  return (
    <div>
      <div className="flex justify-between mb-6">
        <h1 className="text-3xl font-bold">Products</h1>

        <button
          onClick={() => openModal()}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          + Add Product
        </button>
      </div>

      <div className="bg-white shadow rounded-lg p-6 overflow-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b bg-gray-100 text-left">
              <th className="p-3">#</th>
              <th className="p-3">Name</th>
              <th className="p-3">Price</th>
              <th className="p-3">Qty</th>
              <th className="p-3">Category</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>

          <tbody>
            {products.map((p, index) => (
              <tr key={p.id} className="border-b hover:bg-gray-50">
                <td className="p-3">{index + 1}</td>
                <td className="p-3 font-semibold">{p.name}</td>
                <td className="p-3">₹{p.price}</td>
                <td className="p-3">{p.quantity}</td>
                <td className="p-3">{p.category}</td>

                <td className="p-3 flex gap-2">
                  <button
                    onClick={() => openModal(p)}
                    className="px-3 py-1 bg-green-600 text-white rounded"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => deleteProduct(p.id)}
                    className="px-3 py-1 bg-red-600 text-white rounded"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}

            {products.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center text-gray-500 p-6">
                  No products found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center">
          <div className="bg-white p-8 rounded shadow-lg w-96">
            <h2 className="text-xl font-bold mb-4">
              {editProduct ? "Edit Product" : "Add Product"}
            </h2>

            <div className="space-y-3">
              <input
                name="name"
                value={form.name}
                onChange={updateForm}
                placeholder="Product Name"
                className="w-full p-2 border rounded"
              />

              <input
                name="description"
                value={form.description}
                onChange={updateForm}
                placeholder="Description"
                className="w-full p-2 border rounded"
              />

              <input
                name="price"
                value={form.price}
                onChange={updateForm}
                placeholder="Price"
                type="number"
                className="w-full p-2 border rounded"
              />

              <input
                name="quantity"
                value={form.quantity}
                onChange={updateForm}
                placeholder="Quantity"
                type="number"
                className="w-full p-2 border rounded"
              />

              <input
                name="category"
                value={form.category}
                onChange={updateForm}
                placeholder="Category"
                className="w-full p-2 border rounded"
              />
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 border rounded"
              >
                Cancel
              </button>

              <button
                onClick={saveProduct}
                className="px-4 py-2 bg-blue-600 text-white rounded"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
