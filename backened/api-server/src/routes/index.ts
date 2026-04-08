import { Router, type IRouter } from "express";
import healthRouter from "./health";
import adminRouter from "./admin";
import productsRouter from "./products";
import reviewsRouter from "./reviews";
import galleryRouter from "./gallery";
import statsRouter from "./stats";

const router: IRouter = Router();

router.use(healthRouter);
router.use(adminRouter);
router.use(productsRouter);
router.use(reviewsRouter);
router.use(galleryRouter);
router.use(statsRouter);

export default router;
