// apps/api/src/routes/subscriber.routes.ts
import { Router } from "express";
import { subscribe, unsubscribe } from "../controllers/subscriber.controller";
import { validate } from "../middlewares/validate.middleware";
import { subscribeSchema } from "../validators/subscriber.schema";

const router = Router();

router.post("/", validate(subscribeSchema), subscribe);
router.delete("/", unsubscribe); // no schema needed, both fields required by delete query itself

export default router;