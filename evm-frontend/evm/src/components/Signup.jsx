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
    let signupStream = null;

    const loadModelsAndStartCamera = async () => {
      try {
        const MODEL_URL = "/models";
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
          faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
        ]);
        setModelsLoaded(true);

        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });
        signupStream = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;
      } catch (err) {
        console.error("Setup error:", err);
      }
    };

    loadModelsAndStartCamera();

    return () => {
      if (signupStream) {
        signupStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const handleSignup = async () => {
    if (!name || !nidNumber || !address || !division) {
      return alert("Please provide all required information.");
    }

    setIsRegistering(true);

    try {
      // 1. face detect 
      const detections = await faceapi
        .detectSingleFace(
          videoRef.current,
          new faceapi.TinyFaceDetectorOptions()
        )
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (!detections) {
        setIsRegistering(false);
        return alert("Face not detected! Please face the camera.");
      }

      // 2. Image capture from video
      const canvas = document.createElement("canvas");
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const capturedImage = canvas.toDataURL("image/jpeg");

      // 3. Data send backend
      const res = await fetch("http://localhost:5000/api/voter/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          voterId: nidNumber.toUpperCase(),
          address,
          division,
          faceEncoding: Array.from(detections.descriptor),
          image: capturedImage,
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
      console.error("Signup Error:", error);
      alert("Server Error! Make sure your backend is running.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-blue-100 p-4">
      <div className="bg-white/90 backdrop-blur-md p-8 rounded-[2.5rem] shadow-2xl max-w-lg w-full border border-white">
        <div className="text-center mb-6">
          <div className="inline-flex p-3 rounded-2xl bg-indigo-600 text-white mb-4 shadow-lg shadow-indigo-200">
            <User size={28} />
          </div>
          <h2 className="text-3xl font-black text-gray-800 tracking-tight">
            Voter Registration
          </h2>
          <p className="text-gray-500 text-sm mt-1 font-semibold uppercase tracking-widest">
            Biometric Enrollment System
          </p>
        </div>

        <div className="space-y-4">
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

          <div className="relative">
            <Home className="absolute left-4 top-4 text-indigo-400 size-5" />
            <textarea
              placeholder="Residential Address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border-2 border-transparent rounded-2xl focus:border-indigo-500 focus:bg-white outline-none transition-all h-20 resize-none font-bold"
            />
          </div>

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

          <div className="relative overflow-hidden rounded-3xl border-4 border-white bg-black aspect-video shadow-2xl">
            <video
              ref={videoRef}
              autoPlay
              muted
              className="w-full h-full object-cover scale-x-[-1]"
            />
            <div className="absolute inset-x-0 top-0 h-1 bg-indigo-400 shadow-[0_0_20px_#818cf8] animate-[scan_3s_linear_infinite]"></div>
          </div>

          <button
            onClick={handleSignup}
            disabled={!modelsLoaded || isRegistering}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-4 rounded-2xl shadow-xl shadow-indigo-200 transition-all flex items-center justify-center gap-3 active:scale-[0.98] disabled:opacity-70"
          >
            {isRegistering ? (
              <Loader2 className="animate-spin" />
            ) : (
              <Camera className="size-6" />
            )}
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
