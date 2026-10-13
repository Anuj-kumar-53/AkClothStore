import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../../utils/api";

function ManageVariants() {
  const { productId } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [variants, setVariants] = useState([]);
  const [sizeCharts, setSizeCharts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingVariant, setEditingVariant] = useState(null);
  const [formData, setFormData] = useState({
    sku: "",
    name: "",
    color: "",
    size: "",
    material: "",
    mrp: "",
    sellingPrice: "",
    stockQuantity: "",
    lowStockThreshold: "",
    sizeChart: "",
    isActive: true,
  });
  const [images, setImages] = useState([]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError("");
      try {
        // Fetch product family
        const productRes = await api.get(`/products/${productId}`);
        // The endpoint for product by ID is not directly available; we'll fetch via slug if possible.
        // Since we have productId, we may need an endpoint or use the list and find.
        // For now, we'll assume we can use GET /products/:id (admin only) - but our public route uses slug.
        // We'll use the public list endpoint and find by _id.
        const listRes = await api.get(`/products?limit=100`);
        const found = listRes.data.data.find((p) => p._id === productId);
        setProduct(found || { name: "Unknown Product" });

        // Fetch variants for this product
        // We need an endpoint to fetch variants by product family ID. We'll use the public product by slug if we have slug.
        if (found) {
          const variantRes = await api.get(`/products/${found.slug}`);
          setVariants(variantRes.data.data.variants || []);
        } else {
          // Fallback: fetch all products and find variants (inefficient but works for now)
          const allProducts = listRes.data.data;
          const target = allProducts.find((p) => p._id === productId);
          if (target && target.variants) {
            setVariants(target.variants);
          } else {
            setVariants([]);
          }
        }

        // Fetch size charts (optional)
        const sizeChartRes = await api.get("/categories"); // placeholder; not used for now
        setSizeCharts([]);
      } catch (err) {
        console.error("Failed to fetch data:", err);
        setError("Unable to load variants.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [productId]);

  const resetForm = () => {
    setFormData({
      sku: "",
      name: "",
      color: "",
      size: "",
      material: "",
      mrp: "",
      sellingPrice: "",
      stockQuantity: "",
      lowStockThreshold: "",
      sizeChart: "",
      isActive: true,
    });
    setImages([]);
    setEditingVariant(null);
    setShowForm(false);
  };

  const handleEdit = (variant) => {
    setEditingVariant(variant);
    setFormData({
      sku: variant.sku,
      name: variant.name,
      color: variant.attributes?.color || "",
      size: variant.attributes?.size || "",
      material: variant.attributes?.material || "",
      mrp: variant.price?.mrp || "",
      sellingPrice: variant.price?.sellingPrice || "",
      stockQuantity: variant.stock?.quantity || "",
      lowStockThreshold: variant.stock?.lowStockThreshold || "",
      sizeChart: variant.sizeChart || "",
      isActive: variant.isActive,
    });
    setImages([]);
    setShowForm(true);
    setMessage("");
  };

  const handleFileChange = (e) => {
    setImages(e.target.files);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    setError("");

    // Build attributes object
    const attributes = {
      color: formData.color,
      size: formData.size,
      material: formData.material,
    };

    const payload = {
      sku: formData.sku,
      name: formData.name,
      attributes,
      price: {
        mrp: Number(formData.mrp),
        sellingPrice: Number(formData.sellingPrice),
        discount: formData.mrp > 0 ? Math.round(((formData.mrp - formData.sellingPrice) / formData.mrp) * 100) : 0,
      },
      stock: {
        quantity: Number(formData.stockQuantity),
        lowStockThreshold: Number(formData.lowStockThreshold),
        isInStock: Number(formData.stockQuantity) > 0,
      },
      sizeChart: formData.sizeChart || null,
      isActive: formData.isActive,
    };

    try {
      if (editingVariant) {
        await api.put(`/products/variants/${editingVariant._id}`, payload);
        setMessage("Variant updated.");
      } else {
        // Add variant to the product family
        await api.post(`/products/${productId}/variants`, payload);
        setMessage("Variant added.");
      }
      resetForm();
      // Refresh variants
      const res = await api.get(`/products?limit=100`);
      const found = res.data.data.find((p) => p._id === productId);
      if (found) {
        const variantRes = await api.get(`/products/${found.slug}`);
        setVariants(variantRes.data.data.variants || []);
      }
    } catch (err) {
      console.error("Save variant failed:", err);
      setError(err.response?.data?.message || "Unable to save variant.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this variant?")) return;
    setError("");
    try {
      await api.delete(`/products/variants/${id}`);
      setMessage("Variant deleted.");
      // Refresh variants
      const res = await api.get(`/products?limit=100`);
      const found = res.data.data.find((p) => p._id === productId);
      if (found) {
        const variantRes = await api.get(`/products/${found.slug}`);
        setVariants(variantRes.data.data.variants || []);
      }
    } catch (err) {
      console.error("Delete failed:", err);
      setError("Unable to delete variant.");
    }
  };

  if (loading) {
    return <div className="p-8 text-center">Loading variants...</div>;
  }

  return (
    <div>
      <div className="flex items-center mb-6">
        <Link to="/admin/products" className="text-blue-600 hover:text-blue-800 mr-4">
          ← Back to Products
        </Link>
        <h1 className="text-3xl font-bold">Variants: {product?.name || "Product"}</h1>
      </div>

      <div className="flex justify-end mb-4">
        <button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          + Add Variant
        </button>
      </div>

      {message && (
        <div className="mb-4 p-3 bg-green-50 text-green-700 rounded">{message}</div>
      )}
      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-600 rounded">{error}</div>
      )}

      {/* Variant Form */}
      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-xl font-semibold mb-4">
            {editingVariant ? "Edit Variant" : "New Variant"}
          </h2>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">SKU *</label>
                <input
                  type="text"
                  required
                  value={formData.sku}
                  onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Color</label>
                <input
                  type="text"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Size</label>
                <input
                  type="text"
                  value={formData.size}
                  onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Material</label>
                <input
                  type="text"
                  value={formData.material}
                  onChange={(e) => setFormData({ ...formData, material: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">MRP *</label>
                <input
                  type="number"
                  required
                  min="0"
                  value={formData.mrp}
                  onChange={(e) => setFormData({ ...formData, mrp: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Selling Price *</label>
                <input
                  type="number"
                  required
                  min="0"
                  value={formData.sellingPrice}
                  onChange={(e) => setFormData({ ...formData, sellingPrice: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Stock Quantity *</label>
                <input
                  type="number"
                  required
                  min="0"
                  value={formData.stockQuantity}
                  onChange={(e) => setFormData({ ...formData, stockQuantity: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Low Stock Threshold</label>
                <input
                  type="number"
                  min="0"
                  value={formData.lowStockThreshold}
                  onChange={(e) => setFormData({ ...formData, lowStockThreshold: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Size Chart</label>
                <select
                  value={formData.sizeChart}
                  onChange={(e) => setFormData({ ...formData, sizeChart: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                >
                  <option value="">None</option>
                  {/* Size charts should be fetched from API; for now empty */}
                </select>
              </div>
              <div className="flex items-end">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  />
                  Active
                </label>
              </div>
              <div className="sm:col-span-3">
                <label className="block text-sm font-medium mb-1">Images</label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileChange}
                  className="border rounded px-3 py-2"
                />
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
              >
                {saving ? "Saving..." : editingVariant ? "Update" : "Create"}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Variants List */}
      {variants.length === 0 ? (
        <div className="text-center py-8 text-gray-500">No variants yet.</div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">SKU</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Name</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Attributes</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Price</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Stock</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {variants.map((variant) => (
                <tr key={variant._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-mono">{variant.sku}</td>
                  <td className="px-4 py-3">{variant.name}</td>
                  <td className="px-4 py-3 text-sm">
                    {variant.attributes?.color && `Color: ${variant.attributes.color}`}
                    {variant.attributes?.size && `, Size: ${variant.attributes.size}`}
                    {variant.attributes?.material && `, Material: ${variant.attributes.material}`}
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium">₹{variant.price?.sellingPrice}</p>
                    {variant.price?.mrp > variant.price?.sellingPrice && (
                      <p className="text-xs text-gray-500 line-through">₹{variant.price.mrp}</p>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        variant.stock?.quantity > 0 ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                      }`}
                    >
                      {variant.stock?.quantity}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right space-x-2">
                    <button
                      onClick={() => handleEdit(variant)}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(variant._id)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default ManageVariants;