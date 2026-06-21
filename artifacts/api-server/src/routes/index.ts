import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import usersRouter from "./users";
import servicesRouter from "./services";
import missionsRouter from "./missions";
import applicationsRouter from "./applications";
import messagesRouter from "./messages";
import reviewsRouter from "./reviews";
import dashboardRouter from "./dashboard";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(usersRouter);
router.use(servicesRouter);
router.use(missionsRouter);
router.use(applicationsRouter);
router.use(messagesRouter);
router.use(reviewsRouter);
router.use(dashboardRouter);

export default router;
