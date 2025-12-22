import { useEffect, useState } from "react";
import { ShoppingCart, Plus, Edit, Trash2, Package, AlertTriangle, DollarSign, Tag } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import { Button } from '../../components/Button';
import { StatCard } from '../../components/StatCard';

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

  const getCategoryColor = (category: string) => {
    const cat = category.toLowerCase();
    if (cat.includes('supplement') || cat.includes('protein')) return 'bg-green-50 border-green-200 text-green-700';
    if (cat.includes('equipment') || cat.includes('gear')) return 'bg-blue-50 border-blue-200 text-blue-700';
    if (cat.includes('apparel') || cat.includes('clothing')) return 'bg-purple-50 border-purple-200 text-purple-700';
    if (cat.includes('accessory') || cat.includes('accessories')) return 'bg-yellow-50 border-yellow-200 text-yellow-700';
    return 'bg-gray-50 border-gray-200 text-gray-700';
  };

  // -------------------------------
  // UI
  // -------------------------------
  if (loading)
    return <p className="text-gray-600 text-lg">Loading products...</p>;

  if (error)
    return <p className="text-red-600 text-lg">{error}</p>;

  return (
    <div className="space-y-8">
      <PageHeader
        icon={ShoppingCart}
        title="Products"
        subtitle="Manage gym products and inventory."
        actions={
          <Button
            onClick={() => openModal()}
          >
            <Plus size={18} className="mr-2" /> Add Product
          </Button>
        }
      />

      {/* STATS DASHBOARD */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard
          title="Total Products"
          value={products.length}
          icon={Package}
          description="Products in inventory"
          variant="success"
        />
        <StatCard
          title="Low Stock"
          value={products.filter(p => p.quantity < 10).length}
          icon={AlertTriangle}
          description="Products below 10 units"
          variant="error"
        />
        <StatCard
          title="Total Value"
          value={`₹${products.reduce((acc, p) => acc + (p.price * p.quantity), 0).toLocaleString()}`}
          icon={DollarSign}
          description="Total inventory value"
          variant="info"
        />
        <StatCard
          title="Categories"
          value={new Set(products.map(p => p.category)).size}
          icon={Tag}
          description="Product categories"
          variant="warning"
        />
      </div>

      <div className="bg-white shadow-sm rounded-lg p-6">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading products...</p>
            </div>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <div className="max-w-md mx-auto">
              <p className="text-red-600 text-lg font-medium mb-4">Error: {error}</p>
              <button
                onClick={loadProducts}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        ) : paginatedProducts.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-3">
              <ShoppingCart size={48} className="mx-auto" />
            </div>
            <p className="text-gray-500 text-lg font-medium">No products found</p>
            <p className="text-gray-400 text-sm mt-1">
              {searchTerm ? 'Try adjusting your search terms' : 'Add products to get started'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Search Bar */}
            <div className="flex items-center space-x-4">
              <div className="relative flex-1">
                <ShoppingCart size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search products by name or category..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedProducts.map((product) => (
                <div
                  key={product.id}
                  className={`relative bg-white border rounded-lg shadow-sm hover:shadow-md transition-all duration-200 p-6 ${getCategoryColor(product.category)}`}
                >
                  {/* Stock Status Badge */}
                  <div className="absolute top-3 right-3">
                    {product.quantity < 10 ? (
                      <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full border border-red-200">
                        Low Stock
                      </span>
                    ) : product.quantity < 50 ? (
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full border border-yellow-200">
                        Medium Stock
                      </span>
                    ) : (
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full border border-green-200">
                        In Stock
                      </span>
                    )}
                  </div>

                  {/* Product Icon */}
                  <div className="flex items-center mb-4">
                    <div className="p-2 bg-blue-100 rounded-full mr-3">
                      <Package size={20} className="text-blue-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 pr-16">{product.name}</h3>
                  </div>

                  {/* Product Details */}
                  <div className="space-y-3 mb-6">
                    <p className="text-gray-600 text-sm line-clamp-2">{product.description}</p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <DollarSign size={16} className="text-green-600" />
                        <span className="text-xl font-bold text-green-700">₹{product.price}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Package size={16} className="text-gray-600" />
                        <span className={`font-semibold ${
                          product.quantity < 10 ? 'text-red-600' : product.quantity < 50 ? 'text-yellow-600' : 'text-green-600'
                        }`}>{product.quantity} units</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Tag size={16} className="text-gray-500" />
                      <span className="text-sm text-gray-600 capitalize">{product.category}</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openModal(product)}
                      className="flex-1"
                    >
                      <Edit size={16} className="mr-1" /> Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => deleteProduct(product.id)}
                      className="flex-1"
                    >
                      <Trash2 size={16} className="mr-1" /> Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center space-x-2 mt-8">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <span className="px-4 py-2 text-sm text-gray-600">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            )}
          </div>
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
