import { Router, type IRouter } from "express";
import healthRouter from "./health";
import printersRouter from "./printers";

const router: IRouter = Router();

router.use(healthRouter);
router.use(printersRouter);

export default router;
