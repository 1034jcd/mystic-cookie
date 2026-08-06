import { Router, type IRouter } from "express";
import healthRouter from "./health";
import fortuneRouter from "./fortune";
import stripeRouter from "./stripe";

const router: IRouter = Router();

router.use(healthRouter);
router.use(fortuneRouter);
router.use(stripeRouter);

export default router;
