import React, { useRef, useEffect, useState } from "react";
import * as faceapi from "face-api.js";
import { useNavigate } from "react-router-dom";
import {
  ShieldCheck,
  Loader2,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
} from "lucide-react";

function FaceLogin({ onLoginSuccess }) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const intervalRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [isScanning, setIsScanning] = useState(true);

  const [status, setStatus] = useState({ show: false, type: "", message: "" });
  const navigate = useNavigate();

  const showAutoMessage = (type, message) => {
    setStatus({ show: true, type, message });
    setTimeout(() => {
      setStatus({ show: false, type: "", message: "" });
    }, 4000); 
  };

  const playSound = (type) => {
    const audio = new Audio(type === "success" ? "/success.mp3" : "/error.mp3");
    audio.play().catch((err) => console.log("Sound error:", err));
  };

  const stopCamera = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) videoRef.current.srcObject = null;
  };

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
        startVideo();
      } catch (err) {
        console.error("Models loading error:", err);
      }
    };

    const startVideo = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: {} });
        streamRef.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;
      } catch (err) {
        showAutoMessage("error", "Camera access denied!");
      }
    };

    loadModels();
    return () => stopCamera();
  }, []);

  useEffect(() => {
    if (modelsLoaded && isScanning && !loading) {
      intervalRef.current = setInterval(async () => {
        if (!videoRef.current || !isScanning) return;

        const detection = await faceapi
          .detectSingleFace(
            videoRef.current,
            new faceapi.TinyFaceDetectorOptions()
          )
          .withFaceLandmarks()
          .withFaceDescriptor();

        if (detection && isScanning) {
          setIsScanning(false);
          handleAutoLogin(detection.descriptor);
        }
      }, 1500);
    }
    return () => clearInterval(intervalRef.current);
  }, [modelsLoaded, loading, isScanning]);

  const handleAutoLogin = async (descriptor) => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/voter/face-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ descriptor: Array.from(descriptor) }),
      });

      const data = await res.json();

      if (data.success) {
        playSound("success");
        showAutoMessage("success", "Login Successful!");
        setTimeout(() => {
          stopCamera();
          onLoginSuccess(data.voter);
          navigate("/vote", { replace: true });
        }, 1500);
      } else {
        playSound("error");
        setLoading(false);

        // name with logic
        if (data.isVoted && data.voterName) {
          showAutoMessage(
            "error",
            `Hello ${data.voterName}, you already voted!`
          );
        } else {
          showAutoMessage("error", data.message || "Identity not recognized!");
        }
        // ------------------------------------------

        setTimeout(() => setIsScanning(true), 5000);
      }
    } catch (error) {
      setLoading(false);
      showAutoMessage("error", "Server Connection Error!");
      setTimeout(() => setIsScanning(true), 5000);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-blue-100 p-4 relative">
      {/* Auto Notification Bar */}
      {status.show && (
        <div
          className={`absolute top-10 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl transition-all duration-500 animate-bounce ${
            status.type === "success"
              ? "bg-green-500 text-white"
              : "bg-red-500 text-white"
          }`}
        >
          {status.type === "success" ? (
            <CheckCircle size={24} />
          ) : (
            <AlertCircle size={24} />
          )}
          <span className="font-bold text-lg">{status.message}</span>
        </div>
      )}

      <div className="bg-white p-8 rounded-[2rem] shadow-2xl max-w-md w-full text-center relative">
        {/* back button */}
        <button
          onClick={() => navigate("/")}
          className="absolute left-6 top-8 text-gray-400 hover:text-indigo-600 transition-colors"
        >
          <ArrowLeft size={24} />
        </button>

        <div className="inline-flex p-3 rounded-full bg-indigo-100 text-indigo-600 mb-4">
          <ShieldCheck size={32} />
        </div>
        <h2 className="text-2xl font-black text-gray-800 tracking-tight">
          Biometric Login
        </h2>
        <p className="text-gray-500 mb-8">Keep face steady within the frame</p>

        <div className="relative overflow-hidden rounded-[2.5rem] bg-black aspect-square border-4 border-white shadow-2xl mb-8">
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            className="w-full h-full object-cover scale-x-[-1]"
          />

          {loading && (
            <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center text-white backdrop-blur-md z-20">
              <Loader2
                className="animate-spin mb-3 text-indigo-400"
                size={48}
              />
              <p className="font-bold tracking-widest uppercase text-sm">
                Verifying Identity...
              </p>
            </div>
          )}

          {isScanning && !loading && modelsLoaded && (
            <div className="absolute inset-x-0 top-0 h-1 bg-indigo-500 shadow-[0_0_20px_#6366f1] animate-[scan_2.5s_linear_infinite] z-10"></div>
          )}
        </div>

        <div
          className={`py-4 px-6 rounded-2xl text-sm font-bold transition-all ${
            !modelsLoaded
              ? "bg-gray-100 text-gray-400"
              : "bg-indigo-50 text-indigo-700"
          }`}
        >
          {!modelsLoaded
            ? "INITIALIZING AI..."
            : !isScanning && !loading
            ? "WAITING 5s..."
            : isScanning
            ? "SCANNING NOW..."
            : "PROCESSING..."}
        </div>
      </div>

      <style>{` @keyframes scan { 0% { top: 5%; } 50% { top: 95%; } 100% { top: 5%; } } `}</style>
    </div>
  );
}

export default FaceLogin;
