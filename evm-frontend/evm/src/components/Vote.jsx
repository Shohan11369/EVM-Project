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
  Numbers,
  CreditCard,
  LocationOn,
  ErrorOutline,
  Stars,
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
        //success screen on
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
    <Container maxWidth="lg" className="py-10 relative">
      {/* Success screen*/}
      {showSuccessScreen && (
        <Box className="fixed inset-0 z-[5000] bg-indigo-950 flex flex-col items-center justify-center text-center px-4">
          <div className="animate-bounce mb-6">
            <CheckCircle sx={{ fontSize: 150, color: "#10b981" }} />
          </div>
          <Typography
            variant="h2"
            className="text-white font-black mb-2 animate-pulse"
          >
            CONGRATULATIONS!
          </Typography>
          <Typography variant="h4" className="text-indigo-200 font-bold mb-8">
            Your Vote Has Been Recorded Successfully
          </Typography>
          <Box className="p-6 bg-white/10 rounded-[2rem] border border-white/20 backdrop-blur-md">
            <Typography
              variant="h6"
              className="text-green-400 font-black uppercase tracking-widest"
            >
              Thank you for participating <br /> in the democratic process.
            </Typography>
          </Box>
          <Typography
            variant="caption"
            className="mt-12 text-white/50 uppercase tracking-widest"
          >
            Redirecting to home in 4 seconds...
          </Typography>

          {/* Background Stars Effect */}
          <Stars
            className="absolute top-20 left-20 text-yellow-400 opacity-20 animate-spin"
            sx={{ fontSize: 40 }}
          />
          <Stars
            className="absolute bottom-40 right-40 text-yellow-400 opacity-20 animate-pulse"
            sx={{ fontSize: 60 }}
          />
        </Box>
      )}

      {/* auto notification*/}
      {toast.show && (
        <Box
          className="fixed top-10 left-1/2 -translate-x-1/2 z-[3000] px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-4 animate-bounce"
          sx={{
            bgcolor:
              toast.type === "success"
                ? "#10b981"
                : toast.type === "error"
                ? "#ef4444"
                : "#3b82f6",
            color: "white",
            minWidth: "300px",
          }}
        >
          {toast.type === "success" ? <CheckCircle /> : <ErrorOutline />}
          <Typography fontWeight="bold">{toast.message}</Typography>
        </Box>
      )}

      {/* Access Denied Overlay */}
      {!isFaceMatched && !showSuccessScreen && (
        <div className="fixed inset-0 z-[2000] bg-red-900/98 flex flex-col items-center justify-center text-red-400">
          <GppBad sx={{ fontSize: 120, mb: 2 }} />
          <Typography variant="h2" fontWeight="900">
            ACCESS DENIED
          </Typography>
          <Typography variant="h6">
            Security protocol active due to face mismatch.
          </Typography>
        </div>
      )}

      {/* Profile Header Card */}
      <Paper
        elevation={24}
        className="p-8 bg-gradient-to-br from-gray-900 via-indigo-950 to-blue-900 text-white mb-10 rounded-[3rem] border-b-8 border-indigo-500 shadow-2xl"
      >
        <Grid container spacing={4} alignItems="center">
          <Grid item xs={12} md={3} className="text-center">
            <Avatar
              src={voterData.image}
              sx={{
                width: 170,
                height: 170,
                border: "6px solid white",
                mx: "auto",
                boxShadow: "0 20px 40px rgba(0,0,0,0.6)",
              }}
            >
              <AccountCircle sx={{ fontSize: 120 }} />
            </Avatar>
            <Box className="mt-4 px-4 py-1 bg-green-500/20 border border-green-500/40 rounded-full inline-block">
              <Typography
                variant="caption"
                className="font-black text-green-400 uppercase tracking-widest"
              >
                Verified Identity
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={9}>
            <Typography variant="h3" className="font-black mb-8 tracking-tight">
              {voterData.name}
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md={4}>
                <Box className="flex items-center gap-3 mt-4">
                  <div className="p-2 bg-white/10 rounded-xl">
                    <CreditCard className="text-indigo-300" />
                  </div>
                  <Box>
                    <Typography
                      variant="caption"
                      className="block opacity-80 font-bold uppercase tracking-wider"
                    >
                      Voter ID
                    </Typography>
                    <Typography variant="body1" className="font-bold">
                      {voterData.voterId}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Box className="flex items-center gap-3 mt-4">
                  <div className="p-2 bg-white/10 rounded-xl">
                    <Phone className="text-indigo-300" />
                  </div>
                  <Box>
                    <Typography
                      variant="caption"
                      className="block opacity-80 font-bold uppercase tracking-wider"
                    >
                      Phone Number
                    </Typography>
                    <Typography variant="body1" className="font-bold">
                      {voterData.mobile || "N/A"}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Box className="flex items-center gap-3 mt-4">
                  <div className="p-2 bg-white/10 rounded-xl">
                    <LocationOn className="text-indigo-300" />
                  </div>
                  <Box>
                    <Typography
                      variant="caption"
                      className="block opacity-80 font-bold uppercase tracking-wider"
                    >
                      Division
                    </Typography>
                    <Typography variant="body1" className="font-bold">
                      {voterData.division}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Paper>

      {/* Live Monitoring */}
      <Box className="flex flex-col items-center mb-12">
        <Badge
          overlap="circular"
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
          badgeContent={
            <VerifiedUser
              sx={{
                fontSize: 45,
                color: "#10b981",
                bgcolor: "white",
                borderRadius: "50%",
                p: 0.5,
              }}
            />
          }
        >
          <div className="w-36 h-36 rounded-full border-4 border-indigo-600 overflow-hidden shadow-2xl">
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
          className="mt-4 font-black text-indigo-800 uppercase tracking-widest bg-gray-100 px-6 py-1 rounded-full border border-gray-200"
        >
          Real-time Identity Validation
        </Typography>
      </Box>

      {/* Candidates List */}
      <div className="flex items-center justify-center gap-3 p-4 bg-indigo-50 rounded-2xl border border-indigo-100 shadow-sm mb-6">
        <span className="flex h-3 w-3 rounded-full bg-indigo-600 animate-pulse"></span>
        <h2 className="text-xl font-black text-black uppercase tracking-tight">
          Please Select Your Candidate
        </h2>
      </div>

      <Grid
        container
        spacing={4}
        className={!isFaceMatched || showSuccessScreen ? "blur-3xl" : ""}
      >
        {candidates.map((c) => (
          <Grid item xs={12} md={6} key={c.id}>
            <Card
              onClick={() => !showSuccessScreen && setSelectedCandidate(c.name)}
              className={`cursor-pointer border-4 transition-all duration-300 rounded-[2.5rem] flex items-center ${
                selectedCandidate === c.name
                  ? "border-green-500 bg-green-50 shadow-lg scale-[1.01]"
                  : "border-gray-100 hover:border-indigo-300"
              }`}
            >
              <CardContent className="flex items-center justify-between p-6 w-full">
                <Box className="flex items-center gap-6">
                  <Avatar
                    src={c.img}
                    variant="rounded"
                    sx={{
                      width: 110,
                      height: 110,
                      borderRadius: 4,
                      border: "2px solid #eee",
                      bgcolor: "white",
                    }}
                  />
                  <Box>
                    <Typography
                      variant="h4"
                      className="font-black text-gray-800"
                    >
                      {c.name}
                    </Typography>
                    <Typography
                      variant="subtitle1"
                      className="text-indigo-500 font-black uppercase text-xs tracking-widest mt-1"
                    >
                      Symbol: {c.symbol}
                    </Typography>
                  </Box>
                </Box>
                {selectedCandidate === c.name ? (
                  <CheckCircle
                    sx={{ fontSize: 60 }}
                    className="text-green-500 animate-bounce"
                  />
                ) : (
                  <div className="w-12 h-12 border-4 border-gray-200 rounded-full" />
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Box className="text-center mt-20 mb-20">
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
            px: 15,
            py: 3,
            borderRadius: "10rem",
            fontSize: "1.7rem",
            fontWeight: "900",
            background: "linear-gradient(135deg, #1e1b4b 0%, #3b82f6 100%)",
            boxShadow: "0 25px 50px rgba(59, 130, 246, 0.4)",
            "&:hover": {
              transform: "translateY(-5px)",
              boxShadow: "0 30px 60px rgba(59, 130, 246, 0.5)",
            },
          }}
        >
          {isSubmitting ? "PROCESSING..." : "PLEASE SUBMIT YOUR VOTE"}
        </Button>
      </Box>
    </Container>
  );
}

export default Vote;
