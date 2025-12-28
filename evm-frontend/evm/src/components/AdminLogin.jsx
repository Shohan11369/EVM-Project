import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, Eye, EyeOff } from "lucide-react";

function AdminLogin() {
  const navigate = useNavigate();
  const [adminId, setAdminId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(
        "http://localhost:5000/api/voter/admin-login",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ adminId, password }),
        }
      );

      const data = await response.json();
      if (data.success) {
        // security add 
        localStorage.setItem("adminToken", "isLoggedIn"); 
        
        // replace: true 
        navigate("/admin/dashboard", { replace: true }); 
        
      } else {
        alert(data.message || "Invalid Admin Credentials!");
      }
    } catch (err) {
      alert("Server error! Please check connection.");
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-slate-900 p-4 bg-cover bg-center relative"
      style={{ backgroundImage: `url('/images/bg1.jpg')` }}
    >
      {/* Background Overlay */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>

      {/* Admin Login Card */}
      <div className="bg-white w-full max-w-sm rounded-[2.5rem] p-10 relative shadow-2xl z-10 animate-in zoom-in duration-300">
        <div className="text-center mb-8">
          <div className="bg-purple-100 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-4">
            <Lock className="text-purple-600" size={40} />
          </div>
          <h3 className="text-3xl font-black text-gray-800 uppercase tracking-tighter">
            Admin Panel
          </h3>
          <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-2">
            Secure Authorization
          </p>
        </div>

        <form onSubmit={handleAdminLogin} className="space-y-5">
          <input
            type="text"
            placeholder="Admin ID"
            required
            className="w-full px-5 py-4 bg-gray-100 rounded-2xl border-2 border-transparent focus:border-purple-500 outline-none font-bold text-lg"
            onChange={(e) => setAdminId(e.target.value)}
          />

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              required
              className="w-full pl-5 pr-12 py-4 bg-gray-100 rounded-2xl border-2 border-transparent focus:border-purple-500 outline-none font-bold text-lg"
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-purple-600 transition-colors"
            >
              {showPassword ? <EyeOff size={24} /> : <Eye size={24} />}
            </button>
          </div>

          <button
            type="submit"
            className="w-full bg-purple-600 text-white py-5 rounded-2xl font-black text-xl hover:bg-purple-700 transition shadow-xl uppercase tracking-tight"
          >
            UNSEAL PANEL
          </button>
        </form>

        <button
          onClick={() => navigate("/")}
          className="w-full mt-6 text-gray-400 font-bold hover:text-gray-600 transition text-sm uppercase tracking-widest"
        >
          Cancel & Exit
        </button>
      </div>
    </div>
  )
}

export default AdminLogin;