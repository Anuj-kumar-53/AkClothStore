import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import api from "../../utils/api";

function Cart() {
  const { isSignedIn, isLoaded } = useUser();
  const navigate = useNavigate();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (!isLoaded) return;
    if (!isSignedIn) {
      setLoading(false);
      return;
    }
    fetchCart();
  }, [isSignedIn, isLoaded]);

  const fetchCart = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/cart");
      setCart(res.data.data);
    } catch (err) {
      console.error("Error fetching cart:", err);
      setError("Failed to load cart.");
    } finally {
      setLoading(false);
    }
  };

  const handleQuantityChange = async (itemId, newQuantity) => {
    if (newQuantity < 1 || newQuantity > 10) return;
    setUpdating(true);
    try {
      const res = await api.put(`/cart/items/${itemId}`, { quantity: newQuantity });
      setCart(res.data.data);
      window.dispatchEvent(new Event("cart_updated"));
    } catch (err) {
      console.error("Update quantity failed:", err);
      setError("Unable to update quantity.");
    } finally {
      setUpdating(false);
    }
  };

  const handleRemoveItem = async (itemId) => {
    setUpdating(true);
    try {
      const res = await api.delete(`/cart/items/${itemId}`);
      setCart(res.data.data);
      window.dispatchEvent(new Event("cart_updated"));
    } catch (err) {
      console.error("Remove item failed:", err);
      setError("Unable to remove item.");
    } finally {
      setUpdating(false);
    }
  };

  const handleClearCart = async () => {
    setUpdating(true);
    try {
      const res = await api.delete("/cart");
      setCart(res.data.data);
      window.dispatchEvent(new Event("cart_updated"));
    } catch (err) {
      console.error("Clear cart failed:", err);
      setError("Unable to clear cart.");
    } finally {
      setUpdating(false);
    }
  };

  if (!isLoaded || loading) {
    return <div className="p-8 text-center">Loading cart...</div>;
  }

  if (!isSignedIn) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-semibold mb-4">Your cart is waiting</h2>
        <p className="text-gray-600 mb-6">Please sign in to view your cart.</p>
        <Link
          to="/sign-in"
          className="inline-block px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700"
        >
          Sign In
        </Link>
      </div>
    );
  }

  if (error) {
    return <div className="p-8 text-center text-red-600">{error}</div>;
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-semibold mb-4">Your cart is empty</h2>
        <p className="text-gray-600 mb-6">Browse our products and add something you love.</p>
        <Link
          to="/products"
          className="inline-block px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700"
        >
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Shopping Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {cart.items.map((item) => {
            const variant = item.productVariant;
            const family = item.productFamily;
            const image = variant?.images?.[0]?.url || family?.images?.[0]?.url || "";

            return (
              <div
                key={item._id}
                className="bg-white p-4 rounded-lg shadow flex flex-col sm:flex-row gap-4"
              >
                {/* Product Image */}
                <div className="w-24 h-24 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                  {image ? (
                    <img src={image} alt={variant?.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">No Image</div>
                  )}
                </div>

                {/* Product Info */}
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{variant?.name}</h3>
                  <p className="text-sm text-gray-600">
                    {variant?.attributes?.color && `Color: ${variant.attributes.color}`}
                    {variant?.attributes?.size && `, Size: ${variant.attributes.size}`}
                  </p>
                  <p className="text-sm text-gray-600">Price: ₹{item.priceAtAdd}</p>

                  {/* Quantity Controls */}
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      onClick={() => handleQuantityChange(item._id, item.quantity - 1)}
                      disabled={updating || item.quantity <= 1}
                      className="px-2 py-1 border rounded hover:bg-gray-100 disabled:opacity-50"
                    >
                      -
                    </button>
                    <span className="w-8 text-center">{item.quantity}</span>
                    <button
                      onClick={() => handleQuantityChange(item._id, item.quantity + 1)}
                      disabled={updating || item.quantity >= 10}
                      className="px-2 py-1 border rounded hover:bg-gray-100 disabled:opacity-50"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Item Total and Remove */}
                <div className="flex sm:flex-col items-center justify-between sm:justify-between sm:items-end gap-2">
                  <p className="font-semibold">₹{item.priceAtAdd * item.quantity}</p>
                  <button
                    onClick={() => handleRemoveItem(item._id)}
                    disabled={updating}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    Remove
                  </button>
                </div>
              </div>
            );
          })}

          {/* Clear Cart */}
          <button
            onClick={handleClearCart}
            disabled={updating}
            className="text-red-600 hover:text-red-800 text-sm font-medium"
          >
            Clear Cart
          </button>
        </div>

        {/* Order Summary */}
        <div className="bg-white p-6 rounded-lg shadow h-fit">
          <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Total Items</span>
              <span>{cart.totalItems}</span>
            </div>
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>₹{cart.totalPrice}</span>
            </div>
            <div className="flex justify-between">
              <span>Discount</span>
              <span className="text-green-600">- ₹{cart.discountAmount}</span>
            </div>
            <div className="flex justify-between font-semibold text-base border-t pt-2">
              <span>Total</span>
              <span>₹{cart.finalPrice}</span>
            </div>
          </div>

          <button
            onClick={() => navigate("/checkout")}
            className="w-full mt-6 px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700"
          >
            Proceed to Checkout
          </button>
        </div>
      </div>
    </div>
  );
}

export default Cart;