import React, { useState, useEffect, useRef } from "react";
import * as faceapi from "face-api.js";
import { Card, CardContent, Typography, Button, Grid, Box, Container, Paper, Avatar, Badge } from "@mui/material";
import { CheckCircle, GppBad, VerifiedUser } from "@mui/icons-material";

function Vote({ voterData }) {
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [isFaceMatched, setIsFaceMatched] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const videoRef = useRef(null);
  const monitorIntervalRef = useRef(null);

  useEffect(() => {
    // Access camera
    navigator.mediaDevices.getUserMedia({ video: true })
      .then((s) => { if (videoRef.current) videoRef.current.srcObject = s; });

    // Live monitoring to ensure the same person stays in front of the camera
    const startMonitoring = () => {
      monitorIntervalRef.current = setInterval(async () => {
        if (videoRef.current && videoRef.current.readyState === 4) {
          const detection = await faceapi.detectSingleFace(
            videoRef.current, 
            new faceapi.TinyFaceDetectorOptions()
          ).withFaceLandmarks().withFaceDescriptor();

          if (!detection) {
            handleSecurityLogout("Security Alert: Face not detected! Logging out for security.");
            return;
          }

          if (voterData?.faceEncoding) {
            const distance = faceapi.euclideanDistance(
              detection.descriptor, 
              new Float32Array(voterData.faceEncoding)
            );
            // If the face changes during voting
            if (distance > 0.6) {
              handleSecurityLogout("Security Alert: Face mismatch detected!");
            }
          }
        }
      }, 1500);
    };

    startMonitoring();
    return () => clearInterval(monitorIntervalRef.current);
  }, [voterData]);

  const handleSecurityLogout = (message) => {
    clearInterval(monitorIntervalRef.current);
    setIsFaceMatched(false);
    alert(message);
    window.location.replace("/");
  };

  // Submit vote
  const handleVoteSubmission = async () => {
    if (!selectedCandidate) {
      alert("Please select a candidate first.");
      return;
    }

    const confirmCheck = window.confirm(`Are you sure you want to vote for ${selectedCandidate}?`);
    if (!confirmCheck) return;

    setIsSubmitting(true);
    try {
      const response = await fetch("http://localhost:5000/api/voter/vote", { 
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          voterId: voterData.voterId, 
          candidate: selectedCandidate 
        }),
      });

      const data = await response.json();
      if (data.success) {
        alert("Your vote has been submitted successfully. Thank you!");
        window.location.replace("/"); // Auto logout after voting
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
    { id: 4, name: "Jamaat-e-Islami", symbol: "Scales", img: "/images/jamat.png" },
    { id: 5, name: "Islami Andolan", symbol: "Hand Fan", img: "/images/p.jpg" },
    { id: 6, name: "NCP", symbol: "Star", img: "/images/ncp.png" },
  ];

  return (
    <Container maxWidth="lg" className="py-10 relative">
      {/* 🔴 Full Screen Block if Face Match Fails */}
      {!isFaceMatched && (
        <div className="fixed inset-0 z-[2000] bg-red-900/95 flex flex-col items-center justify-center text-white text-center">
          <GppBad sx={{ fontSize: 100, mb: 2 }} />
          <Typography variant="h3">ACCESS DENIED!</Typography>
          <Typography variant="h6">Security protocol triggered due to face mismatch.</Typography>
        </div>
      )}

      {/* 👤 Voter Profile Section */}
      <Paper elevation={10} className="p-6 bg-gradient-to-r from-indigo-900 to-blue-800 text-white mb-10 flex justify-between items-center rounded-[2rem] border-4 border-white/20">
        <Box className="flex items-center gap-6">
          <Badge overlap="circular" anchorOrigin={{ vertical: "bottom", horizontal: "right" }} badgeContent={<VerifiedUser color="success" />}>
            <div className="w-28 h-28 rounded-full border-4 border-green-400 overflow-hidden bg-black shadow-lg">
              <video ref={videoRef} autoPlay muted className="w-full h-full object-cover scale-x-[-1]" />
            </div>
          </Badge>
          <Box>
            <Typography variant="h4" className="font-black">{voterData.name}</Typography>
            <Typography variant="h6" className="text-green-300">Voter ID: {voterData.voterId}</Typography>
          </Box>
        </Box>
        <Box className="px-6 py-2 bg-white/10 rounded-full border border-white/20">
          <Typography className="font-bold uppercase text-xs tracking-widest">Live Security Monitoring</Typography>
        </Box>
      </Paper>

      {/* 🗳️ Candidate Grid */}
      <Grid container spacing={3} className={!isFaceMatched ? "blur-3xl" : ""}>
        {candidates.map((c) => (
          <Grid item xs={12} md={6} key={c.id}>
            <Card 
              onClick={() => setSelectedCandidate(c.name)}
              className={`cursor-pointer border-4 transition-all duration-300 rounded-[1.5rem] ${selectedCandidate === c.name ? "border-green-500 bg-green-50 shadow-xl" : "border-gray-100 hover:bg-gray-50"}`}
            >
              <CardContent className="flex items-center justify-between p-4">
                <Box className="flex items-center gap-4">
                  <Avatar src={c.img} variant="rounded" sx={{ width: 100, height: 100, borderRadius: 2, border: "2px solid #eee" }} />
                  <Box>
                    <Typography variant="h5" className="font-black text-gray-800">{c.name}</Typography>
                    <Typography variant="subtitle1" className="text-gray-500 font-bold">Symbol: {c.symbol}</Typography>
                  </Box>
                </Box>
                {selectedCandidate === c.name ? (
                  <CheckCircle sx={{ fontSize: 40 }} className="text-green-500" />
                ) : (
                  <div className="w-8 h-8 border-4 border-gray-200 rounded-full" />
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* 🚀 Confirm Button */}
      <Box className="text-center mt-12">
        <Button
          onClick={handleVoteSubmission}
          disabled={!isFaceMatched || !selectedCandidate || isSubmitting}
          variant="contained"
          sx={{
            px: 10, py: 2, borderRadius: "10rem", fontSize: "1.2rem", fontWeight: "900",
            background: "linear-gradient(45deg, #1e1b4b, #4338ca)",
            boxShadow: "0 10px 30px rgba(67, 56, 202, 0.4)",
            "&:hover": { background: "linear-gradient(45deg, #4338ca, #1e1b4b)" }
          }}
        >
          {isSubmitting ? "Processing..." : "Confirm My Vote"}
        </Button>
      </Box>
    </Container>
  );
}

export default Vote;