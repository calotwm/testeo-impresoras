import { Router, type IRouter } from "express";
import healthRouter from "./health";
import printersRouter from "./printers";

const router: IRouter = Router();

router.use(healthRouter);
router.use(printersRouter);

// Catch-all for unmatched API routes — return JSON 404, not HTML
router.use((_req, res) => {
  res.status(404).json({ error: "Not found" });
});

export default router;
