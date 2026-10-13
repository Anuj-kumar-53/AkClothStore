import { useEffect, useState } from "react";
import api from "../../utils/api";

function ManageOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [statusFilter, setStatusFilter] = useState("");

  // Confirm modal state
  const [confirmModal, setConfirmModal] = useState(null); // { orderId }
  const [deliveryDate, setDeliveryDate] = useState("");
  const [confirming, setConfirming] = useState(false);

  // Expanded order for item details
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => { fetchOrders(); }, [page, statusFilter]);

  const fetchOrders = async () => {
    setLoading(true); setError("");
    try {
      const params = new URLSearchParams({ page, limit: "20" });
      if (statusFilter) params.append("status", statusFilter);
      const res = await api.get(`/admin/orders?${params}`);
      setOrders(res.data.data || []);
      setPagination({ page: res.data.page, pages: res.data.pages, total: res.data.total });
    } catch {
      setError("Unable to load orders.");
    } finally { setLoading(false); }
  };

  const flash = (msg, isErr = false) => {
    if (isErr) setError(msg); else setMessage(msg);
    setTimeout(() => { setError(""); setMessage(""); }, 3000);
  };

  const handleConfirm = async () => {
    if (!deliveryDate) return;
    setConfirming(true);
    try {
      await api.put(`/admin/orders/${confirmModal.orderId}/status`, {
        status: "confirmed",
        note: "Order confirmed by admin",
        deliveryDate,
      });
      flash("Order confirmed and delivery date set.");
      setConfirmModal(null);
      setDeliveryDate("");
      fetchOrders();
    } catch (err) {
      flash(err.response?.data?.message || "Failed to confirm order.", true);
    } finally { setConfirming(false); }
  };

  const updateStatus = async (orderId, newStatus) => {
    try {
      await api.put(`/admin/orders/${orderId}/status`, { status: newStatus });
      flash(`Order marked as ${newStatus}.`);
      fetchOrders();
    } catch (err) {
      flash(err.response?.data?.message || "Update failed.", true);
    }
  };

  const statusBadge = (status) => {
    const map = {
      pending: "bg-yellow-100 text-yellow-800",
      confirmed: "bg-blue-100 text-blue-800",
      processing: "bg-indigo-100 text-indigo-800",
      shipped: "bg-purple-100 text-purple-800",
      delivered: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
      refunded: "bg-gray-200 text-gray-700",
    };
    return map[status] || "bg-gray-100 text-gray-600";
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
        <span className="text-sm text-gray-500">{pagination.total} total</span>
      </div>

      {message && <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm">{message}</div>}
      {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">{error}</div>}

      {/* Filter Bar */}
      <div className="flex gap-3 mb-6 flex-wrap">
        {["", "pending", "confirmed", "processing", "shipped", "delivered", "cancelled"].map((s) => (
          <button key={s} onClick={() => { setStatusFilter(s); setPage(1); }}
            className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${statusFilter === s ? "bg-gray-900 text-white border-gray-900" : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"}`}>
            {s === "" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      {/* Orders List */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-gray-400"></div>
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-16 text-gray-400">No orders found.</div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <div key={order._id} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              {/* Order Header */}
              <div className="px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-sm font-bold text-gray-800">{order.orderNumber}</span>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${statusBadge(order.status)}`}>{order.status}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${order.paymentStatus === "paid" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                      {order.paymentMethod.toUpperCase()} · {order.paymentStatus}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(order.createdAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
                    {" · "}{order.items.length} item{order.items.length !== 1 ? "s" : ""}
                    {" · "}Ph: {order.shippingAddress?.phone}
                  </p>
                  {order.deliveryDate && (
                    <p className="text-xs font-medium text-pink-600 mt-0.5">🚚 Delivery: {new Date(order.deliveryDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</p>
                  )}
                </div>

                <div className="flex items-center gap-2 flex-wrap flex-shrink-0">
                  <span className="font-bold text-gray-900">₹{order.pricing.total}</span>

                  {/* Expand items */}
                  <button onClick={() => setExpandedId(expandedId === order._id ? null : order._id)}
                    className="px-3 py-1.5 text-xs border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50">
                    {expandedId === order._id ? "Hide" : "Items"}
                  </button>

                  {/* Action Buttons */}
                  {order.status === "pending" && (
                    <button onClick={() => setConfirmModal({ orderId: order._id })}
                      className="px-3 py-1.5 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">
                      Confirm
                    </button>
                  )}
                  {order.status === "confirmed" && (
                    <button onClick={() => updateStatus(order._id, "processing")}
                      className="px-3 py-1.5 text-xs bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium">
                      Process
                    </button>
                  )}
                  {order.status === "processing" && (
                    <button onClick={() => updateStatus(order._id, "shipped")}
                      className="px-3 py-1.5 text-xs bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium">
                      Ship
                    </button>
                  )}
                  {order.status === "shipped" && (
                    <button onClick={() => updateStatus(order._id, "delivered")}
                      className="px-3 py-1.5 text-xs bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium">
                      Deliver
                    </button>
                  )}
                  {!["delivered", "cancelled", "refunded"].includes(order.status) && (
                    <button onClick={() => { if (window.confirm("Cancel this order?")) updateStatus(order._id, "cancelled"); }}
                      className="px-3 py-1.5 text-xs border border-red-200 text-red-600 rounded-lg hover:bg-red-50">
                      Cancel
                    </button>
                  )}
                </div>
              </div>

              {/* Expanded Items */}
              {expandedId === order._id && (
                <div className="border-t border-gray-50 px-5 py-4">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Ordered Items</p>
                  <div className="space-y-3">
                    {order.items.map((item, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                          {item.image
                            ? <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                            : <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">—</div>}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-800 truncate">{item.name}</p>
                          <p className="text-xs text-gray-400">
                            {[item.attributes?.color, item.attributes?.size].filter(Boolean).join(" · ")} · Qty: {item.quantity}
                          </p>
                        </div>
                        <p className="text-sm font-semibold text-gray-900 flex-shrink-0">₹{item.totalPrice}</p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 pt-3 border-t border-gray-100 flex justify-end gap-6 text-sm text-gray-600">
                    <span>Subtotal: ₹{order.pricing.subtotal}</span>
                    <span>Shipping: ₹{order.pricing.shippingCharges}</span>
                    <span className="font-bold text-gray-900">Total: ₹{order.pricing.total}</span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="mt-6 flex justify-center gap-2">
          {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((num) => (
            <button key={num} onClick={() => setPage(num)}
              className={`w-9 h-9 rounded-full text-sm font-medium transition-colors ${page === num ? "bg-gray-900 text-white" : "bg-white border border-gray-200 text-gray-600 hover:border-gray-400"}`}>
              {num}
            </button>
          ))}
        </div>
      )}

      {/* Confirm Order Modal */}
      {confirmModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-1">Confirm Order</h2>
            <p className="text-sm text-gray-500 mb-5">Choose the expected delivery date for the customer.</p>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Expected Delivery Date *</label>
            <input
              type="date"
              value={deliveryDate}
              onChange={(e) => setDeliveryDate(e.target.value)}
              min={new Date().toISOString().split("T")[0]}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 mb-5"
            />
            <div className="flex gap-3">
              <button onClick={() => { setConfirmModal(null); setDeliveryDate(""); }}
                className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
                Cancel
              </button>
              <button onClick={handleConfirm} disabled={!deliveryDate || confirming}
                className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
                {confirming ? "Confirming..." : "Confirm & Notify"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ManageOrders;
