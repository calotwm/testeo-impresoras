import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import path from "node:path";
import { existsSync } from "node:fs";
import router from "./routes";
import { logger } from "./lib/logger";

const app: Express = express();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", router);

const publicDir = path.resolve(import.meta.dirname, "../../impresoras/dist/public");
const indexPath = path.join(publicDir, "index.html");

if (existsSync(indexPath)) {
  app.use(express.static(publicDir, { index: false }));

  app.use((req, res, next) => {
    if (
      (req.method !== "GET" && req.method !== "HEAD") ||
      req.path.startsWith("/api") ||
      req.path.startsWith("/ws") ||
      path.extname(req.path) !== ""
    ) {
      return next();
    }
    res.sendFile(indexPath, { headers: { "Cache-Control": "no-cache" } });
  });
}

// Global 404 handler — return JSON, not HTML
app.use((_req, res) => {
  res.status(404).json({ error: "Not found" });
});

export default app;
