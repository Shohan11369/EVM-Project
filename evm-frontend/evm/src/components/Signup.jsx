import React, { useState, useRef, useEffect } from "react";
import * as faceapi from "face-api.js";
import { useNavigate } from "react-router-dom";
import { User, MapPin, Camera, Loader2 } from "lucide-react";

function Signup() {
  const [name, setName] = useState("");
  const [division, setDivision] = useState(""); // নতুন স্টেট
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
    if (!name || !division) return alert("Please fill Name and Select Division");
    setIsRegistering(true);
    
    const detections = await faceapi
      .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceDescriptor();

    if (!detections) {
      setIsRegistering(false);
      return alert("Face not detected! Please stand in light.");
    }

    try {
      const res = await fetch("http://localhost:5000/api/voter/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          division, // ব্যাকএন্ডে বিভাগ পাঠানো হচ্ছে
          faceEncoding: Array.from(detections.descriptor),
        }),
      });

      const data = await res.json();
      setIsRegistering(false);

      if (data.success) {
        // ভোটারকে তার নতুন আইডি জানিয়ে দেওয়া হচ্ছে
        alert(`Registration Successful!\nYour Unique Voter ID is: ${data.voterId}\nPlease note it down for voting.`);
        navigate("/");
      } else {
        alert(data.message);
      }
    } catch (error) {
      setIsRegistering(false);
      alert("Server Error! Check if backend is running.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="bg-white/80 backdrop-blur-md p-8 rounded-3xl shadow-2xl max-w-md w-full border border-white">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-indigo-900">Create Account</h2>
          <p className="text-gray-500 text-sm mt-2">Secure Biometric Voting Registration</p>
        </div>

        <div className="space-y-4">
          <div className="relative">
            <User className="absolute left-3 top-3 text-gray-400 size-5" />
            <input
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition"
            />
          </div>

          <div className="relative">
            <MapPin className="absolute left-3 top-3 text-gray-400 size-5" />
            <select
              value={division}
              onChange={(e) => setDivision(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition appearance-none text-gray-600"
            >
              <option value="">Select Division</option>
              <option value="Dhaka">Dhaka (ঢাকা)</option>
              <option value="Chattogram">Chattogram (চট্টগ্রাম)</option>
              <option value="Rajshahi">Rajshahi (রাজশাহী)</option>
              <option value="Sylhet">Sylhet (সিলেট)</option>
              <option value="Khulna">Khulna (খুলনা)</option>
            </select>
          </div>

          <div className="relative overflow-hidden rounded-2xl border-2 border-indigo-100 bg-black aspect-video">
            <video
              ref={videoRef}
              autoPlay
              muted
              className="w-full h-full object-cover scale-x-[-1]"
            />
            <div className="absolute inset-0 border-2 border-indigo-500/30 rounded-2xl pointer-events-none shadow-[inset_0_0_40px_rgba(0,0,0,0.5)]"></div>
          </div>

          <button
            onClick={handleSignup}
            disabled={!modelsLoaded || isRegistering}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-indigo-200 transition-all flex items-center justify-center gap-2"
          >
            {isRegistering ? <Loader2 className="animate-spin" /> : <Camera className="size-5" />}
            {isRegistering ? "Registering..." : "Capture & Register"}
          </button>
        </div>
      </div>
    </div>
  );
}
export default Signup;