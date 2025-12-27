import React, { useRef, useEffect, useState } from "react";
import * as faceapi from "face-api.js";
import { useNavigate } from "react-router-dom";
import { ShieldCheck, Loader2, IdCard } from "lucide-react";

function FaceLogin({ onLoginSuccess }) {
  const videoRef = useRef(null);
  const streamRef = useRef(null); 
  const [voterIdInput, setVoterIdInput] = useState(""); 
  const [loading, setLoading] = useState(false);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const navigate = useNavigate();

  //  Audio Helper
  const playSound = (type) => {
    const audio = new Audio(type === "success" ? "/success.mp3" : "/error.mp3");
    audio.play().catch(err => console.log("Sound error:", err));
  };

  useEffect(() => {
    const init = async () => {
      try {
        const MODEL_URL = "/models";
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
          faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
        ]);
        setModelsLoaded(true);

        //camera on 
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        streamRef.current = stream; 
        if (videoRef.current) videoRef.current.srcObject = stream;
      } catch (err) {
        console.error("Camera error:", err);
      }
    };
    init();

    
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => {
          track.stop(); // camera hardware on
        });
        console.log("Login Camera Stopped Successfully");
      }
    };
  }, []);

  // Automatic face detection logic
  useEffect(() => {
    let interval;
    if (modelsLoaded && voterIdInput.length >= 3 && !loading) {
      interval = setInterval(async () => {
        if (!videoRef.current) return;

        const detection = await faceapi.detectSingleFace(
          videoRef.current, 
          new faceapi.TinyFaceDetectorOptions()
        ).withFaceLandmarks().withFaceDescriptor();

        if (detection) {
          clearInterval(interval);
          handleAutoLogin(detection.descriptor);
        }
      }, 1500);
    }
    return () => clearInterval(interval);
  }, [modelsLoaded, voterIdInput, loading]);

  const handleAutoLogin = async (descriptor) => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/voter/face-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          voterId: voterIdInput.toUpperCase(), 
          descriptor: Array.from(descriptor) 
        }),
      });

      const data = await res.json();

      if (data.success) {
        playSound("success");
        onLoginSuccess(data.voter); 
        navigate("/vote"); 
      } else {
        playSound("error");
        alert(data.message || "Security Alert!");
        window.location.replace("/login"); 
      }
    } catch (error) {
      alert("Connection Error!");
      window.location.replace("/login");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-blue-100 p-4">
      <div className="bg-white p-8 rounded-[2rem] shadow-2xl max-w-md w-full text-center">
        <div className="inline-flex p-3 rounded-full bg-indigo-100 text-indigo-600 mb-4">
          <ShieldCheck size={32} />
        </div>
        <h2 className="text-2xl font-black text-gray-800">Biometric Authentication</h2>
        <p className="text-gray-500 mb-6">Enter ID to begin facial scanning</p>

        <div className="relative mb-6">
          <IdCard className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input 
            type="text"
            placeholder="Enter Voter ID"
            className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-indigo-500 outline-none font-bold transition-all"
            value={voterIdInput}
            onChange={(e) => setVoterIdInput(e.target.value)}
            disabled={loading}
          />
        </div>
        
        <div className="relative overflow-hidden rounded-2xl bg-black aspect-square border-4 border-white shadow-xl mb-6">
          <video ref={videoRef} autoPlay muted className="w-full h-full object-cover scale-x-[-1]" />
          {loading && (
            <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-white backdrop-blur-sm">
              <Loader2 className="animate-spin mb-2" size={40} />
              <p className="font-bold">Verifying Identity...</p>
            </div>
          )}
          
          {!loading && voterIdInput.length >= 3 && (
            <div className="absolute inset-x-0 top-0 h-1 bg-indigo-400 animate-[scan_2s_linear_infinite] shadow-[0_0_15px_#6366f1]"></div>
          )}
        </div>

        <div className={`py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
          voterIdInput.length < 3 ? "bg-gray-100 text-gray-600" : "bg-indigo-100 text-indigo-700"
        }`}>
          {voterIdInput.length < 3 ? "Please enter your Voter ID" : "Scanning... Keep your face steady"}
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

export default FaceLogin;