import React from "react";
import { Link, Outlet } from "react-router-dom";
import { LayoutDashboard, Users, UserPlus, LogOut } from "lucide-react";

const AdminLayout = () => {
  // logout time auto off camera
  const handleLogout = () => {
    navigator.mediaDevices.getUserMedia({ video: true })
      .then(stream => {
        stream.getTracks().forEach(track => track.stop());
      })
      .catch(() => {});
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-gray-800 text-white p-6 shadow-xl hidden md:block">
        <h2 className="text-2xl font-black mb-10 border-b border-indigo-800 pb-4">
          Admin Panel (অ্যাডমিন প্যানেল)
        </h2>

        <nav className="space-y-4">
          <Link
            to="/admin/dashboard"
            className="flex items-center gap-3 hover:bg-black p-3 rounded-xl transition"
          >
            <LayoutDashboard size={24} /> 
            Live Results (লাইভ রেজাল্ট)
          </Link>

          <Link
            to="/admin/register"
            className="flex items-center gap-3 hover:bg-black p-3 rounded-xl transition"
          >
            <UserPlus size={24} />
            Voter Registration (ভোটার এন্ট্রি)
          </Link>

          <Link
            to="/"
            onClick={handleLogout} 
            className="flex items-center gap-3 hover:bg-red-700 p-3 rounded-xl mt-20 transition text-red-100"
          >
            <LogOut size={24} />
            Logout (লগআউট)
          </Link>
        </nav>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-4 md:p-10 overflow-y-auto">
        <Outlet />
      </div>
    </div>
  );
};

export default AdminLayout;