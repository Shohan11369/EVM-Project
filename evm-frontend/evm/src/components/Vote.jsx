import React, { useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  Button,
  Avatar,
  Grid,
  Box,
  Container,
  Paper,
} from "@mui/material";
import { CheckCircle, HowToVote } from "@mui/icons-material";

function Vote({ voterId }) {
  const [selectedCandidate, setSelectedCandidate] = useState(null);

  const candidates = [
    {
      id: 1,
      name: "Bangladesh Awami League",
      image: "https://via.placeholder.com/150",
      symbolImage: "/images/boat.jpg",
      symbolName: "Boat",
    },
    {
      id: 2,
      name: "Bangladesh Nationalist Party (BNP)",
      image: "https://via.placeholder.com/150",
      symbolImage: "/images/BNP.png",
      symbolName: "Sheaf of Paddy",
    },
    {
      id: 3,
      name: "Jatiya Party (Ershad)",
      image: "https://via.placeholder.com/150",
      symbolImage: "/images/jatio.png",
      symbolName: "Plough",
    },
    {
      id: 4,
      name: "Bangladesh Jamaat-e-Islami",
      image: "https://via.placeholder.com/150",
      symbolImage: "/images/jamat.png",
      symbolName: "Scales",
    },
    {
      id: 5,
      name: "Islami Andolan Bangladesh",
      image: "https://via.placeholder.com/150",
      symbolImage: "/images/p.jpg",
      symbolName: "Hand Fan",
    },
    {
      id: 6,
      name: "NCP",
      image: "https://via.placeholder.com/150",
      symbolImage: "/images/ncp.png",
      symbolName: "Star",
    },
  ];

  const handleVote = async () => {
    if (!selectedCandidate)
      return alert("Please select a candidate before voting!");
    if (
      !window.confirm(`Are you sure you want to vote for ${selectedCandidate}?`)
    )
      return;

    const res = await fetch("http://localhost:5000/api/voter/vote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ voterId, candidate: selectedCandidate }),
    });

    const data = await res.json();
    setTimeout(() => {
      alert(data.message);
      if (data.success) window.location.href = "/";
    }, 500);
  };

  // card render
  const renderCandidateCard = (candidate) => (
    <Card
      key={candidate.id}
      onClick={() => setSelectedCandidate(candidate.name)}
      className={`mb-4 cursor-pointer rounded-2xl border-2 transition-all duration-300 ${
        selectedCandidate === candidate.name
          ? "border-green-500 bg-green-50 shadow-lg scale-[1.02]"
          : "border-transparent bg-gray-50 hover:bg-gray-100"
      }`}
      sx={{
        height: 180, 
        display: "flex",
        alignItems: "center",
      }}
    >
      <CardContent className="flex items-center gap-4 w-full p-4">
        <Avatar
          src={candidate.image}
          sx={{ width: 120, height: 120 }}
          className="border-2 border-white shadow-md"
        />

        <Box className="flex-grow text-left">
          <Typography
            variant="h8"
            className="font-bold text-gray-800 leading-tight"
            sx={{
              fontSize: "1rem",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {candidate.name}
          </Typography>
          <Typography variant="body2" className="text-gray-500 italic mt-2">
            Symbol: {candidate.symbolName}
          </Typography>
        </Box>

        <Box className="flex flex-col items-center justify-center min-w-[100px]">
          <img
            src={candidate.symbolImage}
            alt={candidate.symbolName}
            className="w-20 h-20 object-contain mb-1"
          />
          {selectedCandidate === candidate.name ? (
            <CheckCircle className="text-green-500" fontSize="small" />
          ) : (
            <div className="h-5 w-5" /> 
          )}
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Container maxWidth="lg" className="py-10">
      <Paper
        elevation={0}
        className="p-8 rounded-[2.5rem] bg-white/70 backdrop-blur-md shadow-2xl border border-white text-center"
      >
        <Typography variant="h3" className="font-black text-indigo-900 mb-2">
          Electronic Ballot Paper
        </Typography>
        <Typography
          variant="h6"
          className="text-gray-500 mb-10 uppercase tracking-widest"
        >
          Voter ID:{" "}
          <span className="text-indigo-600 font-black">{voterId}</span>
        </Typography>

        <Grid container spacing={4}>
          {/* Left Column (1, 2, 3) */}
          <Grid item xs={12} md={6}>
            {candidates.slice(0, 3).map(renderCandidateCard)}
          </Grid>

          {/* Right Column (4, 5, 6) */}
          <Grid item xs={12} md={6}>
            {candidates.slice(3, 6).map(renderCandidateCard)}
          </Grid>
        </Grid>

        <Box className="mt-12">
          <Button
            onClick={handleVote}
            variant="contained"
            size="large"
            startIcon={<HowToVote />}
            sx={{
              px: 10,
              py: 2.5,
              borderRadius: "5rem",
              fontSize: "1.4rem",
              fontWeight: "900",
              textTransform: "none",
              background: "linear-gradient(45deg, #1e1b4b, #4338ca)",
              boxShadow: "0 15px 30px -10px rgba(67, 56, 202, 0.6)",
              "&:hover": {
                background: "#1e1b4b",
                transform: "translateY(-2px)",
              },
              transition: "all 0.3s ease",
            }}
          >
            Confirm & Submit Vote
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}

export default Vote;
