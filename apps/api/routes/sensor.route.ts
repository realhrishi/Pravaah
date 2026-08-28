import { Router } from "express";
import { listSensors, getSensor, ingestController } from "../controllers/sensor.controller";

const router = Router();

router.get("/", listSensors);
router.get("/:id", getSensor);
router.post("/:id/ingest", ingestController);

export default router;