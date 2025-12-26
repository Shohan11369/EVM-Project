import React, { useState, useRef, useEffect } from "react";
import * as faceapi from "face-api.js";
import { useNavigate } from "react-router-dom";
import { User, MapPin, Camera, Loader2, CreditCard, Home } from "lucide-react";

function Signup() {
  const [name, setName] = useState("");
  const [nidNumber, setNidNumber] = useState(""); 
  const [address, setAddress] = useState(""); 
  const [division, setDivision] = useState(""); 
  const [isRegistering, setIsRegistering] = useState(false);
  const videoRef = useRef(null);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const loadModels = async () => {
      try {
        const MODEL_URL = "/models";
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
          faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
        ]);
        setModelsLoaded(true);
      } catch (err) {
        console.error("Model load error:", err);
      }
    };
    loadModels();
    
    navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
      if (videoRef.current) videoRef.current.srcObject = stream;
    });

    return () =>
      videoRef.current?.srcObject?.getTracks().forEach((t) => t.stop());
  }, []);

  const handleSignup = async () => {
    // Basic validation
    if (!name || !nidNumber || !address || !division) {
      return alert("Please provide all required information (Name, ID, Address, and Division).");
    }

    setIsRegistering(true);
    
    // Face scanning
    const detections = await faceapi
      .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceDescriptor();

    if (!detections) {
      setIsRegistering(false);
      return alert("Face not detected! Please ensure you are in a well-lit area and facing the camera.");
    }

    try {
      const res = await fetch("http://localhost:5000/api/voter/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          voterId: nidNumber.toUpperCase(), 
          address,
          division,
          faceEncoding: Array.from(detections.descriptor),
        }),
      });

      const data = await res.json();
      setIsRegistering(false);

      if (data.success) {
        alert("Voter registered successfully!");
        navigate("/");
      } else {
        alert(data.message || "Registration failed.");
      }
    } catch (error) {
      setIsRegistering(false);
      alert("Server Error! Please check your backend connection.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-blue-100 p-4">
      <div className="bg-white/90 backdrop-blur-md p-8 rounded-[2.5rem] shadow-2xl max-w-lg w-full border border-white">
        
        <div className="text-center mb-6">
          <div className="inline-flex p-3 rounded-2xl bg-indigo-600 text-white mb-4 shadow-lg shadow-indigo-200">
            <User size={28} />
          </div>
          <h2 className="text-3xl font-black text-gray-800 tracking-tight">Voter Registration</h2>
          <p className="text-gray-500 text-sm mt-1 font-semibold uppercase tracking-widest">Biometric Enrollment System</p>
        </div>

        <div className="space-y-4">
          {/* Full Name */}
          <div className="relative">
            <User className="absolute left-4 top-3.5 text-indigo-400 size-5" />
            <input
              type="text"
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border-2 border-transparent rounded-2xl focus:border-indigo-500 focus:bg-white outline-none transition-all font-bold"
            />
          </div>

          {/* NID/Voter ID */}
          <div className="relative">
            <CreditCard className="absolute left-4 top-3.5 text-indigo-400 size-5" />
            <input
              type="text"
              placeholder="NID / Voter ID Number"
              value={nidNumber}
              onChange={(e) => setNidNumber(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border-2 border-transparent rounded-2xl focus:border-indigo-500 focus:bg-white outline-none transition-all font-bold"
            />
          </div>

          {/* Full Address */}
          <div className="relative">
            <Home className="absolute left-4 top-4 text-indigo-400 size-5" />
            <textarea
              placeholder="Residential Address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border-2 border-transparent rounded-2xl focus:border-indigo-500 focus:bg-white outline-none transition-all h-20 resize-none font-bold"
            />
          </div>

          {/* Division Select */}
          <div className="relative">
            <MapPin className="absolute left-4 top-3.5 text-indigo-400 size-5" />
            <select
              value={division}
              onChange={(e) => setDivision(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border-2 border-transparent rounded-2xl focus:border-indigo-500 focus:bg-white outline-none transition-all text-gray-700 font-bold appearance-none cursor-pointer"
            >
              <option value="">Select Division</option>
              <option value="Dhaka">Dhaka</option>
              <option value="Chattogram">Chattogram</option>
              <option value="Rajshahi">Rajshahi</option>
              <option value="Sylhet">Sylhet</option>
              <option value="Khulna">Khulna</option>
              <option value="Barishal">Barishal</option>
              <option value="Rangpur">Rangpur</option>
              <option value="Mymensingh">Mymensingh</option>
            </select>
          </div>

          {/* Camera Preview */}
          <div className="relative overflow-hidden rounded-3xl border-4 border-white bg-black aspect-video shadow-2xl">
            <video
              ref={videoRef}
              autoPlay
              muted
              className="w-full h-full object-cover scale-x-[-1]"
            />
            {/* Scanning UI overlay */}
            <div className="absolute inset-0 bg-indigo-500/5 pointer-events-none"></div>
            <div className="absolute inset-x-0 top-0 h-1 bg-indigo-400 shadow-[0_0_20px_#818cf8] animate-[scan_3s_linear_infinite]"></div>
          </div>

          {/* Submit Button */}
          <button
            onClick={handleSignup}
            disabled={!modelsLoaded || isRegistering}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-4 rounded-2xl shadow-xl shadow-indigo-200 transition-all flex items-center justify-center gap-3 active:scale-[0.98] disabled:opacity-70"
          >
            {isRegistering ? <Loader2 className="animate-spin" /> : <Camera className="size-6" />}
            {isRegistering ? "ENROLLING BIOMETRICS..." : "REGISTER VOTER"}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes scan {
          0% { top: 0%; }
          50% { top: 100%; }
          100% { top: 0%; }
        }
      `}</style>
    </div>
  );
}

export default Signup;