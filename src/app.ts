// backend/src/app.ts
import express from "express";
import cors from "cors";
import campaignRoutes from "./routes/campaignRoutes";
import messageRoutes from "./routes/message.route";
import leadsRoutes from "./routes/leads";

const app = express();

app.use(cors({
  origin: ["http://localhost:5173", "https://your-frontend-domain.vercel.app"],
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"]
}));
app.use(express.json());

app.get("/", (req, res) => {
  res.send("🚀 API is running!");
});
app.use("/campaigns", campaignRoutes);
app.use("/api", messageRoutes);
app.use("/leads", leadsRoutes);

export default app;
