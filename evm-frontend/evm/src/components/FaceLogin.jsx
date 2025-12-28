import React, { useRef, useEffect, useState } from "react";
import * as faceapi from "face-api.js";
import { useNavigate } from "react-router-dom";
import { ShieldCheck, Loader2 } from "lucide-react";

function FaceLogin({ onLoginSuccess }) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const intervalRef = useRef(null); // Interval track
  const [loading, setLoading] = useState(false);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [isScanning, setIsScanning] = useState(true); 
  const navigate = useNavigate();

  const playSound = (type) => {
    const audio = new Audio(type === "success" ? "/success.mp3" : "/error.mp3");
    audio.play().catch((err) => console.log("Sound error:", err));
  };

  const stopCamera = () => {
    // interval off
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    // camera track off
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) videoRef.current.srcObject = null;
    console.log("System Cleared: Camera and Interval Stopped");
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
        console.error("Models/Camera error:", err);
      }
    };

    const startVideo = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: {} });
        streamRef.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;
      } catch (err) {
        alert("Camera access denied or not found!");
      }
    };

    loadModels();
    return () => stopCamera(); //all clear
  }, []);

  useEffect(() => {
    if (modelsLoaded && isScanning && !loading) {
      intervalRef.current = setInterval(async () => {
        if (!videoRef.current || !isScanning) return;

        const detection = await faceapi
          .detectSingleFace(
            videoObject(),
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

  // Helper to get video element
  const videoObject = () => videoRef.current;

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
        stopCamera(); 
        onLoginSuccess(data.voter);
        navigate("/vote");
      } else {
        playSound("error");
        setLoading(false);
        alert(data.message || "Face not recognized!");
        setIsScanning(true); 
      }
    } catch (error) {
      setLoading(false);
      setIsScanning(true);
      console.error("Login Error:", error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-blue-100 p-4">
      <div className="bg-white p-8 rounded-[2rem] shadow-2xl max-w-md w-full text-center">
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
            : isScanning
            ? "SCANNING NOW..."
            : "PROCESSING..."}
        </div>
      </div>

      <style>{`
        @keyframes scan { 
          0% { top: 5%; } 
          50% { top: 95%; }
          100% { top: 5%; } 
        }
      `}</style>
    </div>
  );
}

export default FaceLogin;
