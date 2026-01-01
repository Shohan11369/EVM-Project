import React, { useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  UserPlus,
  LogOut,
  Menu,
  X,
} from "lucide-react";

const AdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = (e) => {
    e.preventDefault();
    localStorage.removeItem("adminToken");

    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then((stream) => {
        stream.getTracks().forEach((track) => track.stop());
      })
      .catch(() => {});

    navigate("/admin-login", { replace: true });
  };

  const NavItems = () => (
    <>
      <NavLink
        to="/admin/dashboard"
        onClick={() => setIsMobileMenuOpen(false)}
        className={({ isActive }) =>
          `flex items-center gap-3 p-3 rounded-xl transition ${
            isActive ? "bg-indigo-600 shadow-lg" : "hover:bg-black"
          }`
        }
      >
        <LayoutDashboard size={24} />
        Live Results (লাইভ রেজাল্ট)
      </NavLink>

      <NavLink
        to="/admin/voters"
        onClick={() => setIsMobileMenuOpen(false)}
        className={({ isActive }) =>
          `flex items-center gap-3 p-3 rounded-xl transition ${
            isActive ? "bg-indigo-600 shadow-lg" : "hover:bg-black"
          }`
        }
      >
        <Users size={24} />
        Voter List (ভোটার তালিকা)
      </NavLink>

      <NavLink
        to="/admin/register"
        onClick={() => setIsMobileMenuOpen(false)}
        className={({ isActive }) =>
          `flex items-center gap-3 p-3 rounded-xl transition ${
            isActive ? "bg-indigo-600 shadow-lg" : "hover:bg-black"
          }`
        }
      >
        <UserPlus size={24} />
        Voter Registration (ভোটার এন্ট্রি)
      </NavLink>

      <NavLink
        to="/admin-login"
        onClick={handleLogout}
        className="flex items-center gap-3 hover:bg-red-700 p-3 rounded-xl mt-10 md:mt-20 transition text-red-100"
      >
        <LogOut size={24} />
        Logout (লগআউট)
      </NavLink>
    </>
  );

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/*  Mobile Top Navbar  */}
      <div className="md:hidden fixed top-0 left-0 right-0 bg-gray-800 text-white p-4 flex justify-between items-center z-50 shadow-md">
        <h2 className="font-bold text-lg">Admin Panel</h2>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/*  Desktop Sidebar  */}
      <div className="w-64 bg-gray-800 text-white p-6 shadow-xl hidden md:block min-h-screen fixed left-0 top-0">
        <h2 className="text-2xl font-black mb-10 border-b border-indigo-800 pb-4">
          Admin Panel (অ্যাডমিন প্যানেল)
        </h2>
        <nav className="space-y-4">
          <NavItems />
        </nav>
      </div>

      {/* Mobile Sidebar Overlay  */}
      <div
        className={`fixed inset-0 bg-black/60 z-40 transition-opacity md:hidden ${
          isMobileMenuOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
        onClick={() => setIsMobileMenuOpen(false)}
      />

      {/* Mobile Sidebar Menu  */}
      <div
        className={`fixed top-0 left-0 bottom-0 w-72 bg-gray-800 text-white p-6 z-50 transform transition-transform duration-300 md:hidden ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <h2 className="text-xl font-black mb-8 border-b border-indigo-800 pb-4">
          Admin Panel
        </h2>
        <nav className="space-y-4">
          <NavItems />
        </nav>
      </div>

      {/* Main Content Area  */}
      <div className="flex-1 md:ml-64 p-4 md:p-10 mt-16 md:mt-0 overflow-y-auto w-full">
        <div className="max-w-7xl mx-auto">
          <Outlet key={location.pathname} />
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
