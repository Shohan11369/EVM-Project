

import express from "express";
import { signupVoter, faceLogin, submitVote, getResults } from "../controllers/voterController.js";

const router = express.Router();

// VOTER ROUTES 
router.post("/register", signupVoter);
router.post("/face-login", faceLogin);
router.post("/vote", submitVote);
router.get("/results", getResults); //new

export default router;

