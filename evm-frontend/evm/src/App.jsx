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
import VoterList from "./components/VoterList";
import Home from "./components/Home";
import AdminLogin from "./components/AdminLogin";

const ProtectedRoute = ({ children }) => {
  const isAdminLoggedIn = localStorage.getItem("adminToken") === "isLoggedIn";

  if (!isAdminLoggedIn) {
    return <Navigate to="/admin-login" replace />;
  }
  return children;
};

function App() {
  const [voterData, setVoterData] = useState(null);

  return (
    <Router>
      <Routes>
        {/* public user */}
        <Route path="/" element={<Home />} />
        <Route
          path="/login"
          element={
            <FaceLogin onLoginSuccess={(voter) => setVoterData(voter)} />
          }
        />
        <Route
          path="/vote"
          element={
            voterData ? (
              <Vote voterData={voterData} />
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        <Route path="/admin-login" element={<AdminLogin />} />

        {/* admin panel secure */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="register" element={<Signup />} />
          <Route path="voters" element={<VoterList />} />
        </Route>

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
