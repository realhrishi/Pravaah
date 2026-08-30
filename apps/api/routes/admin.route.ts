import { Router } from "express";
import {
  createAuthority,
  createSensor,
  createShelter,
  listAuthorities,
} from "../controllers/admin.controller";
import { validate } from "../middlewares/validate.middleware";
import { authenticate, requireRole } from "../middlewares/auth.middleware";
import {
  createAuthoritySchema,
  createSensorSchema,
  createShelterSchema,
} from "../validators/admin.schema";

const router = Router();

// every route in this file requires ADMIN — applied once, not per-route
router.use(authenticate, requireRole("ADMIN"));

router.post("/authorities", validate(createAuthoritySchema), createAuthority);
router.get("/authorities", listAuthorities);
router.post("/sensors", validate(createSensorSchema), createSensor);
router.post("/shelters", validate(createShelterSchema), createShelter);

export default router;