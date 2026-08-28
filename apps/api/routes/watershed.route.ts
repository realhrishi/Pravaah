import { Router } from "express";
import { getWatersheds, getWatershed, getWatershedVillages } from "../controllers/watershed.controller";

const router = Router();

router.get("/", getWatersheds);
router.get("/:id", getWatershed);
router.get("/:id/villages", getWatershedVillages);

export default router;