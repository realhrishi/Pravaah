import { Router } from "express";
import {
  getVillage,
  getVillageRisk,
  getVillageRiskHistory,
  getVillageExplain,
} from "../controllers/village.controller";

const router = Router();

router.get("/:id", getVillage);
router.get("/:id/risk", getVillageRisk);
router.get("/:id/risk/history", getVillageRiskHistory);
router.get("/:id/explain", getVillageExplain);

export default router;