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
} from "@mui/icons-material";

function Vote({ voterData }) {
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [isFaceMatched, setIsFaceMatched] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const videoRef = useRef(null);
  const monitorIntervalRef = useRef(null);

  useEffect(() => {
    let voteStream = null;

    const startCameraAndMonitoring = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });
        voteStream = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }

        monitorIntervalRef.current = setInterval(async () => {
          if (videoRef.current && videoRef.current.readyState === 4) {
            const detection = await faceapi
              .detectSingleFace(
                videoRef.current,
                new faceapi.TinyFaceDetectorOptions()
              )
              .withFaceLandmarks()
              .withFaceDescriptor();

            if (!detection) {
              handleSecurityLogout(
                "Security Alert: Face not detected! Logging out for security."
              );
              return;
            }

            if (voterData?.faceEncoding) {
              const distance = faceapi.euclideanDistance(
                detection.descriptor,
                new Float32Array(voterData.faceEncoding)
              );
              if (distance > 0.6) {
                handleSecurityLogout("Security Alert: Face mismatch detected!");
              }
            }
          }
        }, 1500);
      } catch (err) {
        console.error("Camera access error:", err);
      }
    };

    startCameraAndMonitoring();

    return () => {
      if (monitorIntervalRef.current) {
        clearInterval(monitorIntervalRef.current);
      }
      if (voteStream) {
        voteStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [voterData]);

  const handleSecurityLogout = (message) => {
    setIsFaceMatched(false);
    alert(message);
    window.location.replace("/");
  };

  const handleVoteSubmission = async () => {
    if (!selectedCandidate) {
      alert("Please select a candidate first.");
      return;
    }

    const confirmCheck = window.confirm(
      `Are you sure you want to vote for ${selectedCandidate}?`
    );
    if (!confirmCheck) return;

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
        alert("Your vote has been submitted successfully. Thank you!");
        window.location.replace("/");
      } else {
        alert(data.message || "Vote submission failed.");
      }
    } catch (err) {
      console.error("Submission Error:", err);
      alert("Server error! Please try again later.");
    } finally {
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
      {!isFaceMatched && (
        <div className="fixed inset-0 z-[2000] bg-red-900/95 flex flex-col items-center justify-center text-white text-center">
          <GppBad sx={{ fontSize: 100, mb: 2 }} />
          <Typography variant="h3">ACCESS DENIED!</Typography>
          <Typography variant="h6">
            Security protocol triggered due to face mismatch.
          </Typography>
        </div>
      )}

      {/* Profile Header */}
      <Paper
        elevation={10}
        className="p-8 bg-gradient-to-r from-indigo-900 via-indigo-800 to-blue-800 text-white mb-10 rounded-[2.5rem] border-4 border-white/10 shadow-2xl"
      >
        <Grid container spacing={4} alignItems="center">
          <Grid
            item
            xs={12}
            md={4}
            className="flex justify-center md:justify-start gap-4"
          >
            {/* 1. Voter's Registered Image */}
            <Box className="text-center">
              <Typography
                variant="caption"
                className="block mb-2 opacity-70 uppercase font-black tracking-widest"
              >
                Voter Image
              </Typography>
              <Avatar
                src={voterData.image}
                sx={{
                  width: 120,
                  height: 120,
                  border: "4px solid white",
                  boxShadow: "0 8px 20px rgba(0,0,0,0.3)",
                }}
              >
                {/* If don't have image then show icon */}
                <AccountCircle sx={{ fontSize: 60 }} />
              </Avatar>
            </Box>
          </Grid>

          {/* Details Section */}
          <Grid item xs={12} md={5}>
            <Typography variant="h3" className="font-black tracking-tight mb-2">
              {voterData.name}
            </Typography>
            <Box className="flex flex-col gap-1">
              <Typography
                variant="h6"
                className="text-black font-bold flex items-center gap-2"
              >
                VOTER ID: {voterData.voterId}
              </Typography>
              <Typography
                variant="body1"
                className="text-black flex items-center gap-2 font-medium opacity-90"
              >
                <HomeWork sx={{ fontSize: 20 }} />
                {voterData.address}, {voterData.division}
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={12} md={3} className="text-center md:text-right">
            <Box className="inline-block px-6 py-3 bg-black/30 backdrop-blur-md rounded-2xl border border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <Typography className="font-black uppercase text-[10px] tracking-[0.2em]">
                  Shield Active
                </Typography>
              </div>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* 2. Live Camera Monitoring */}
      <div className="mb-10 flex justify-center">
        <Box className="text-center">
          <Typography
            variant="caption"
            className="block mb-3 opacity-70 uppercase font-black tracking-widest text-green-400 text-sm"
          >
            Live Scanning
          </Typography>

          <Badge
            overlap="circular"
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            badgeContent={
              <VerifiedUser color="success" sx={{ fontSize: 32 }} />
            }
          >
            <div className="w-[160px] h-[160px] rounded-full border-[6px] border-green-400 overflow-hidden bg-black shadow-2xl">
              <video
                ref={videoRef}
                autoPlay
                muted
                className="w-full h-full object-cover scale-x-[-1]"
              />
            </div>
          </Badge>
        </Box>
      </div>

      {/* Candidate Grid */}
      <Grid container spacing={3} className={!isFaceMatched ? "blur-3xl" : ""}>
        {candidates.map((c) => (
          <Grid item xs={12} md={6} key={c.id}>
            <Card
              onClick={() => setSelectedCandidate(c.name)}
              className={`cursor-pointer border-4 transition-all duration-300 rounded-[2.2rem] shadow-sm hover:shadow-xl ${
                selectedCandidate === c.name
                  ? "border-green-500 bg-green-50 scale-[1.02]"
                  : "border-gray-100 hover:border-indigo-300"
              }`}
            >
              <CardContent className="flex items-center justify-between p-6">
                <Box className="flex items-center gap-6">
                  <Avatar
                    src={c.img}
                    variant="rounded"
                    sx={{
                      width: 110,
                      height: 110,
                      borderRadius: 4,
                      border: "1px solid #ddd",
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
                      className="text-gray-500 font-black uppercase text-xs tracking-widest"
                    >
                      Mark: {c.symbol}
                    </Typography>
                  </Box>
                </Box>
                {selectedCandidate === c.name ? (
                  <CheckCircle
                    sx={{ fontSize: 55 }}
                    className="text-green-500"
                  />
                ) : (
                  <div className="w-10 h-10 border-4 border-gray-100 rounded-full" />
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Box className="text-center mt-16 mb-12">
        <Button
          onClick={handleVoteSubmission}
          disabled={!isFaceMatched || !selectedCandidate || isSubmitting}
          variant="contained"
          sx={{
            px: 15,
            py: 2.5,
            borderRadius: "10rem",
            fontSize: "1.5rem",
            fontWeight: "900",
            background: "linear-gradient(135deg, #1e1b4b 0%, #4338ca 100%)",
            boxShadow: "0 15px 40px rgba(67, 56, 202, 0.4)",
            "&:hover": {
              background: "linear-gradient(135deg, #4338ca 0%, #1e1b4b 100%)",
              transform: "translateY(-4px)",
            },
            "&:disabled": { background: "#4b5563", color: "#9ca3af" },
          }}
        >
          {isSubmitting ? "WAIT..." : "CAST MY VOTE"}
        </Button>
      </Box>
    </Container>
  );
}

export default Vote;
