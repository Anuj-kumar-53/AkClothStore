import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../utils/api";

function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true); setError("");
      try {
        const res = await api.get("/admin/stats");
        setStats(res.data.data);
      } catch {
        setError("Unable to load dashboard stats.");
      } finally { setLoading(false); }
    };
    fetchStats();
  }, []);

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-gray-400"></div>
    </div>
  );

  if (error) return <div className="p-6 text-red-500 text-sm">{error}</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
        {/* Orders */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-medium text-gray-500">Orders</h2>
            <span className="text-2xl">📋</span>
          </div>
          <p className="text-3xl font-bold text-gray-900 mb-3">{stats.orders.total}</p>
          <div className="space-y-1.5">
            {[
              { label: "Pending", val: stats.orders.pending, color: "text-yellow-600" },
              { label: "Confirmed", val: stats.orders.confirmed, color: "text-blue-600" },
              { label: "Delivered", val: stats.orders.delivered, color: "text-green-600" },
              { label: "Cancelled", val: stats.orders.cancelled, color: "text-red-500" },
            ].map(({ label, val, color }) => (
              <div key={label} className="flex justify-between text-sm">
                <span className="text-gray-500">{label}</span>
                <span className={`font-semibold ${color}`}>{val}</span>
              </div>
            ))}
          </div>
          <Link to="/admin/orders" className="block mt-4 text-xs text-gray-400 hover:text-gray-700 transition-colors">View all orders →</Link>
        </div>

        {/* Products */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-medium text-gray-500">Products</h2>
            <span className="text-2xl">📦</span>
          </div>
          <p className="text-3xl font-bold text-gray-900 mb-3">{stats.products.total}</p>
          <div className="space-y-1.5">
            {[
              { label: "Variants", val: stats.products.variants, color: "text-gray-700" },
              { label: "Low Stock", val: stats.products.lowStock, color: "text-yellow-600" },
              { label: "Out of Stock", val: stats.products.outOfStock, color: "text-red-500" },
            ].map(({ label, val, color }) => (
              <div key={label} className="flex justify-between text-sm">
                <span className="text-gray-500">{label}</span>
                <span className={`font-semibold ${color}`}>{val}</span>
              </div>
            ))}
          </div>
          <Link to="/admin/products" className="block mt-4 text-xs text-gray-400 hover:text-gray-700 transition-colors">Manage products →</Link>
        </div>

        {/* Quick Links */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h2 className="text-sm font-medium text-gray-500 mb-4">Quick Actions</h2>
          <div className="space-y-2">
            {[
              { to: "/admin/products", label: "Manage Products", icon: "📦" },
              { to: "/admin/categories", label: "Categories", icon: "🗂️" },
              { to: "/admin/brands", label: "Brands", icon: "🏷️" },
              { to: "/admin/orders", label: "Orders", icon: "📋" },
            ].map(({ to, label, icon }) => (
              <Link key={to} to={to} className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors">
                <span>{icon}</span>{label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;