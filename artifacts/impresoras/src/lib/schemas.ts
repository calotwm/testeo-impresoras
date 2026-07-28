import { z } from "zod";
import { PrinterInputEstado } from "@workspace/api-client-react";

export const printerFormSchema = z.object({
  ai: z.string().min(1, "El código de Activo Informático (AI) es requerido"),
  modelo: z.string().min(1, "El modelo de la impresora es requerido"),
  estado: z.nativeEnum(PrinterInputEstado, {
    errorMap: () => ({ message: "Seleccione un estado válido" }),
  }),
  ubicacion: z.string().optional(),
  descripcion: z.string().optional(),
});

export type PrinterFormValues = z.infer<typeof printerFormSchema>;
