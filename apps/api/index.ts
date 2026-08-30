import dotenv from "dotenv";
dotenv.config();
import express, { type NextFunction } from "express";
import type { Request, Response } from "express";
import cors from "cors";
import {createServer} from "http";

import { checkHealth } from "./controllers/health.controller";
import sensorRouter from "./routes/sensor.route";
import authRouter from "./routes/auth.route";
import watershedRouter from "./routes/watershed.route";
import villageRouter from "./routes/village.route";
import riskRouter from "./routes/risk.route";
import alertRouter from "./routes/alert.route";
import adminRouter from "./routes/admin.route";
import subscriberRouter from "./routes/subscriber.routes";

import { initSocket } from "./socket";

const app = express();
const PORT = process.env.PORT || 4000;

const httpServer = createServer(app);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.get("/health", checkHealth);
app.use("/api/auth", authRouter);
app.use("/api/watersheds", watershedRouter);
app.use("/api/villages", villageRouter);
app.use("/api/risk", riskRouter);
app.use("/api/sensors", sensorRouter);
app.use("/api/alerts", alertRouter);
app.use("/api/admin", adminRouter);
app.use("/api/subscribers", subscriberRouter);

app.use((err :any , req :Request, res:Response, next:NextFunction) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: err.message || "Internal server error",
  });
});

initSocket(httpServer);

httpServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});