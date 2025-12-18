import { useEffect, useState } from "react";
import { ShoppingCart } from 'lucide-react'; // Import the icon
import PageHeader from '../../components/PageHeader'; // Import PageHeader
import Table from "../../components/Table";

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

  /* SEARCH AND PAGINATION STATE */
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 10; // You can adjust this number

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

  /* FILTER AND PAGINATE PRODUCTS */
  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

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
      <PageHeader
        icon={ShoppingCart}
        title="Products"
        subtitle="Manage gym products and inventory."
        actions={
          <button
            onClick={() => openModal()}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            + Add Product
          </button>
        }
      />

      <div className="bg-white shadow rounded-lg p-6 overflow-auto">
        {loading ? (
          <div className="p-6 text-center">Loading products...</div>
        ) : error ? (
          <div className="p-6 text-center text-red-600">Error: {error}</div>
        ) : paginatedProducts.length === 0 ? (
          <div className="text-center text-gray-500 p-6">No products found.</div>
        ) : (
          <Table
            headers={["#", "Name", "Price", "Qty", "Category", "Actions"]}
            columnClasses={['w-1/12 text-center', 'w-3/12', 'w-2/12', 'w-1/12', 'w-2/12', 'w-3/12 text-center']}
            data={paginatedProducts}
            renderCells={(p, index) => [
              index + 1 + (currentPage - 1) * itemsPerPage,
              <span className="font-semibold">{p.name}</span>,
              `₹${p.price}`,
              p.quantity,
              p.category,
              <div className="flex gap-2 justify-center">
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
              </div>,
            ]}
            keyExtractor={(p) => p.id}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            searchPlaceholder="Search products by name or category..."
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
          />
        )}
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
