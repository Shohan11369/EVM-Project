import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Signup from "./components/Signup";
import FaceLogin from "./components/FaceLogin";
import Vote from "./components/Vote";
import AdminDashboard from "./components/AdminDashboard";
import AdminLayout from "./components/AdminLayout";
import VoterList from "./components/VoterList.jsx"; // VoterList কম্পোনেন্টটি ইম্পোর্ট করুন
import Home from "./components/Home"; 

function App() {
  const [voterData, setVoterData] = useState(null); 

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route
          path="/login"
          element={<FaceLogin onLoginSuccess={(voter) => setVoterData(voter)} />}
        />
        <Route
          path="/vote"
          element={
            voterData ? <Vote voterData={voterData} /> : <Navigate to="/login" />
          }
        />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="dashboard" />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="register" element={<Signup />} />
          <Route path="voters" element={<VoterList />} /> {/* নতুন রাউট */}
        </Route>
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;