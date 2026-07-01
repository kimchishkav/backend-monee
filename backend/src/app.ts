import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth";
import profileRoutes from "./routes/profile";
import accountRoutes from "./routes/accounts";
import transactionRoutes from "./routes/transactions";
import dashboardRoutes from "./routes/dashboard";
import statisticsRoutes from "./routes/statistics";

const app = express();

app.use(cors({
  origin: process.env.CORS_ALLOWED_ORIGINS?.split(",") ?? "*",
  credentials: true,
}));
app.use(express.json({ limit: "10mb" })); // large limit for base64 avatars

app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/accounts", accountRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/statistics", statisticsRoutes);

app.get("/api/health", (_req, res) => res.json({ status: "ok" }));

export default app;
