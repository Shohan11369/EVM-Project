import React, { useRef, useEffect, useState } from "react";
import * as faceapi from "face-api.js";
import { useNavigate } from "react-router-dom";
import { ShieldCheck, ScanFace, Loader2 } from "lucide-react";

function FaceLogin({ onLoginSuccess }) {
  const videoRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const navigate = useNavigate();

  // ১০ সেকেন্ড ধরে অ্যালার্ম বাজার ফাংশন
  const playIllegalSound = () => {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    let count = 0;

    // ১ সেকেন্ড পর পর সাউন্ড লুপ হবে ১০ বার
    const interval = setInterval(() => {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.type = "sawtooth"; // সাইরেনের মতো কর্কশ টোন
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime); 
      oscillator.frequency.exponentialRampToValueAtTime(100, audioContext.currentTime + 0.8);

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.8);

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.start();
      oscillator.stop(audioContext.currentTime + 0.8);

      count++;
      if (count >= 10) clearInterval(interval); // ১০ বার হয়ে গেলে বন্ধ হবে
    }, 1000);
  };

  useEffect(() => {
    const loadModels = async () => {
      const MODEL_URL = "/models";
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
        faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
        faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
      ]);
      setModelsLoaded(true);
    };
    loadModels();
    navigator.mediaDevices.getUserMedia({ video: true })
      .then((stream) => { if (videoRef.current) videoRef.current.srcObject = stream; });
    return () => videoRef.current?.srcObject?.getTracks().forEach((t) => t.stop());
  }, []);

  const handleLogin = async () => {
    setLoading(true);
    const detection = await faceapi.detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceDescriptor();

    if (!detection) {
      setLoading(false);
      return alert("Face not recognized. Please look directly at the camera.");
    }

    try {
      const res = await fetch("http://localhost:5000/api/voter/face-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ descriptor: Array.from(detection.descriptor) }),
      });

      const data = await res.json();
      setLoading(false);

      if (data.success) {
        onLoginSuccess(data.voterId);
        navigate("/vote"); 
      } else {
        // 10sec
        playIllegalSound();
        
        setTimeout(() => {
            alert(data.message || "Illegal Attempt detected! Security Alarm Triggered.");
        }, 300);
      }
    } catch (error) {
      setLoading(false);
      alert("Server Error!");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-teal-100 p-4">
      <div className="bg-white/100 backdrop-blur-lg p-10 rounded-[2rem] shadow-2xl max-w-md w-full border border-white text-center">
        <div className="inline-flex p-3 rounded-full bg-green-100 text-green-600 mb-4">
          <ShieldCheck size={32} />
        </div>
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Face Identity</h2>
        <p className="text-gray-500 mb-8">Align your face within the frame to verify identity</p>
        
        <div className="relative group mb-8">
          <div className="absolute -inset-1 bg-gradient-to-r from-green-400 to-teal-500 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
          <div className="relative overflow-hidden rounded-2xl bg-black aspect-square border-4 border-white shadow-xl">
            <video ref={videoRef} autoPlay muted className="w-full h-full object-cover scale-x-[-1]" />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-green-400/20 to-transparent h-1/4 w-full animate-[scan_2s_linear_infinite] border-b-2 border-green-400"></div>
          </div>
        </div>

        <button 
          onClick={handleLogin} 
          disabled={!modelsLoaded || loading}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-2xl shadow-lg transition-all transform hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-3 disabled:bg-gray-400"
        >
          {loading ? <Loader2 className="animate-spin" /> : <ScanFace />}
          {loading ? "Verifying..." : "Start Face Scan"}
        </button>
      </div>

      <style>{`
        @keyframes scan {
          0% { top: -25%; }
          100% { top: 100%; }
        }
      `}</style>
    </div>
  );
}
export default FaceLogin;