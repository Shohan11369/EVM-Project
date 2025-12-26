import express from "express";
import {
  signupVoter,
  faceLogin,
  submitVote,
  getResults,
  adminLogin 
} from "../controllers/voterController.js";

const router = express.Router();

// VOTER ROUTES
router.post("/register", signupVoter);
router.post("/face-login", faceLogin);
router.post("/vote", submitVote);
router.get("/results", getResults);

// ADMIN ROUTE 
router.post("/admin-login", adminLogin); 

export default router;