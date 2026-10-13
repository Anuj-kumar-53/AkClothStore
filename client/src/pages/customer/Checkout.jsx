import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import api from "../../utils/api";
import { loadRazorpayScript } from "../../utils/razorpay";
import { MapPin } from "lucide-react";

function Checkout() {
  const { isSignedIn } = useUser();
  const navigate = useNavigate();

  const [cart, setCart] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState("");
  
  const [phone, setPhone] = useState("");
  const [place, setPlace] = useState("");
  const [area, setArea] = useState("");
  const [location, setLocation] = useState({ latitude: null, longitude: null });
  const [gettingLocation, setGettingLocation] = useState(false);
  const [manualEntry, setManualEntry] = useState(false);
  const [manualLat, setManualLat] = useState("");
  const [manualLng, setManualLng] = useState("");

  useEffect(() => {
    if (!isSignedIn) {
      navigate("/sign-in");
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      try {
        const cartRes = await api.get("/cart");
        setCart(cartRes.data.data);
      } catch (err) {
        console.error("Checkout data fetch failed:", err);
        setError("Failed to load checkout details.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [isSignedIn, navigate]);

  const handleGetLocation = () => {
    setError("");
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      return;
    }
    setGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setGettingLocation(false);
      },
      (err) => {
        setGettingLocation(false);
        setError("Unable to retrieve your location. Please allow location access.");
      }
    );
  };

  const handlePlaceOrder = async () => {
    if (!phone || phone.length < 10) {
      setError("Please enter a valid mobile number.");
      return;
    }

    // Resolve location from either GPS or manual entry
    let resolvedLocation = location;
    if (manualEntry) {
      const lat = parseFloat(manualLat);
      const lng = parseFloat(manualLng);
      if (isNaN(lat) || isNaN(lng)) {
        setError("Please enter valid latitude and longitude values.");
        return;
      }
      resolvedLocation = { latitude: lat, longitude: lng };
    } else if (!location.latitude || !location.longitude) {
      setError("Please provide your delivery location using 'Use My Location' or enter coordinates manually.");
      return;
    }

    setPlacing(true);
    setError("");
    try {
      // Create address with exact lat/long for backend 10km radius validation
      const addrRes = await api.post("/users/addresses", {
        fullName: "Customer",
        phone,
        addressLine1: area || "Delivery Location",
        city: place || "Local Delivery Area",
        state: "Local",
        pincode: "000000",
        addressType: "home",
        location: resolvedLocation,
      });

      const selectedAddressId = addrRes.data.data._id;

      // Place order using the generated address
      const orderRes = await api.post("/orders", {
        addressId: selectedAddressId,
        paymentMethod,
      });
      
      const { order, razorpayOrder } = orderRes.data.data;

      // Ensure Navbar updates
      window.dispatchEvent(new Event("cart_updated"));

      if (paymentMethod === "cod") {
        navigate(`/orders/${order._id}`);
        return;
      }

      // Razorpay flow
      const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY_ID;
      if (!razorpayKey) {
        setError("Razorpay key not configured.");
        setPlacing(false);
        return;
      }

      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        setError("Failed to load Razorpay. Check your internet connection.");
        setPlacing(false);
        return;
      }

      const options = {
        key: razorpayKey,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        name: "AK Cloth Store",
        description: `Order ${order.orderNumber}`,
        order_id: razorpayOrder.orderId,
        handler: async (response) => {
          try {
            await api.post("/payments/verify", {
              orderId: order._id,
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });
            navigate(`/orders/${order._id}`);
          } catch (err) {
            console.error("Payment verification failed:", err);
            setError("Payment verification failed. Please contact support.");
            setPlacing(false);
          }
        },
        prefill: {
          contact: phone,
        },
        theme: { color: "#ec4899" }, // pink-600
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
      setPlacing(false);
    } catch (err) {
      console.error("Order placement failed:", err);
      setError(err.response?.data?.message || "Failed to place order.");
      setPlacing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-600"></div>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-semibold mb-4">Your cart is empty</h2>
        <button
          onClick={() => navigate("/products")}
          className="px-6 py-3 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
        >
          Continue Shopping
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-gray-900">Secure Checkout</h1>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-lg shadow-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Contact & Location */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Contact Details */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-semibold mb-6 text-gray-800">1. Contact & Delivery</h2>
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Mobile Number *</label>
                <input
                  type="tel"
                  placeholder="e.g. 9876543210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-shadow"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Place / City</label>
                  <input
                    type="text"
                    placeholder="e.g. Kozhikode"
                    value={place}
                    onChange={(e) => setPlace(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-shadow"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Area / Locality</label>
                  <input
                    type="text"
                    placeholder="e.g. Calicut Beach, West Hill"
                    value={area}
                    onChange={(e) => setArea(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-shadow"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Delivery Location *</label>

                {/* GPS Button */}
                {!manualEntry && (
                  <button
                    onClick={handleGetLocation}
                    disabled={gettingLocation}
                    className="w-full flex items-center justify-center gap-2 bg-pink-50 text-pink-700 border border-pink-200 px-6 py-4 rounded-lg font-medium hover:bg-pink-100 transition-colors disabled:opacity-50 mb-3"
                  >
                    <MapPin className="h-5 w-5" />
                    {gettingLocation ? "Locating..." : "Use My Current Location"}
                  </button>
                )}

                {!manualEntry && location.latitude && (
                  <p className="text-sm text-green-600 font-medium mb-3">
                    ✓ Location acquired (lat: {location.latitude.toFixed(5)}, lng: {location.longitude.toFixed(5)})
                  </p>
                )}

                {/* Toggle Manual Entry */}
                <button
                  type="button"
                  onClick={() => { setManualEntry(!manualEntry); setLocation({ latitude: null, longitude: null }); }}
                  className="text-sm text-pink-600 hover:text-pink-800 font-medium underline"
                >
                  {manualEntry ? "← Use My Location Instead" : "Enter coordinates manually"}
                </button>

                {/* Manual Lat/Lng Inputs */}
                {manualEntry && (
                  <div className="mt-3 grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Latitude</label>
                      <input
                        type="number"
                        step="any"
                        placeholder="e.g. 11.2588"
                        value={manualLat}
                        onChange={(e) => setManualLat(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Longitude</label>
                      <input
                        type="number"
                        step="any"
                        placeholder="e.g. 75.7804"
                        value={manualLng}
                        onChange={(e) => setManualLng(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                )}

                <p className="text-xs text-gray-500 mt-3">
                  * Delivery is available only within a 10 km radius of our store.
                </p>
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-semibold mb-6 text-gray-800">2. Payment Method</h2>
            <div className="space-y-4">
              <label className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${paymentMethod === 'cod' ? 'border-pink-500 bg-pink-50' : 'border-gray-200 hover:border-gray-300'}`}>
                <input
                  type="radio"
                  value="cod"
                  checked={paymentMethod === "cod"}
                  onChange={() => setPaymentMethod("cod")}
                  className="mr-4 w-4 h-4 text-pink-600"
                />
                <span className="font-medium text-gray-900">Cash on Delivery</span>
              </label>
              <label className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${paymentMethod === 'razorpay' ? 'border-pink-500 bg-pink-50' : 'border-gray-200 hover:border-gray-300'}`}>
                <input
                  type="radio"
                  value="razorpay"
                  checked={paymentMethod === "razorpay"}
                  onChange={() => setPaymentMethod("razorpay")}
                  className="mr-4 w-4 h-4 text-pink-600"
                />
                <span className="font-medium text-gray-900">Pay Online (UPI, Cards, NetBanking)</span>
              </label>
            </div>
          </div>
        </div>

        {/* Right: Order Summary */}
        <div className="bg-gray-50 p-6 rounded-xl shadow-inner border border-gray-100 h-fit">
          <h2 className="text-xl font-semibold mb-6 text-gray-800">Order Summary</h2>
          <div className="space-y-4 text-gray-600">
            <div className="flex justify-between items-center">
              <span>Subtotal ({cart.totalItems} items)</span>
              <span className="font-medium text-gray-900">₹{cart.totalPrice}</span>
            </div>
            {cart.discountAmount > 0 && (
              <div className="flex justify-between items-center text-pink-600">
                <span>Discount</span>
                <span>- ₹{cart.discountAmount}</span>
              </div>
            )}
            <div className="flex justify-between items-center">
              <span>Shipping</span>
              <span className="text-sm">Calculated at next step</span>
            </div>
            <div className="border-t border-gray-200 pt-4 mt-4 flex justify-between items-center">
              <span className="font-bold text-gray-900">Total</span>
              <span className="font-bold text-2xl text-gray-900">₹{cart.finalPrice}</span>
            </div>
          </div>
          
          <button
            onClick={handlePlaceOrder}
            disabled={placing || !phone || (!location.latitude && !(manualEntry && manualLat && manualLng))}
            className="w-full mt-8 px-6 py-4 bg-pink-600 text-white font-bold rounded-lg hover:bg-pink-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all shadow-md transform hover:-translate-y-0.5"
          >
            {placing ? "Processing..." : "Place Order Now"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Checkout;