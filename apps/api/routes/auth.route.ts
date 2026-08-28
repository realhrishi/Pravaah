import { Router } from "express";
import { login, me } from "../controllers/auth.controller";
import { validate } from "../middlewares/validate.middleware";
import { authenticate } from "../middlewares/auth.middleware";
import { loginSchema } from "../validators/auth.schema";

const router = Router();

router.post("/login", validate(loginSchema), login);
router.get("/me", authenticate, me);

export default router;