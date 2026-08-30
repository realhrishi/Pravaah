import { Router } from "express";
import {
  getVillage,
  getVillageRisk,
  getVillageRiskHistory,
  getVillageExplain,
} from "../controllers/village.controller";
import { getNearestShelterRoute } from "../controllers/shelter.controller";


const router = Router();

router.get("/:id", getVillage);
router.get("/:id/risk", getVillageRisk);
router.get("/:id/risk/history", getVillageRiskHistory);
router.get("/:id/explain", getVillageExplain);
router.get("/:id/nearest-shelter", getNearestShelterRoute)
export default router;