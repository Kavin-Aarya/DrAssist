import express from "express";
import cors from "cors";
import connectDB from "./config/db.js";
import UserRouter from "./routes/route.js";
import path from 'path';
import { fileURLToPath } from 'url';

import rateLimit from "express-rate-limit";
import slowDown from "express-slow-down";

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

const app  = express();
const port = 5001;

// 1. The "Speed Limiter": Gradually slows down users after 5 requests

// 2. The "Hard Cap": Blocks users completely after 100 requests
const hardLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute window
  max: 2000,                // Limit each IP to 100 requests per minute
  message: "Too many requests, please wait for the AI to finish processing.",
  standardHeaders: true,   
  legacyHeaders: false,
});

app.use(cors());
app.use(express.json());

// Apply limiters to the specific AI-heavy route before the router
app.use("/user/upload-voice", hardLimiter);

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use("/user", UserRouter);



connectDB();

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});