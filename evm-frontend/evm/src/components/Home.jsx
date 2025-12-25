import React from "react";
import { useNavigate } from "react-router-dom";
import { User, ShieldCheck } from "lucide-react";

function Home() {
  const navigate = useNavigate();

  return (
    <div 
      className="min-h-screen flex flex-col items-center justify-center p-6 bg-cover bg-center relative"
      style={{ 
        backgroundImage: `url('/images/bg1.jpg')` 
      }}
    >
      {/* Overlay for better readability */}
      <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]"></div>

      <div className="text-center mb-12 relative z-10">
        <h1 className="text-6xl font-black text-white mb-4 drop-shadow-lg">
          Smart <span className="text-red-500">EVM</span> System
        </h1>
        <p className="text-white text-lg font-bold tracking-widest uppercase bg-black/60 py-1 px-4 rounded-full inline-block backdrop-blur-sm">
          Biometric Facial Recognition Voting System
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl relative z-10">
        {/* Voter Section */}
        <div 
          onClick={() => navigate("/login")}
          className="group cursor-pointer bg-white/90 backdrop-blur-md p-10 rounded-[2.5rem] shadow-2xl hover:shadow-indigo-500/50 transition-all transform hover:-translate-y-2 border-2 border-transparent hover:border-indigo-500 text-center"
        >
          <div className="bg-indigo-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-indigo-600 transition-colors duration-300">
            <User className="text-indigo-600 group-hover:text-white" size={40} />
          </div>
          <h2 className="text-2xl font-black text-gray-800 mb-2 font-bangla">Voter Login</h2>
          <p className="text-gray-600 font-medium">ভোট দিতে এখানে ক্লিক করুন (Face Verify)</p>
        </div>

        {/* Admin Section */}
        <div 
          onClick={() => navigate("/admin")}
          className="group cursor-pointer bg-white/90 backdrop-blur-md p-10 rounded-[2.5rem] shadow-2xl hover:shadow-purple-500/50 transition-all transform hover:-translate-y-2 border-2 border-transparent hover:border-purple-500 text-center"
        >
          <div className="bg-purple-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-purple-600 transition-colors duration-300">
            <ShieldCheck className="text-purple-600 group-hover:text-white" size={40} />
          </div>
          <h2 className="text-2xl font-black text-gray-800 mb-2 font-bangla">Admin Panel</h2>
          <p className="text-gray-600 font-medium">ফলাফল ও ভোটার ম্যানেজমেন্টের জন্য</p>
        </div>
      </div>
      
      <div className="mt-16 text-white/70 text-sm font-bold relative z-10 tracking-widest">
        © 2025 SMART EVM PROJECT | BANGLADESH
      </div>
    </div>
  );
}

export default Home;