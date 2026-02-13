import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, Eye, EyeOff, KeyRound } from "lucide-react";

function AdminLogin() {
  const navigate = useNavigate();

  const [adminId, setAdminId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // 🔹 Forgot password states
  const [forgotMode, setForgotMode] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // ✅ NEW: show/hide for reset inputs
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  //  Normal Login
  const handleAdminLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(
        // "http://localhost:5000/api/voter/admin-login",
        "https://evm-project-two.vercel.app/api/voter/admin-login",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ adminId, password }),
        }
      );

      const data = await response.json();
      if (data.success) {
        localStorage.setItem("adminToken", "isLoggedIn");
        navigate("/admin/dashboard", { replace: true });
      } else {
        alert(data.message || "Invalid Admin Credentials!");
      }
    } catch (err) {
      alert("Server error! Please check connection.");
    }
  };

  //  Forgot Password Handler
  const handlePasswordReset = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    try {
      const response = await fetch(
        // "http://localhost:5000/api/voter/admin-reset-password",
        "https://evm-project-two.vercel.app/api/voter/admin-reset-password",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ adminId, newPassword }),
        }
      );

      const data = await response.json();

      if (data.success) {
        alert("Password updated successfully!");
        setForgotMode(false);
        setNewPassword("");
        setConfirmPassword("");

        //  optional: reset visibility states
        setShowNewPassword(false);
        setShowConfirmPassword(false);
      } else {
        alert(data.message || "Failed to reset password");
      }
    } catch (err) {
      alert("Server error while resetting password");
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-slate-900 p-4 bg-cover bg-center relative"
      style={{ backgroundImage: `url('/images/bg1.jpg')` }}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>

      <div className="bg-white w-full max-w-sm rounded-[2.5rem] p-10 relative shadow-2xl z-10">
        <div className="text-center mb-8">
          <div className="bg-purple-100 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-4">
            {forgotMode ? (
              <KeyRound className="text-purple-600" size={40} />
            ) : (
              <Lock className="text-purple-600" size={40} />
            )}
          </div>

          <h3 className="text-3xl font-black text-gray-800 uppercase">
            {forgotMode ? "Reset Password" : "Admin Panel"}
          </h3>

          <p className="text-gray-400 text-xs font-bold uppercase mt-2">
            {forgotMode ? "Change Admin Password" : "Secure Authorization"}
          </p>
        </div>

        {/*  Conditional Form */}
        {!forgotMode ? (
          <form onSubmit={handleAdminLogin} className="space-y-5">
            <input
              type="text"
              placeholder="Admin ID"
              required
              className="w-full px-5 py-4 bg-gray-100 rounded-2xl font-bold"
              onChange={(e) => setAdminId(e.target.value)}
            />

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                required
                className="w-full pl-5 pr-12 py-4 bg-gray-100 rounded-2xl font-bold"
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2"
              >
                {showPassword ? <EyeOff /> : <Eye />}
              </button>
            </div>

            <button className="w-full bg-purple-600 text-white py-5 rounded-2xl font-black">
              LOGIN
            </button>

            <button
              type="button"
              onClick={() => setForgotMode(true)}
              className="w-full text-sm text-purple-600 font-bold hover:underline"
            >
              Forgot Password?
            </button>
          </form>
        ) : (
          <form onSubmit={handlePasswordReset} className="space-y-5">
            <input
              type="text"
              placeholder="Admin ID"
              required
              className="w-full px-5 py-4 bg-gray-100 rounded-2xl font-bold"
              onChange={(e) => setAdminId(e.target.value)}
            />

            {/* ✅ New Password with Eye */}
            <div className="relative">
              <input
                type={showNewPassword ? "text" : "password"}
                placeholder="New Password"
                required
                className="w-full pl-5 pr-12 py-4 bg-gray-100 rounded-2xl font-bold"
                onChange={(e) => setNewPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2"
              >
                {showNewPassword ? <EyeOff /> : <Eye />}
              </button>
            </div>

            {/* ✅ Confirm Password with Eye */}
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm Password"
                required
                className="w-full pl-5 pr-12 py-4 bg-gray-100 rounded-2xl font-bold"
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2"
              >
                {showConfirmPassword ? <EyeOff /> : <Eye />}
              </button>
            </div>

            <button className="w-full bg-purple-600 text-white py-5 rounded-2xl font-black">
              UPDATE PASSWORD
            </button>

            <button
              type="button"
              onClick={() => setForgotMode(false)}
              className="w-full text-sm text-gray-500 font-bold hover:underline"
            >
              Back to Login
            </button>
          </form>
        )}

        <button
          onClick={() => navigate("/")}
          className="w-full mt-6 text-gray-400 font-bold text-sm uppercase"
        >
          Cancel & Exit
        </button>
      </div>
    </div>
  );
}

export default AdminLogin;
