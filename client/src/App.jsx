



import { Routes, Route, Link, Navigate, useLocation } from "react-router-dom";
import { SignedIn, SignedOut, SignInButton, UserButton, useUser } from "@clerk/clerk-react";
import { useState, useEffect } from "react";
import api from "./utils/api";


//navbar and footer
import Navbar from "./components/common/Navbar";
import Footer from "./components/common/Footer";

// Customer pages
import Home from "./pages/customer/Home";
import Products from "./pages/customer/Products";
import ProductDetails from "./pages/customer/ProductDetails";
import Cart from "./pages/customer/Cart";
import Checkout from "./pages/customer/Checkout";
import Orders from "./pages/customer/Orders";
import Profile from "./pages/customer/Profile";

// Admin pages
import AdminLayout from "./components/admin/AdminLayout";
import Dashboard from "./pages/admin/Dashboard";
import ManageCategories from "./pages/admin/ManageCategories";
import ManageBrands from "./pages/admin/ManageBrands";
import ManageProducts from "./pages/admin/ManageProducts";
import ManageVariants from "./pages/admin/ManageVariants";
import ManageOrders from "./pages/admin/ManageOrders";
import ManageUsers from "./pages/admin/ManageUsers";

function App() {
  const { isSignedIn, user, isLoaded } = useUser();
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminChecked, setAdminChecked] = useState(false);

  useEffect(() => {
    if (isSignedIn && user) {
      const checkAdmin = async () => {
        try {
          const res = await api.get("/users/profile");
          setIsAdmin(res.data.data.role === "admin");
        } catch (err) {
          console.error("Failed to fetch user role:", err);
          setIsAdmin(false);
        } finally {
          setAdminChecked(true);
        }
      };
      checkAdmin();
    } else {
      setAdminChecked(false);
      setIsAdmin(false);
    }
  }, [isSignedIn, user]);

  // Admin route protection component
  const AdminRoute = ({ children }) => {
    if (!isLoaded || !adminChecked) {
      return <div className="p-8 text-center">Loading...</div>;
    }
    if (!isSignedIn) {
      return <Navigate to="/sign-in" replace />;
    }
    if (!isAdmin) {
      return <Navigate to="/" replace />;
    }
    return children;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navbar (shown only on customer pages, not admin) */}
      
      <Navbar isAdmin={isAdmin} />
      <Routes>
        {/* Customer Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/products" element={<Products />} />
        <Route path="/products/:slug" element={<ProductDetails />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/orders/:id" element={<Orders />} />
        <Route path="/profile" element={<Profile />} />

        {/* Admin Routes */}
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminLayout />
            </AdminRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="products" element={<ManageProducts />} />
          <Route path="products/:productId/variants" element={<ManageVariants />} />
          <Route path="categories" element={<ManageCategories />} />
          <Route path="brands" element={<ManageBrands />} />
          <Route path="orders" element={<ManageOrders />} />
          <Route path="orders/:id" element={<ManageOrders />} />
          <Route path="users" element={<ManageUsers />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      <Footer />
    </div>
  );
}

export default App;