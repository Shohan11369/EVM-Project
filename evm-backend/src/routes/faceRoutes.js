import express from "express";
import { faceLogin } from "../controllers/faceController.js";

const router = express.Router();

router.post("/login", faceLogin);

export default router;
