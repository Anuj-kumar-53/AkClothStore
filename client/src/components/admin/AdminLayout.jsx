import { useState } from "react";
import { NavLink, Outlet, Link } from "react-router-dom";
import { useUser, SignOutButton } from "@clerk/clerk-react";

const navItems = [
  { to: "/admin", label: "Dashboard", icon: "📊" },
  { to: "/admin/products", label: "Products", icon: "📦" },
  { to: "/admin/categories", label: "Categories", icon: "🗂️" },
  { to: "/admin/brands", label: "Brands", icon: "🏷️" },
  { to: "/admin/orders", label: "Orders", icon: "📋" },
];

function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useUser();

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className={`${
        sidebarOpen ? "block" : "hidden"
      } md:flex flex-col fixed md:static inset-y-0 left-0 z-20 w-56 bg-white border-r border-gray-100 shadow-sm`}>
        <div className="p-5 border-b border-gray-100">
          <Link to="/" className="font-bold text-lg text-gray-900">AK Store</Link>
          <p className="text-xs text-gray-400 mt-0.5">Admin Panel</p>
        </div>
        <nav className="flex-1 p-3 space-y-0.5">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/admin"}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-gray-900 text-white"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`
              }
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center gap-2.5 mb-3">
            <div className="w-8 h-8 rounded-full bg-gray-900 text-white flex items-center justify-center text-sm font-medium">
              {user?.firstName?.charAt(0) || "A"}
            </div>
            <div className="text-sm min-w-0">
              <p className="font-medium text-gray-900 truncate">{user?.firstName || "Admin"}</p>
              <p className="text-xs text-gray-400">Administrator</p>
            </div>
          </div>
          <SignOutButton>
            <button className="w-full text-left px-3 py-2 text-xs text-red-500 hover:bg-red-50 rounded-lg transition-colors">
              Sign Out
            </button>
          </SignOutButton>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-10 bg-white border-b border-gray-100 px-4 py-3 flex justify-between items-center">
        <Link to="/admin" className="font-bold text-gray-900">AK Store Admin</Link>
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-1.5 rounded-lg hover:bg-gray-100">
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {/* Main Content */}
      <main className="flex-1 p-4 pt-16 md:pt-6 md:p-8 min-h-screen overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}

export default AdminLayout;