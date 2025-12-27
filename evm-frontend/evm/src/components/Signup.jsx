import React, { useState, useRef, useEffect } from "react";
import * as faceapi from "face-api.js";
import { useNavigate } from "react-router-dom";
import {
  User,
  MapPin,
  Camera,
  Loader2,
  CreditCard,
  Home,
  Phone,
  Hash,
  CheckCircle, 
} from "lucide-react";

function Signup() {
  const [name, setName] = useState("");
  const [nidNumber, setNidNumber] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [postCode, setPostCode] = useState("");
  const [address, setAddress] = useState("");
  const [division, setDivision] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false); // success message show

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
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
        streamRef.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;
      } catch (err) {
        console.error("Setup error:", err);
      }
    };
    loadModelsAndStartCamera();
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const handleSignup = async () => {
    if (
      !name ||
      !nidNumber ||
      !mobileNumber ||
      !postCode ||
      !address ||
      !division
    ) {
      return alert("Please provide all required information.");
    }

    setIsRegistering(true);
    setShowSuccess(false);

    try {
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

      const canvas = document.createElement("canvas");
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const capturedImage = canvas.toDataURL("image/jpeg");

      const res = await fetch("http://localhost:5000/api/voter/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          voterId: nidNumber.toUpperCase(),
          mobile: mobileNumber,
          postCode: postCode,
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

        // form restart
        setName("");
        setNidNumber("");
        setMobileNumber("");
        setPostCode("");
        setAddress("");
        setDivision("");

        // success message
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 5000);
      } else {
        alert(data.message || "Registration failed.");
      }
    } catch (error) {
      setIsRegistering(false);
      alert("Server Error! Check backend.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-blue-100 p-6 py-12">
      <div className="bg-white/90 backdrop-blur-md p-10 rounded-[3rem] shadow-2xl max-w-2xl w-full border border-white relative overflow-hidden">
        {/* Success Overlay - when registration success */}
        {showSuccess && (
          <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-white/95 transition-all">
            <div className="bg-green-100 p-6 rounded-full mb-4">
              <CheckCircle size={80} className="text-green-500" />
            </div>
            <h3 className="text-3xl font-black text-gray-800">SUCCESS!</h3>
            <p className="text-gray-500 font-bold mt-2">
              Voter ID: {nidNumber} is now enrolled.
            </p>
            <button
              onClick={() => setShowSuccess(false)}
              className="mt-6 px-8 py-3 bg-indigo-600 text-white rounded-full font-bold shadow-lg"
            >
              REGISTER ANOTHER
            </button>
          </div>
        )}

        <div className="text-center mb-10">
          <div className="inline-flex p-4 rounded-3xl bg-indigo-600 text-white mb-4 shadow-xl shadow-indigo-200">
            <User size={32} />
          </div>
          <h2 className="text-4xl font-black text-gray-800 tracking-tight">
            Voter Registration
          </h2>
          <p className="text-gray-500 text-sm mt-2 font-bold uppercase tracking-[0.3em]">
            Secure Biometric Enrollment
          </p>
        </div>

        <div className="space-y-6">
          {/* Full Name */}
          <div>
            <label className="block text-md font-semibold text-black uppercase tracking-wider mb-2 ml-2">
              Full Name
            </label>
            <div className="relative">
              <User className="absolute left-5 top-4 text-indigo-400 size-6" />
              <input
                type="text"
                placeholder="Enter your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-14 pr-6 py-4 bg-gray-50 border-2 border-transparent rounded-[1.5rem] focus:border-indigo-500 focus:bg-white outline-none transition-all font-normal text-lg"
              />
            </div>
          </div>

          {/* Voter ID & Mobile */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-md font-semibold text-black uppercase tracking-wider mb-2 ml-2">
                Voter ID / NID
              </label>
              <div className="relative">
                <CreditCard className="absolute left-5 top-4 text-indigo-400 size-6" />
                <input
                  type="text"
                  placeholder="Enter ID"
                  value={nidNumber}
                  onChange={(e) => setNidNumber(e.target.value)}
                  className="w-full pl-14 pr-6 py-4 bg-gray-50 border-2 border-transparent rounded-[1.5rem] focus:border-indigo-500 focus:bg-white outline-none transition-all font-normal text-lg"
                />
              </div>
            </div>
            <div>
              <label className="block text-md font-semibold text-black uppercase tracking-wider mb-2 ml-2">
                Mobile Number
              </label>
              <div className="relative">
                <Phone className="absolute left-5 top-4 text-indigo-400 size-6" />
                <input
                  type="text"
                  placeholder="017XXXXXXXX"
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value)}
                  className="w-full pl-14 pr-6 py-4 bg-gray-50 border-2 border-transparent rounded-[1.5rem] focus:border-indigo-500 focus:bg-white outline-none transition-all font-normal text-lg"
                />
              </div>
            </div>
          </div>

          {/* Division & Post Code */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-md font-semibold text-black uppercase tracking-wider mb-2 ml-2">
                Division
              </label>
              <div className="relative">
                <MapPin className="absolute left-5 top-4 text-indigo-400 size-6" />
                <select
                  value={division}
                  onChange={(e) => setDivision(e.target.value)}
                  className="w-full pl-14 pr-6 py-4 bg-gray-50 border-2 border-transparent rounded-[1.5rem] focus:border-indigo-500 focus:bg-white outline-none transition-all font-normal text-lg appearance-none cursor-pointer"
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
            </div>
            <div>
              <label className="block text-md font-semibold text-black uppercase tracking-wider mb-2 ml-2">
                Post Code
              </label>
              <div className="relative">
                <Hash className="absolute left-5 top-4 text-indigo-400 size-6" />
                <input
                  type="text"
                  placeholder="1234"
                  value={postCode}
                  onChange={(e) => setPostCode(e.target.value)}
                  className="w-full pl-14 pr-6 py-4 bg-gray-50 border-2 border-transparent rounded-[1.5rem] focus:border-indigo-500 focus:bg-white outline-none transition-all font-normal text-lg"
                />
              </div>
            </div>
          </div>

          {/* Residential Address */}
          <div>
            <label className="block text-md font-semibold text-black uppercase tracking-wider mb-2 ml-2">
              Residential Address
            </label>
            <div className="relative">
              <Home className="absolute left-5 top-5 text-indigo-400 size-6" />
              <textarea
                placeholder="House No, Road Name, Area, Upazila..."
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full pl-14 pr-6 py-4 bg-gray-50 border-2 border-transparent rounded-[1.5rem] focus:border-indigo-500 focus:bg-white outline-none transition-all h-28 resize-none font-normal text-lg"
              />
            </div>
          </div>

          {/* Biometric Scan Section */}
          <div className="space-y-3">
            <label className="block text-lg font-black text-green-400 uppercase tracking-wider ml-2 text-center">
              Face Verification Scan
            </label>
            <div className="relative overflow-hidden rounded-[2.5rem] border-8 border-white bg-black aspect-video shadow-2xl max-w-md mx-auto">
              <video
                ref={videoRef}
                autoPlay
                muted
                className="w-full h-full object-cover scale-x-[-1]"
              />
              <div className="absolute inset-x-0 top-0 h-1.5 bg-indigo-500 shadow-[0_0_20px_#6366f1] animate-[scan_3s_linear_infinite]"></div>
            </div>
          </div>

          <button
            onClick={handleSignup}
            disabled={!modelsLoaded || isRegistering}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-5 rounded-[2rem] shadow-2xl shadow-indigo-200 transition-all flex items-center justify-center gap-4 active:scale-[0.97] disabled:opacity-70 text-xl tracking-widest"
          >
            {isRegistering ? (
              <Loader2 className="animate-spin" size={28} />
            ) : (
              <Camera size={28} />
            )}
            {isRegistering ? "ENROLLING..." : "CONFIRM REGISTRATION"}
          </button>
        </div>
      </div>

      <style>{` @keyframes scan { 0% { top: 0%; } 50% { top: 100%; } 100% { top: 0%; } } `}</style>
    </div>
  );
}

export default Signup;
