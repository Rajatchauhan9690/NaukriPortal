import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./utils/db.js";
import userRoute from "./routes/user.route.js";
import companyRoute from "./routes/company.route.js";
import jobRoute from "./routes/job.route.js";
import applicationRoute from "./routes/application.route.js";

dotenv.config({});

const app = express();

// middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// CORS configuration with multiple origins
const corsOptions = {
  origin: [
    "http://localhost:5173",
    "https://job-portal-eight-psi-46.vercel.app",
    "https://job-portal-git-main-rajats-projects-149ec79a.vercel.app",
    "https://job-portal-ertt361hc-rajats-projects-149ec79a.vercel.app",
  ],
  credentials: true,
};

app.use(cors(corsOptions));

const PORT = process.env.PORT || 3000;

// api's
app.get("/", (req, res) => {
  res.send("Backend is running");
});
app.use("/api/v1/user", userRoute);
app.use("/api/v1/company", companyRoute);
app.use("/api/v1/job", jobRoute);
app.use("/api/v1/application", applicationRoute);

app.listen(PORT, () => {
  connectDB();
  console.log(`Server running at port ${PORT}`);
});
