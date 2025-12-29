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
  LayoutDashboard,
  LogOut,
  XCircle,
} from "lucide-react";

function Signup() {
  const [name, setName] = useState("");
  const [nidNumber, setNidNumber] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [postCode, setPostCode] = useState("");
  const [address, setAddress] = useState("");
  const [division, setDivision] = useState("");
  const [district, setDistrict] = useState("");
  const [upazila, setUpazila] = useState("");
  const [addressList, setAddressList] = useState([]);

  const [isRegistering, setIsRegistering] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [toast, setToast] = useState({ show: false, type: "", message: "" });

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const navigate = useNavigate();

  const nidRef = useRef(null);
  const mobileRef = useRef(null);
  const divisionRef = useRef(null);
  const districtRef = useRef(null);
  const upazilaRef = useRef(null);
  const postCodeRef = useRef(null);
  const addressRef = useRef(null);

  const showAutoToast = (type, message) => {
    setToast({ show: true, type, message });
    setTimeout(() => {
      setToast({ show: false, type: "", message: "" });
    }, 3000);
  };

  const handleKeyDown = (e, nextRef) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (nextRef && nextRef.current) {
        nextRef.current.focus();
      }
    }
  };

  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/address-data");
        const data = await res.json();
        setAddressList(data);
      } catch (err) {
        console.error("Address fetch error:", err);
      }
    };
    fetchAddresses();
  }, []);

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

  const divisions = [...new Set(addressList.map((item) => item.division))];
  const districts = addressList
    .filter((item) => item.division === division)
    .map((item) => item.district);
  const upazilas =
    addressList.find((item) => item.district === district)?.upazilas || [];

  const handleSignup = async () => {
    if (
      !name ||
      !nidNumber ||
      !mobileNumber ||
      !postCode ||
      !address ||
      !division ||
      !district ||
      !upazila
    ) {
      return showAutoToast("error", "Please provide all information.");
    }

    setIsRegistering(true);
    try {
      const detections = await faceapi
        .detectSingleFace(
          videoRef.current,
          new faceapi.TinyFaceDetectorOptions({
            inputSize: 512,
            scoreThreshold: 0.5,
          })
        )
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (!detections) {
        setIsRegistering(false);
        return showAutoToast(
          "error",
          "Face not detected! Please face the camera."
        );
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
          division,
          district,
          upazila,
          postCode,
          address,
          faceEncoding: Array.from(detections.descriptor),
          image: capturedImage,
        }),
      });

      const data = await res.json();
      setIsRegistering(false);

      if (data.success) {
        showAutoToast("success", "Voter registered successfully!");
        // Reset Inputs
        setName("");
        setNidNumber("");
        setMobileNumber("");
        setPostCode("");
        setAddress("");
        setDivision("");
        setDistrict("");
        setUpazila("");

        // Show Success Overlay
        setShowSuccess(true);

        // after 3 sec automatically refresh
        setTimeout(() => {
          setShowSuccess(false);
        }, 3000);
      } else {
        showAutoToast("error", data.message || "Registration failed.");
      }
    } catch (error) {
      setIsRegistering(false);
      showAutoToast("error", "Server Error! Check backend.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-blue-100 p-6 py-12 relative">
      {toast.show && (
        <div
          className={`fixed top-10 left-1/2 -translate-x-1/2 z-[100] px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-bounce transition-all ${
            toast.type === "success"
              ? "bg-green-600 text-white"
              : "bg-red-600 text-white"
          }`}
        >
          {toast.type === "success" ? (
            <CheckCircle size={24} />
          ) : (
            <XCircle size={24} />
          )}
          <span className="font-black uppercase tracking-wider">
            {toast.message}
          </span>
        </div>
      )}

      <div className="bg-white/90 backdrop-blur-md p-10 rounded-[3rem] shadow-2xl max-w-2xl w-full border border-white relative overflow-hidden">
        <div className="flex justify-between items-center mb-8">
          <button
            onClick={() => navigate("/admin/dashboard")}
            className="flex items-center gap-2 text-xs font-black text-indigo-600 border-2 border-indigo-100 px-4 py-2 rounded-2xl hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
          >
            <LayoutDashboard size={18} /> LIVE DASHBOARD
          </button>
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-xs font-black text-red-500 border-2 border-red-50 px-4 py-2 rounded-2xl hover:bg-red-500 hover:text-white transition-all"
          >
            <LogOut size={18} /> LOGOUT
          </button>
        </div>

        {showSuccess && (
          <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-white/95 transition-all">
            <div className="bg-green-100 p-6 rounded-full mb-4">
              <CheckCircle size={80} className="text-green-500" />
            </div>
            <h3 className="text-3xl font-black text-gray-800">SUCCESS!</h3>
            <p className="text-gray-500 font-bold mt-2">
              Registration completed successfully.
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
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-md font-semibold text-black uppercase tracking-wider mb-2 ml-2">
              Full Name
            </label>
            <div className="relative">
              <User className="absolute left-5 top-4 text-indigo-400 size-6" />
              <input
                type="text"
                placeholder="Enter full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, nidRef)}
                autoFocus
                className="w-full pl-14 pr-6 py-4 bg-gray-50 border-2 border-transparent rounded-[1.5rem] focus:border-indigo-500 focus:bg-white outline-none transition-all font-normal text-lg"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-md font-semibold text-black uppercase tracking-wider mb-2 ml-2">
                Voter ID / NID
              </label>
              <div className="relative">
                <CreditCard className="absolute left-5 top-4 text-indigo-400 size-6" />
                <input
                  ref={nidRef}
                  type="text"
                  placeholder="Enter ID"
                  value={nidNumber}
                  onChange={(e) => setNidNumber(e.target.value)}
                  onKeyDown={(e) => handleKeyDown(e, mobileRef)}
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
                  ref={mobileRef}
                  type="text"
                  placeholder="017XXXXXXXX"
                  value={mobileNumber}
                  onChange={(e) => {
                    const value = e.target.value;
                    // regex only number
                    if (/^\d*$/.test(value)) {
                      setMobileNumber(value);
                    }
                  }}
                  onKeyDown={(e) => handleKeyDown(e, divisionRef)}
                  className="w-full pl-14 pr-6 py-4 bg-gray-50 border-2 border-transparent rounded-[1.5rem] focus:border-indigo-500 focus:bg-white outline-none transition-all font-normal text-lg"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-md font-semibold text-black uppercase tracking-wider mb-2 ml-2">
                Division
              </label>
              <div className="relative">
                <MapPin className="absolute left-5 top-4 text-indigo-400 size-6" />
                <select
                  ref={divisionRef}
                  value={division}
                  onChange={(e) => {
                    setDivision(e.target.value);
                    setDistrict("");
                    setUpazila("");
                  }}
                  onKeyDown={(e) => handleKeyDown(e, districtRef)}
                  className="w-full pl-14 pr-6 py-4 bg-gray-50 border-2 border-transparent rounded-[1.5rem] focus:border-indigo-500 focus:bg-white outline-none transition-all font-normal text-lg appearance-none cursor-pointer"
                >
                  <option value="">Select Division</option>
                  {divisions.map((div) => (
                    <option key={div} value={div}>
                      {div}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-md font-semibold text-black uppercase tracking-wider mb-2 ml-2">
                District
              </label>
              <div className="relative">
                <MapPin className="absolute left-5 top-4 text-indigo-400 size-6" />
                <select
                  ref={districtRef}
                  value={district}
                  onChange={(e) => {
                    setDistrict(e.target.value);
                    setUpazila("");
                  }}
                  onKeyDown={(e) => handleKeyDown(e, upazilaRef)}
                  disabled={!division}
                  className="w-full pl-14 pr-6 py-4 bg-gray-50 border-2 border-transparent rounded-[1.5rem] focus:border-indigo-500 focus:bg-white outline-none transition-all font-normal text-lg appearance-none cursor-pointer disabled:opacity-50"
                >
                  <option value="">Select District</option>
                  {districts.map((dis) => (
                    <option key={dis} value={dis}>
                      {dis}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-md font-semibold text-black uppercase tracking-wider mb-2 ml-2">
                Upazila
              </label>
              <div className="relative">
                <MapPin className="absolute left-5 top-4 text-indigo-400 size-6" />
                <select
                  ref={upazilaRef}
                  value={upazila}
                  onChange={(e) => setUpazila(e.target.value)}
                  onKeyDown={(e) => handleKeyDown(e, postCodeRef)}
                  disabled={!district}
                  className="w-full pl-14 pr-6 py-4 bg-gray-50 border-2 border-transparent rounded-[1.5rem] focus:border-indigo-500 focus:bg-white outline-none transition-all font-normal text-lg appearance-none cursor-pointer disabled:opacity-50"
                >
                  <option value="">Select Upazila</option>
                  {upazilas.map((upa) => (
                    <option key={upa} value={upa}>
                      {upa}
                    </option>
                  ))}
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
                  ref={postCodeRef}
                  type="text"
                  placeholder="1234"
                  value={postCode}
                  onChange={(e) => {
                    const value = e.target.value;
                    // only number
                    if (/^\d*$/.test(value)) {
                      setPostCode(value);
                    }
                  }}
                  onKeyDown={(e) => handleKeyDown(e, addressRef)}
                  className="w-full pl-14 pr-6 py-4 bg-gray-50 border-2 border-transparent rounded-[1.5rem] focus:border-indigo-500 focus:bg-white outline-none transition-all font-normal text-lg"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-md font-semibold text-black uppercase tracking-wider mb-2 ml-2">
              House No / Road Name
            </label>
            <div className="relative">
              <Home className="absolute left-5 top-5 text-indigo-400 size-6" />
              <textarea
                ref={addressRef}
                placeholder="House No, Road Name, Area details..."
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full pl-14 pr-6 py-4 bg-gray-50 border-2 border-transparent rounded-[1.5rem] focus:border-indigo-500 focus:bg-white outline-none transition-all h-28 resize-none font-normal text-lg"
              />
            </div>
          </div>

          <div className="space-y-3">
            <div className="relative overflow-hidden rounded-[2.5rem] border-8 border-white bg-black aspect-video shadow-2xl max-w-md mx-auto">
              <video
                ref={videoRef}
                autoPlay
                muted
                className="w-full h-full object-cover scale-x-[-1]"
              />
              <div className="absolute inset-x-0 top-0 h-1.5 bg-indigo-500 animate-[scan_3s_linear_infinite]"></div>
            </div>
          </div>

          <button
            onClick={handleSignup}
            disabled={!modelsLoaded || isRegistering}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-5 rounded-[2rem] transition-all flex items-center justify-center gap-4 text-xl tracking-widest"
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
