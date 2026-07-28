import { Router, type IRouter } from "express";
import { desc, eq, count } from "drizzle-orm";
import { db, printersTable } from "@workspace/db";
import {
  CreatePrinterBody,
  ListPrintersResponse,
  CreatePrinterResponse,
  GetPrinterStatsResponse,
  DeletePrinterParams,
} from "@workspace/api-zod";
import { broadcast } from "../lib/ws";

const router: IRouter = Router();

/** Serialize a record for JSON — createdAt comes from Drizzle as Date */
function serialize(r: Record<string, unknown>) {
  return {
    ...r,
    createdAt:
      r.createdAt instanceof Date
        ? r.createdAt.toISOString()
        : r.createdAt,
  };
}

router.get("/printers", async (_req, res): Promise<void> => {
  const records = await db
    .select()
    .from(printersTable)
    .orderBy(desc(printersTable.createdAt));
  res.json(ListPrintersResponse.parse(records.map(serialize)));
});

router.post("/printers", async (req, res): Promise<void> => {
  const parsed = CreatePrinterBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const now = new Date();
  const fecha =
    now.toLocaleDateString("es-AR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }) +
    " " +
    now.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" });

  const [record] = await db
    .insert(printersTable)
    .values({ ...parsed.data, fecha })
    .returning();

  broadcast({ type: "created", id: record.id });
  res.status(201).json(CreatePrinterResponse.parse(serialize(record)));
});

router.delete("/printers/all", async (_req, res): Promise<void> => {
  await db.delete(printersTable);
  broadcast({ type: "cleared" });
  res.sendStatus(204);
});

router.get("/printers/stats", async (_req, res): Promise<void> => {
  const rows = await db
    .select({
      estado: printersTable.estado,
      cnt: count(),
    })
    .from(printersTable)
    .groupBy(printersTable.estado);

  const stats = { total: 0, funciona: 0, falla: 0, parcial: 0 };
  for (const row of rows) {
    const n = Number(row.cnt);
    stats.total += n;
    if (row.estado === "funciona") stats.funciona = n;
    else if (row.estado === "falla") stats.falla = n;
    else if (row.estado === "parcial") stats.parcial = n;
  }

  res.json(GetPrinterStatsResponse.parse(stats));
});

router.delete("/printers", async (_req, res): Promise<void> => {
  await db.delete(printersTable);
  broadcast({ type: "cleared" });
  res.sendStatus(204);
});

router.delete("/printers/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const parsed = DeletePrinterParams.safeParse({ id: raw });
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [deleted] = await db
    .delete(printersTable)
    .where(eq(printersTable.id, parsed.data.id))
    .returning();

  if (!deleted) {
    res.status(404).json({ error: "Not found" });
    return;
  }

  broadcast({ type: "deleted", id: parsed.data.id });
  res.sendStatus(204);
});

export default router;
