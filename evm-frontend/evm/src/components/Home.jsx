import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, ShieldCheck, Lock, X, Eye, EyeOff } from "lucide-react";

function Home() {
  const navigate = useNavigate();
  const [showAdminModal, setShowAdminModal] = useState(false);
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
        navigate("/admin");
      } else {
        alert(data.message || "Invalid Admin Credentials!");
      }
    } catch (err) {
      alert("Server error! Please check connection.");
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-6 bg-cover bg-center relative"
      style={{ backgroundImage: `url('/images/bg1.jpg')` }}
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"></div>

      <div className="text-center mb-12 relative z-10">
        <h1 className="text-6xl font-black text-white mb-4 drop-shadow-lg leading-tight">
          National Smart Electronic <span className="text-red-500">Voting</span>{" "}
          System
        </h1>

        <p className="text-white text-lg font-bold tracking-widest uppercase bg-black/60 py-1 px-4 rounded-full inline-block backdrop-blur-sm">
          Biometric Facial Recognition
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl relative z-10">
        {/* Voter Section */}
        <div
          onClick={() => navigate("/login")}
          className="group cursor-pointer bg-white/95 backdrop-blur-md p-10 rounded-[2.5rem] shadow-2xl hover:shadow-indigo-500/50 transition-all transform hover:-translate-y-2 border-2 border-transparent hover:border-indigo-500 text-center"
        >
          <div className="bg-indigo-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-indigo-600 transition-colors duration-300">
            <User
              className="text-indigo-600 group-hover:text-white"
              size={40}
            />
          </div>
          <h2 className="text-3xl font-black text-gray-800 mb-2">
            Voter Login
          </h2>
          <p className="text-gray-600 font-medium ">
            Cast your vote using Face Verification
          </p>
        </div>

        {/* Admin Section */}
        <div
          onClick={() => setShowAdminModal(true)}
          className="group cursor-pointer bg-white/95 backdrop-blur-md p-10 rounded-[2.5rem] shadow-2xl hover:shadow-purple-500/50 transition-all transform hover:-translate-y-2 border-2 border-transparent hover:border-purple-500 text-center"
        >
          <div className="bg-purple-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-purple-600 transition-colors duration-300">
            <ShieldCheck
              className="text-purple-600 group-hover:text-white"
              size={40}
            />
          </div>
          <h2 className="text-3xl font-black text-gray-800 mb-2">
            Admin Panel
          </h2>
          <p className="text-gray-600 font-medium ">
            Manage results and voter database
          </p>
        </div>
      </div>

      {/* --- Admin Login Modal --- */}
      {showAdminModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-white w-full max-w-sm rounded-[2rem] p-8 relative shadow-2xl animate-in zoom-in duration-200">
            <button
              onClick={() => {
                setShowAdminModal(false);
                setShowPassword(false);
              }}
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
            >
              <X size={24} />
            </button>

            <div className="text-center mb-6">
              <div className="bg-purple-100 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Lock className="text-purple-600" size={30} />
              </div>
              <h3 className="text-2xl font-black text-gray-800">
                Admin Authorization
              </h3>
            </div>

            <form onSubmit={handleAdminLogin} className="space-y-4">
              <input
                type="text"
                placeholder="Admin ID"
                required
                className="w-full px-4 py-3 bg-gray-100 rounded-xl border-2 border-transparent focus:border-purple-500 outline-none font-bold"
                onChange={(e) => setAdminId(e.target.value)}
              />

              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  required
                  className="w-full pl-4 pr-12 py-3 bg-gray-100 rounded-xl border-2 border-transparent focus:border-purple-500 outline-none font-bold"
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-purple-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>

              <button
                type="submit"
                className="w-full bg-purple-600 text-white py-4 rounded-xl font-black hover:bg-purple-700 transition shadow-lg"
              >
                UNSEAL PANEL
              </button>
            </form>
          </div>
        </div>
      )}

      <div className="mt-16 text-white/70 text-sm font-bold relative z-10 tracking-widest">
        © 2025 SMART EVM PROJECT | BANGLADESH
      </div>
    </div>
  );
}

export default Home;
