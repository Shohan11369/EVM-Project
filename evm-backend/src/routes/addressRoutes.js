import express from "express";
import { getAllAddresses } from "../controllers/addressController.js";

const router = express.Router();
router.get("/address-data", getAllAddresses);

export default router;