import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import api from "../../utils/api";

function Profile() {
  const { isSignedIn, user } = useUser();
  const navigate = useNavigate();

  const [profile, setProfile] = useState({ name: "", email: "" });
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [addressForm, setAddressForm] = useState({
    fullName: "",
    phone: "",
    addressLine1: "",
    city: "",
    state: "",
    pincode: "",
    landmark: "",
    addressType: "home",
    location: { latitude: 0, longitude: 0 },
  });

  useEffect(() => {
    if (!isSignedIn) {
      navigate("/sign-in");
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      try {
        const [profileRes, addrRes] = await Promise.all([
          api.get("/users/profile"),
          api.get("/users/addresses"),
        ]);
        setProfile(profileRes.data.data);
        setAddresses(addrRes.data.data || []);
      } catch (err) {
        console.error("Failed to load profile:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [isSignedIn, navigate]);

  const handleProfileUpdate = async () => {
    setSaving(true);
    setMessage("");
    try {
      const res = await api.put("/users/profile", profile);
      setProfile(res.data.data);
      setMessage("Profile updated successfully.");
    } catch (err) {
      console.error("Profile update failed:", err);
      setMessage("Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  const resetAddressForm = () => {
    setAddressForm({
      fullName: "",
      phone: "",
      addressLine1: "",
      city: "",
      state: "",
      pincode: "",
      landmark: "",
      addressType: "home",
      location: { latitude: 0, longitude: 0 },
    });
    setEditingAddressId(null);
    setShowAddressForm(false);
  };

  const handleAddOrUpdateAddress = async () => {
    if (
      !addressForm.fullName ||
      !addressForm.phone ||
      !addressForm.addressLine1 ||
      !addressForm.city ||
      !addressForm.state ||
      !addressForm.pincode
    ) {
      setMessage("Please fill all required address fields.");
      return;
    }

    setSaving(true);
    setMessage("");
    try {
      if (editingAddressId) {
        const res = await api.put(`/users/addresses/${editingAddressId}`, addressForm);
        setAddresses((prev) =>
          prev.map((a) => (a._id === editingAddressId ? res.data.data : a))
        );
        setMessage("Address updated.");
      } else {
        const res = await api.post("/users/addresses", addressForm);
        setAddresses((prev) => [...prev, res.data.data]);
        setMessage("Address added.");
      }
      resetAddressForm();
    } catch (err) {
      console.error("Address save failed:", err);
      setMessage("Unable to save address.");
    } finally {
      setSaving(false);
    }
  };

  const handleEditAddress = (addr) => {
    setAddressForm({
      fullName: addr.fullName,
      phone: addr.phone,
      addressLine1: addr.addressLine1,
      city: addr.city,
      state: addr.state,
      pincode: addr.pincode,
      landmark: addr.landmark || "",
      addressType: addr.addressType,
      location: addr.location,
    });
    setEditingAddressId(addr._id);
    setShowAddressForm(true);
    setMessage("");
  };

  const handleDeleteAddress = async (id) => {
    if (!window.confirm("Delete this address?")) return;
    setSaving(true);
    setMessage("");
    try {
      await api.delete(`/users/addresses/${id}`);
      setAddresses((prev) => prev.filter((a) => a._id !== id));
      setMessage("Address deleted.");
    } catch (err) {
      console.error("Delete failed:", err);
      setMessage("Unable to delete address.");
    } finally {
      setSaving(false);
    }
  };

  const handleSetDefault = async (id) => {
    setSaving(true);
    setMessage("");
    try {
      const res = await api.put(`/users/addresses/${id}/default`);
      setAddresses((prev) =>
        prev.map((a) => (a._id === id ? res.data.data : { ...a, isDefault: false }))
      );
      setMessage("Default address updated.");
    } catch (err) {
      console.error("Set default failed:", err);
      setMessage("Unable to set default address.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">My Profile</h1>

      {message && (
        <div className="mb-4 p-3 bg-blue-50 text-blue-700 rounded">{message}</div>
      )}

      {/* Profile Info */}
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <h2 className="text-xl font-semibold mb-4">Account Information</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <input
              type="text"
              value={profile.name}
              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              className="w-full border rounded px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              value={profile.email}
              onChange={(e) => setProfile({ ...profile, email: e.target.value })}
              className="w-full border rounded px-3 py-2"
            />
          </div>
        </div>
        <button
          onClick={handleProfileUpdate}
          disabled={saving}
          className="mt-4 px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? "Saving..." : "Update Profile"}
        </button>
      </div>

      {/* Addresses */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Saved Addresses</h2>
          <button
            onClick={() => {
              setShowAddressForm(!showAddressForm);
              if (editingAddressId) resetAddressForm();
            }}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            {showAddressForm ? "Cancel" : "+ Add Address"}
          </button>
        </div>

        {showAddressForm && (
          <div className="mb-6 p-4 border rounded bg-gray-50">
            <h3 className="font-medium mb-3">
              {editingAddressId ? "Edit Address" : "New Address"}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Full Name *"
                value={addressForm.fullName}
                onChange={(e) => setAddressForm({ ...addressForm, fullName: e.target.value })}
                className="border rounded px-3 py-2"
              />
              <input
                type="tel"
                placeholder="Phone *"
                value={addressForm.phone}
                onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                className="border rounded px-3 py-2"
              />
              <input
                type="text"
                placeholder="Address Line 1 *"
                value={addressForm.addressLine1}
                onChange={(e) => setAddressForm({ ...addressForm, addressLine1: e.target.value })}
                className="border rounded px-3 py-2 col-span-2"
              />
              <input
                type="text"
                placeholder="City *"
                value={addressForm.city}
                onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                className="border rounded px-3 py-2"
              />
              <input
                type="text"
                placeholder="State *"
                value={addressForm.state}
                onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                className="border rounded px-3 py-2"
              />
              <input
                type="text"
                placeholder="Pincode *"
                value={addressForm.pincode}
                onChange={(e) => setAddressForm({ ...addressForm, pincode: e.target.value })}
                className="border rounded px-3 py-2"
              />
              <input
                type="text"
                placeholder="Landmark (optional)"
                value={addressForm.landmark}
                onChange={(e) => setAddressForm({ ...addressForm, landmark: e.target.value })}
                className="border rounded px-3 py-2"
              />
              <select
                value={addressForm.addressType}
                onChange={(e) => setAddressForm({ ...addressForm, addressType: e.target.value })}
                className="border rounded px-3 py-2"
              >
                <option value="home">Home</option>
                <option value="work">Work</option>
                <option value="other">Other</option>
              </select>
              <button
                onClick={handleAddOrUpdateAddress}
                disabled={saving}
                className="sm:col-span-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {saving ? "Saving..." : editingAddressId ? "Update Address" : "Save Address"}
              </button>
            </div>
          </div>
        )}

        {addresses.length === 0 && !showAddressForm ? (
          <p className="text-gray-500">No saved addresses.</p>
        ) : (
          <div className="space-y-4">
            {addresses.map((addr) => (
              <div key={addr._id} className="p-4 border rounded flex flex-col sm:flex-row justify-between gap-3">
                <div>
                  <p className="font-medium">
                    {addr.fullName}{" "}
                    {addr.isDefault && (
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded ml-2">
                        Default
                      </span>
                    )}
                  </p>
                  <p className="text-sm text-gray-600">{addr.addressLine1}, {addr.city}, {addr.state} - {addr.pincode}</p>
                  {addr.landmark && <p className="text-sm text-gray-500">Landmark: {addr.landmark}</p>}
                  <p className="text-sm text-gray-500">Phone: {addr.phone}</p>
                  <p className="text-sm text-gray-500">Type: {addr.addressType}</p>
                </div>
                <div className="flex sm:flex-col gap-2 items-start sm:items-end">
                  <button
                    onClick={() => handleEditAddress(addr)}
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    Edit
                  </button>
                  {!addr.isDefault && (
                    <button
                      onClick={() => handleSetDefault(addr._id)}
                      className="text-green-600 hover:text-green-800 text-sm"
                    >
                      Set Default
                    </button>
                  )}
                  <button
                    onClick={() => handleDeleteAddress(addr._id)}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Profile;