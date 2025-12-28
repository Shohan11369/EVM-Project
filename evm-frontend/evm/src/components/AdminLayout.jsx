import React from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { LayoutDashboard, Users, UserPlus, LogOut } from "lucide-react";

const AdminLayout = () => {
  const location = useLocation();

  const handleLogout = () => {
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then((stream) => {
        stream.getTracks().forEach((track) => track.stop());
      })
      .catch(() => {});
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <div className="w-64 bg-gray-800 text-white p-6 shadow-xl hidden md:block">
        <h2 className="text-2xl font-black mb-10 border-b border-indigo-800 pb-4">
          Admin Panel (অ্যাডমিন প্যানেল)
        </h2>

        <nav className="space-y-4">
          <NavLink
            to="/admin/dashboard"
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
            to="/"
            onClick={handleLogout}
            className="flex items-center gap-3 hover:bg-red-700 p-3 rounded-xl mt-20 transition text-red-100"
          >
            <LogOut size={24} />
            Logout (লগআউট)
          </NavLink>
        </nav>
      </div>

      <div className="flex-1 p-4 md:p-10 overflow-y-auto">
        
        <Outlet key={location.pathname} />
      </div>
    </div>
  );
};

export default AdminLayout;
