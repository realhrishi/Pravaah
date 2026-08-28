import { Router } from "express";
import { simulateRisk, simulateSchema } from "../controllers/risk.controller";
import { validate } from "../middlewares/validate.middleware";
import { authenticate, requireRole } from "../middlewares/auth.middleware";

const router = Router();

router.post(
  "/simulate",
  authenticate,
  requireRole("AUTHORITY", "ADMIN"),
  validate(simulateSchema),
  simulateRisk,
);

export default router;