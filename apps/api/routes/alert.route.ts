import { Router } from "express";
import {
  getAlerts,
  getAlert,
  acknowledgeAlert,
  dispatchAlert,
} from "../controllers/alert.controller";

import { authenticate, requireRole } from "../middlewares/auth.middleware";

const router = Router();

router.get("/", getAlerts);
router.get("/:id", getAlert);
router.post("/:id/acknowledge", authenticate, requireRole("AUTHORITY", "ADMIN"), acknowledgeAlert);
router.post("/:id/dispatch", authenticate, requireRole("AUTHORITY", "ADMIN"), dispatchAlert);

export default router;