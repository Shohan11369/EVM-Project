import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./src/config/db.js";
import voterRoutes from "./src/routes/voterRoutes.js";
import addressRoutes from "./src/routes/addressRoutes.js"; // ১. নতুন ইম্পোর্ট

dotenv.config();
connectDB();

const app = express();
app.use(cors());

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

app.use("/api/voter", voterRoutes);
app.use("/api", addressRoutes); // ২. নতুন রাউট যোগ করা হলো

const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);