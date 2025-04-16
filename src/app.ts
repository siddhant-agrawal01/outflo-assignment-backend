// backend/src/app.ts
import express from "express";
import cors from "cors";
import campaignRoutes from "./routes/campaignRoutes";
import messageRoutes from './routes/message.route';
import leadsRoutes from './routes/leads';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Health check route
app.get("/", (req, res) => {
  res.send("🚀 API is running!");
});
app.use("/campaigns", campaignRoutes);
app.use('/api', messageRoutes);
app.use('/leads', leadsRoutes);

export default app;
