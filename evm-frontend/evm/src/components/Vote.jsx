import React, { useState, useEffect, useRef } from "react";
import * as faceapi from "face-api.js";
import {
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Box,
  Container,
  Paper,
  Avatar,
  Badge,
} from "@mui/material";
import {
  CheckCircle,
  GppBad,
  VerifiedUser,
  HomeWork,
  AccountCircle,
  Phone,
  CreditCard,
  LocationOn,
  ErrorOutline,
  MarkAsUnread,
} from "@mui/icons-material";

function Vote({ voterData }) {
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [isFaceMatched, setIsFaceMatched] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessScreen, setShowSuccessScreen] = useState(false);

  const [toast, setToast] = useState({ show: false, message: "", type: "" });
  const videoRef = useRef(null);
  const monitorIntervalRef = useRef(null);

  const showAutoMessage = (msg, type = "info") => {
    setToast({ show: true, message: msg, type: type });
    setTimeout(() => {
      setToast({ show: false, message: "", type: "" });
    }, 3000);
  };

  useEffect(() => {
    let voteStream = null;
    const startCameraAndMonitoring = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });
        voteStream = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;

        monitorIntervalRef.current = setInterval(async () => {
          if (
            videoRef.current &&
            videoRef.current.readyState === 4 &&
            !showSuccessScreen
          ) {
            const detection = await faceapi
              .detectSingleFace(
                videoRef.current,
                new faceapi.TinyFaceDetectorOptions()
              )
              .withFaceLandmarks()
              .withFaceDescriptor();

            if (!detection) {
              handleSecurityLogout("Face not detected! Logging out.");
              return;
            }

            if (voterData?.faceEncoding) {
              const distance = faceapi.euclideanDistance(
                detection.descriptor,
                new Float32Array(voterData.faceEncoding)
              );
              if (distance > 0.6) {
                handleSecurityLogout("Identity mismatch detected!");
              }
            }
          }
        }, 3000);
      } catch (err) {
        console.error("Camera access error:", err);
      }
    };

    startCameraAndMonitoring();
    return () => {
      if (monitorIntervalRef.current) clearInterval(monitorIntervalRef.current);
      if (voteStream) voteStream.getTracks().forEach((track) => track.stop());
    };
  }, [voterData, showSuccessScreen]);

  const handleSecurityLogout = (message) => {
    setIsFaceMatched(false);
    showAutoMessage(message, "error");
    setTimeout(() => {
      window.location.replace("/login");
    }, 3000);
  };

  const handleVoteSubmission = async () => {
    if (!selectedCandidate) {
      showAutoMessage("Please select a candidate first.", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("http://localhost:5000/api/voter/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          voterId: voterData.voterId,
          candidate: selectedCandidate,
        }),
      });
      const data = await response.json();

      if (data.success) {
        setShowSuccessScreen(true);
        setTimeout(() => {
          window.location.replace("/");
        }, 4000);
      } else {
        showAutoMessage(data.message || "Vote submission failed.", "error");
        setIsSubmitting(false);
      }
    } catch (err) {
      showAutoMessage("Server error! Please check connection.", "error");
      setIsSubmitting(false);
    }
  };

  const candidates = [
    { id: 1, name: "Awami League", symbol: "Boat", img: "/images/boat.jpg" },
    { id: 2, name: "BNP", symbol: "Sheaf of Paddy", img: "/images/BNP.png" },
    { id: 3, name: "Jatiya Party", symbol: "Plough", img: "/images/jatio.png" },
    {
      id: 4,
      name: "Jamaat-e-Islami",
      symbol: "Scales",
      img: "/images/jamat.png",
    },
    { id: 5, name: "Islami Andolan", symbol: "Hand Fan", img: "/images/p.jpg" },
    { id: 6, name: "NCP", symbol: "Star", img: "/images/ncp.png" },
  ];

  return (
    <Container maxWidth="lg" className="py-6 md:py-10 relative">
      {/* Success Screen Responsive */}
      {showSuccessScreen && (
        <Box className="fixed inset-0 z-[5000] bg-white flex flex-col items-center justify-center text-center px-6">
          <div className="animate-bounce mb-6">
            <CheckCircle
              sx={{ fontSize: { xs: 100, md: 150 }, color: "#10b981" }}
            />
          </div>
          <Typography
            variant="h2"
            sx={{ fontSize: { xs: "2.5rem", md: "3.75rem" } }}
            className="text-blue-500 font-black mb-4 animate-pulse"
          >
            CONGRATULATIONS!
          </Typography>
          <Typography variant="h5" className="text-black font-bold mb-8">
            Your Vote Has Been Recorded Successfully
          </Typography>
          <Box className="p-6 bg-gray-50 rounded-[2rem] border border-gray-200 shadow-sm max-w-md">
            <Typography
              variant="body1"
              className="text-black font-black uppercase tracking-widest leading-relaxed"
            >
              Thank you for participating <br /> in the democratic process.
            </Typography>
          </Box>
          <Typography
            variant="caption"
            className="mt-10 text-gray-400 uppercase tracking-widest"
          >
            Redirecting in 4 seconds...
          </Typography>
        </Box>
      )}

      {/* Toast Responsive */}
      {toast.show && (
        <Box
          className="fixed top-5 left-1/2 -translate-x-1/2 z-[3000] px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-bounce w-[90%] md:w-auto"
          sx={{
            bgcolor:
              toast.type === "success"
                ? "#10b981"
                : toast.type === "error"
                ? "#ef4444"
                : "#3b82f6",
            color: "white",
          }}
        >
          {toast.type === "success" ? <CheckCircle /> : <ErrorOutline />}
          <Typography fontWeight="bold" variant="body2">
            {toast.message}
          </Typography>
        </Box>
      )}

      {/* Access Denied Overlay */}
      {!isFaceMatched && !showSuccessScreen && (
        <div className="fixed inset-0 z-[2000] bg-red-900/98 flex flex-col items-center justify-center text-red-400 p-6 text-center">
          <GppBad sx={{ fontSize: 100, mb: 2 }} />
          <Typography
            variant="h3"
            fontWeight="900"
            sx={{ fontSize: { xs: "2rem", md: "3rem" } }}
          >
            ACCESS DENIED
          </Typography>
          <Typography variant="h6">Security mismatch detected.</Typography>
        </div>
      )}

      {/* Voter Profile Paper Responsive */}
      <Paper
        elevation={24}
        className="p-6 md:p-8 bg-gradient-to-br from-gray-900 via-indigo-950 to-blue-900 text-white mb-8 rounded-[2rem] md:rounded-[3rem] border-b-8 border-indigo-500 shadow-2xl"
      >
        <Grid container spacing={4} alignItems="center">
          <Grid item xs={12} md={3} className="text-center">
            <Avatar
              src={voterData?.image}
              sx={{
                width: { xs: 120, md: 170 },
                height: { xs: 120, md: 170 },
                border: "4px solid white",
                mx: "auto",
                boxShadow: "0 15px 30px rgba(0,0,0,0.4)",
              }}
            >
              <AccountCircle sx={{ fontSize: 100 }} />
            </Avatar>
            <Box className="mt-4 px-4 py-1 bg-green-500/20 border border-green-500/40 rounded-full inline-block">
              <Typography
                variant="caption"
                className="font-black text-green-400 uppercase tracking-tighter"
              >
                Verified Identity
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={12} md={9}>
            <Typography
              variant="h4"
              sx={{ fontSize: { xs: "1.8rem", md: "3rem" } }}
              className="font-black mb-4 md:mb-8 tracking-tight text-center md:text-left"
            >
              {voterData?.name || "N/A"}
            </Typography>
            <Grid container spacing={2}>
              {/* Profile Details Grid */}
              {[
                {
                  icon: <CreditCard />,
                  label: "Voter ID",
                  value: voterData?.voterId,
                },
                { icon: <Phone />, label: "Phone", value: voterData?.mobile },
                {
                  icon: <MarkAsUnread />,
                  label: "Post Code",
                  value: voterData?.postCode,
                },
                {
                  icon: <LocationOn />,
                  label: "Area",
                  value: `${voterData?.upazila}, ${voterData?.district}`,
                },
              ].map((item, idx) => (
                <Grid item xs={12} sm={6} md={4} key={idx}>
                  <Box className="flex items-center gap-3">
                    <div className="p-2 bg-white/10 rounded-xl flex-shrink-0">
                      {React.cloneElement(item.icon, {
                        className: "text-indigo-400",
                        fontSize: "small",
                      })}
                    </div>
                    <Box className="min-w-0">
                      <Typography
                        variant="caption"
                        className="block font-bold uppercase text-gray-400 text-[10px]"
                      >
                        {item.label}
                      </Typography>
                      <Typography
                        variant="body2"
                        className="font-bold truncate"
                      >
                        {item.value || "N/A"}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
              ))}
              <Grid item xs={12}>
                <Box className="flex items-center gap-3 mt-2">
                  <div className="p-2 bg-white/10 rounded-xl flex-shrink-0">
                    <HomeWork className="text-indigo-400" fontSize="small" />
                  </div>
                  <Box className="min-w-0">
                    <Typography
                      variant="caption"
                      className="block font-bold uppercase text-gray-400 text-[10px]"
                    >
                      Full Address
                    </Typography>
                    <Typography variant="body2" className="font-bold truncate">
                      {voterData?.address || "No address provided"}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Paper>

      {/* Camera Preview Responsive */}
      <Box className="flex flex-col items-center mb-8">
        <Badge
          overlap="circular"
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
          badgeContent={
            <VerifiedUser
              sx={{
                fontSize: { xs: 30, md: 45 },
                color: "#10b981",
                bgcolor: "white",
                borderRadius: "50%",
                p: 0.5,
              }}
            />
          }
        >
          <div className="w-24 h-24 md:w-36 md:h-36 rounded-full border-4 border-indigo-600 overflow-hidden shadow-2xl">
            <video
              ref={videoRef}
              autoPlay
              muted
              className="w-full h-full object-cover scale-x-[-1]"
            />
          </div>
        </Badge>
        <Typography
          variant="caption"
          className="mt-4 text-black font-bold uppercase bg-gray-100 px-4 py-1 rounded-full border"
        >
          Live Face Validation
        </Typography>
      </Box>

      {/* Candidate Selection Title */}
      <div className="flex items-center justify-center gap-3 p-3 bg-indigo-50 rounded-xl border border-indigo-100 mb-6">
        <span className="flex h-2 w-2 rounded-full bg-indigo-600 animate-pulse"></span>
        <Typography className="text-sm md:text-lg font-black text-black uppercase">
          Select Your Candidate
        </Typography>
      </div>

      {/* Candidates Grid Responsive */}
      <Grid
        container
        spacing={2}
        className={!isFaceMatched || showSuccessScreen ? "blur-3xl" : ""}
      >
        {candidates.map((c) => (
          <Grid item xs={12} md={6} key={c.id}>
            <Card
              onClick={() => !showSuccessScreen && setSelectedCandidate(c.name)}
              className={`cursor-pointer border-2 transition-all rounded-[1.5rem] md:rounded-[2.5rem] ${
                selectedCandidate === c.name
                  ? "border-green-500 bg-green-50 shadow-md"
                  : "border-gray-100"
              }`}
            >
              <CardContent className="flex items-center justify-between p-3 md:p-6 w-full">
                <Box className="flex items-center gap-3 md:gap-6 min-w-0">
                  <Avatar
                    src={c.img}
                    variant="rounded"
                    sx={{
                      width: { xs: 60, md: 110 },
                      height: { xs: 60, md: 110 },
                      borderRadius: 2,
                      bgcolor: "white",
                      border: "1px solid #eee",
                    }}
                  />
                  <Box className="min-w-0">
                    <Typography
                      variant="h6"
                      className="font-black text-gray-800 truncate"
                      sx={{ fontSize: { xs: "1rem", md: "1.5rem" } }}
                    >
                      {c.name}
                    </Typography>
                    <Typography
                      variant="caption"
                      className="text-indigo-500 font-bold uppercase tracking-tight block"
                    >
                      Symbol: {c.symbol}
                    </Typography>
                  </Box>
                </Box>
                {selectedCandidate === c.name ? (
                  <CheckCircle
                    sx={{ fontSize: { xs: 30, md: 60 } }}
                    className="text-green-500 flex-shrink-0"
                  />
                ) : (
                  <div className="w-8 h-8 md:w-12 md:h-12 border-2 border-gray-200 rounded-full flex-shrink-0" />
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Submit Button Responsive */}
      <Box className="text-center mt-12 mb-12">
        <Button
          onClick={handleVoteSubmission}
          disabled={
            !isFaceMatched ||
            !selectedCandidate ||
            isSubmitting ||
            showSuccessScreen
          }
          variant="contained"
          sx={{
            width: { xs: "100%", md: "auto" },
            px: { md: 10 },
            py: 2,
            borderRadius: "10rem",
            fontSize: { xs: "1rem", md: "1.5rem" },
            fontWeight: "900",
            background: "linear-gradient(135deg, #1e1b4b 0%, #3b82f6 100%)",
            boxShadow: "0 15px 30px rgba(59, 130, 246, 0.3)",
          }}
        >
          {isSubmitting ? "PROCESSING..." : "SUBMIT YOUR VOTE"}
        </Button>
      </Box>
    </Container>
  );
}

export default Vote;
