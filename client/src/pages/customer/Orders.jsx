import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import api from "../../utils/api";

function Orders() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isSignedIn } = useUser();

  const [orders, setOrders] = useState([]);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });

  useEffect(() => {
    if (!isSignedIn) { navigate("/sign-in"); return; }

    if (id) {
      const fetchOrder = async () => {
        setLoading(true); setError("");
        try {
          const res = await api.get(`/orders/${id}`);
          setOrder(res.data.data);
        } catch (err) {
          setError("Order not found.");
        } finally { setLoading(false); }
      };
      fetchOrder();
    } else {
      const fetchOrders = async () => {
        setLoading(true); setError("");
        try {
          const res = await api.get(`/orders?page=${page}&limit=10`);
          setOrders(res.data.data || []);
          setPagination({ page: res.data.page, pages: res.data.pages, total: res.data.total });
        } catch (err) {
          setError("Unable to load orders.");
        } finally { setLoading(false); }
      };
      fetchOrders();
    }
  }, [isSignedIn, id, page, navigate]);

  const statusColor = (status) => {
    const map = {
      pending: "bg-yellow-100 text-yellow-800",
      confirmed: "bg-blue-100 text-blue-800",
      processing: "bg-indigo-100 text-indigo-800",
      shipped: "bg-purple-100 text-purple-800",
      delivered: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
      refunded: "bg-gray-100 text-gray-800",
    };
    return map[status] || "bg-gray-100 text-gray-700";
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-pink-600"></div>
      </div>
    );
  }

  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

  // ─── Order Detail View ──────────────────────────────────────────────────────
  if (id && order) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-10">
        <button onClick={() => navigate("/orders")} className="flex items-center gap-1 text-sm text-gray-500 hover:text-pink-600 mb-6 transition-colors">
          ← Back to My Orders
        </button>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Order Details</h1>
            <p className="text-sm text-gray-500 mt-1">{order.orderNumber}</p>
          </div>
          <span className={`self-start sm:self-auto px-3 py-1.5 rounded-full text-sm font-semibold capitalize ${statusColor(order.status)}`}>
            {order.status}
          </span>
        </div>

        {/* Delivery Date Banner */}
        {order.deliveryDate && (
          <div className="mb-6 flex items-center gap-3 bg-pink-50 border border-pink-200 rounded-xl px-5 py-4">
            <span className="text-2xl">🚚</span>
            <div>
              <p className="text-xs text-pink-500 font-medium uppercase tracking-wide">Expected Delivery</p>
              <p className="text-base font-bold text-pink-700">{new Date(order.deliveryDate).toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p>
            </div>
          </div>
        )}

        {/* Order Info Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {[
            { label: "Placed On", value: new Date(order.createdAt).toLocaleDateString("en-IN") },
            { label: "Payment", value: order.paymentMethod.toUpperCase() },
            { label: "Payment Status", value: order.paymentStatus, color: order.paymentStatus === "paid" ? "text-green-600" : "text-yellow-600" },
            { label: "Total", value: `₹${order.pricing.total}`, color: "text-gray-900 font-bold" },
          ].map((info) => (
            <div key={info.label} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
              <p className="text-xs text-gray-500 mb-1">{info.label}</p>
              <p className={`text-sm font-semibold ${info.color || "text-gray-800"}`}>{info.value}</p>
            </div>
          ))}
        </div>

        {/* Items */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm mb-6 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-50">
            <h2 className="font-semibold text-gray-800">Items Ordered</h2>
          </div>
          <div className="divide-y divide-gray-50">
            {order.items.map((item, idx) => (
              <div key={idx} className="flex items-center gap-4 px-6 py-4">
                <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                  {item.image
                    ? <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">No img</div>}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">{item.name}</p>
                  <p className="text-sm text-gray-500 mt-0.5">
                    {[item.attributes?.color && `Color: ${item.attributes.color}`, item.attributes?.size && `Size: ${item.attributes.size}`].filter(Boolean).join(" · ")}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">Qty: {item.quantity}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-semibold text-gray-900">₹{item.totalPrice}</p>
                  <p className="text-xs text-gray-400">₹{item.price.sellingPrice} each</p>
                </div>
              </div>
            ))}
          </div>
          {/* Pricing Summary */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 space-y-2">
            <div className="flex justify-between text-sm text-gray-600"><span>Subtotal</span><span>₹{order.pricing.subtotal}</span></div>
            {order.pricing.discount > 0 && <div className="flex justify-between text-sm text-pink-600"><span>Discount</span><span>- ₹{order.pricing.discount}</span></div>}
            <div className="flex justify-between text-sm text-gray-600"><span>Shipping</span><span>₹{order.pricing.shippingCharges}</span></div>
            <div className="flex justify-between font-bold text-gray-900 pt-2 border-t border-gray-200"><span>Total</span><span>₹{order.pricing.total}</span></div>
          </div>
        </div>

        {/* Delivery Location */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm px-6 py-5">
          <h2 className="font-semibold text-gray-800 mb-3">Delivery Info</h2>
          <p className="text-sm text-gray-600">📞 {order.shippingAddress.phone}</p>
          <p className="text-sm text-gray-600 mt-1">📍 {order.shippingAddress.addressLine1}, {order.shippingAddress.city}</p>
        </div>
      </div>
    );
  }

  // ─── Orders List View ───────────────────────────────────────────────────────
  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900">My Orders</h1>
        <span className="text-sm text-gray-500">{pagination.total} order{pagination.total !== 1 ? "s" : ""}</span>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">🛍️</div>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">No orders yet</h2>
          <p className="text-gray-400 mb-6">Start shopping and your orders will appear here.</p>
          <Link to="/products" className="inline-block px-6 py-3 bg-pink-600 text-white font-medium rounded-full hover:bg-pink-700 transition-colors">
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((o) => (
            <div key={o._id} className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
              <div className="px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-mono text-sm font-semibold text-gray-700 truncate">{o.orderNumber}</p>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${statusColor(o.status)}`}>{o.status}</span>
                  </div>
                  <p className="text-sm text-gray-400 mt-1">
                    {new Date(o.createdAt).toLocaleDateString("en-IN")} · {o.items.length} item{o.items.length !== 1 ? "s" : ""}
                  </p>
                  {o.deliveryDate && (
                    <p className="text-xs font-medium text-pink-600 mt-1">
                      🚚 Expected: {new Date(o.deliveryDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-4 flex-shrink-0">
                  <p className="font-bold text-lg text-gray-900">₹{o.pricing.total}</p>
                  <button
                    onClick={() => navigate(`/orders/${o._id}`)}
                    className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    View
                  </button>
                </div>
              </div>
              {/* Item thumbnails strip */}
              {o.items?.slice(0, 4).some(item => item.image) && (
                <div className="px-6 pb-4 flex gap-2">
                  {o.items.slice(0, 4).map((item, i) => item.image ? (
                    <div key={i} className="w-10 h-10 rounded-md overflow-hidden bg-gray-100 flex-shrink-0">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                  ) : null)}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {pagination.pages > 1 && (
        <div className="mt-8 flex justify-center gap-2">
          {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((num) => (
            <button key={num} onClick={() => setPage(num)}
              className={`w-9 h-9 rounded-full text-sm font-medium transition-colors ${page === num ? "bg-pink-600 text-white" : "bg-white border border-gray-200 text-gray-600 hover:border-pink-400"}`}>
              {num}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default Orders;