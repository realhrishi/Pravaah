import dotenv from "dotenv";
dotenv.config();
import express from "express";
import { checkHealth } from "./controllers/health.controller";

const app = express();
const PORT = process.env.PORT || 4000;


app.get("/health", checkHealth);


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});