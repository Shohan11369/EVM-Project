import React, { useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Signup from "./components/Signup";
import FaceLogin from "./components/FaceLogin";
import Vote from "./components/Vote";
import AdminDashboard from "./components/AdminDashboard";
import AdminLayout from "./components/AdminLayout";
import Home from "./components/Home"; 

function App() {
  const [voterId, setVoterId] = useState(null);

  return (
    <Router>
      <Routes>
        
        <Route path="/" element={<Home />} />

        {/* Voter */}
        <Route
          path="/login"
          element={<FaceLogin onLoginSuccess={(id) => setVoterId(id)} />}
        />
        <Route
          path="/vote"
          element={
            voterId ? <Vote voterId={voterId} /> : <Navigate to="/login" />
          }
        />

        {/* Admin panel*/}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="dashboard" />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="register" element={<Signup />} />
        </Route>

        
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
