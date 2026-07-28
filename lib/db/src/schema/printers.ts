import { pgTable, text, serial, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const printersTable = pgTable("printers", {
  id: serial("id").primaryKey(),
  ai: text("ai").notNull(),
  modelo: text("modelo").notNull(),
  estado: text("estado").notNull(), // 'funciona' | 'falla' | 'parcial'
  ubicacion: text("ubicacion"),
  descripcion: text("descripcion"),
  fecha: text("fecha").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertPrinterSchema = createInsertSchema(printersTable).omit({
  id: true,
  createdAt: true,
});
export type InsertPrinter = z.infer<typeof insertPrinterSchema>;
export type Printer = typeof printersTable.$inferSelect;
