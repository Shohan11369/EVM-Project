import React from "react";
import { useNavigate } from "react-router-dom";
import { User } from "lucide-react";

function Home() {
  const navigate = useNavigate();

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-4 md:p-6 bg-cover bg-center relative"
      style={{ backgroundImage: `url('/images/bg1.jpg')` }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"></div>

      {/* Header Section */}
      <div className="text-center mb-10 md:mb-12 relative z-10 px-2">
        {/* Adjusted text sizes for mobile (text-3xl) vs desktop (text-6xl) */}
        <h1 className="text-3xl sm:text-4xl md:text-6xl font-black text-white mb-4 drop-shadow-lg leading-tight">
          National Smart Electronic <span className="text-red-500">Voting</span>{" "}
          System
        </h1>

        {/* Adjusted padding and text size for the badge */}
        <p className="text-white text-[10px] sm:text-sm md:text-lg font-bold tracking-widest uppercase bg-black/60 py-2 px-4 rounded-full inline-block backdrop-blur-sm">
          Biometric Facial Recognition
        </p>
      </div>

      {/* Voter Section - Responsive width and padding */}
      <div className="flex justify-center w-full max-w-4xl relative z-10 px-4">
        <div
          onClick={() => navigate("/login")}
          className="group cursor-pointer bg-white/95 backdrop-blur-md p-6 md:p-10 rounded-[1.5rem] md:rounded-[2.5rem] shadow-2xl hover:shadow-indigo-500/50 transition-all transform hover:-translate-y-2 border-2 border-transparent hover:border-indigo-500 text-center w-full max-w-sm md:max-w-md"
        >
          {/* Icon container sizes adjusted for mobile */}
          <div className="bg-indigo-100 w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center mx-auto mb-4 md:mb-6 group-hover:bg-indigo-600 transition-colors duration-300">
            <User
              className="text-indigo-600 group-hover:text-white"
              size={32}
            />
          </div>
          <h2 className="text-2xl md:text-3xl font-black text-gray-800 mb-2">
            Voter Login
          </h2>
          <p className="text-sm md:text-base text-gray-600 font-medium ">
            Cast your vote using Face Verification
          </p>
        </div>
      </div>

      {/* Footer - Scaled down for small screens */}
      <div className="mt-12 md:mt-16 text-white/70 text-[10px] md:text-sm font-bold relative z-10 tracking-widest text-center">
        © 2025 SMART EVM PROJECT | BANGLADESH
      </div>
    </div>
  );
}

export default Home;
