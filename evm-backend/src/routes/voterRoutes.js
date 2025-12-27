import express from "express";
import {
  signupVoter,
  faceLogin,
  submitVote,
  getResults,
  adminLogin,
  getAllVoters,
} from "../controllers/voterController.js";

const router = express.Router();

router.post("/register", signupVoter);
router.post("/face-login", faceLogin);
router.post("/vote", submitVote);
router.get("/results", getResults);
router.get("/all", getAllVoters); // Voter List Route
router.post("/admin-login", adminLogin);

export default router;
