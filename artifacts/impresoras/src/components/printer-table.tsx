import { useState, useMemo, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as XLSX from "xlsx";
import {
  useListPrinters,
  useDeletePrinter,
  useUpdatePrinter,
  getListPrintersQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { printerFormSchema, type PrinterFormValues } from "@/lib/schemas";
import {
  Search,
  Download,
  FileSpreadsheet,
  MapPin,
  FileText,
  Calendar,
  Printer,
  Pencil,
  Trash2,
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Spinner } from "@/components/ui/spinner";

function estadoLabel(estado: string): string {
  switch (estado) {
    case "funciona": return "Funciona";
    case "parcial":  return "Parcial";
    case "falla":    return "Falla";
    default:         return estado;
  }
}

function EstadoBadge({ estado }: { estado: string }) {
  switch (estado) {
    case "funciona":
      return (
        <Badge className="bg-emerald-500/10 text-emerald-700 border-emerald-500/20 hover:bg-emerald-500/20 dark:text-emerald-400 font-medium text-xs">
          Funciona
        </Badge>
      );
    case "parcial":
      return (
        <Badge className="bg-amber-500/10 text-amber-700 border-amber-500/20 hover:bg-amber-500/20 dark:text-amber-400 font-medium text-xs">
          Parcial
        </Badge>
      );
    case "falla":
      return (
        <Badge className="bg-red-500/10 text-red-700 border-red-500/20 hover:bg-red-500/20 dark:text-red-400 font-medium text-xs">
          Falla
        </Badge>
      );
    default:
      return <Badge className="text-xs">{estado}</Badge>;
  }
}

function estadoAccent(estado: string) {
  switch (estado) {
    case "funciona": return "border-l-emerald-500";
    case "parcial":  return "border-l-amber-500";
    case "falla":    return "border-l-red-500";
    default:         return "border-l-border";
  }
}

export function PrinterTable() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [editingPrinter, setEditingPrinter] = useState<PrinterFormValues & { id: number } | null>(null);

  const { data: printers, isLoading } = useListPrinters();
  const deletePrinter = useDeletePrinter();
  const updatePrinter = useUpdatePrinter();

  const deleteFnRef = useRef(deletePrinter.mutate);
  deleteFnRef.current = deletePrinter.mutate;

  const editForm = useForm<PrinterFormValues>({
    resolver: zodResolver(printerFormSchema),
    values: editingPrinter
      ? {
          ai: editingPrinter.ai,
          modelo: editingPrinter.modelo,
          estado: editingPrinter.estado,
          ubicacion: editingPrinter.ubicacion ?? "",
          descripcion: editingPrinter.descripcion ?? "",
        }
      : undefined,
  });

  const filteredPrinters = useMemo(() => {
    if (!printers) return [];
    if (!search.trim()) return printers;
    const q = search.toLowerCase();
    return printers.filter(
      (p) =>
        p.ai.toLowerCase().includes(q) ||
        p.modelo.toLowerCase().includes(q) ||
        (p.ubicacion && p.ubicacion.toLowerCase().includes(q)) ||
        (p.descripcion && p.descripcion.toLowerCase().includes(q)),
    );
  }, [printers, search]);

  const handleDelete = (id: number) => {
    deleteFnRef.current(
      { id },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListPrintersQueryKey() });
          toast({ title: "Registro eliminado" });
        },
      },
    );
  };

  const handleEdit = (data: PrinterFormValues) => {
    if (!editingPrinter) return;
    updatePrinter.mutate(
      { id: editingPrinter.id, data },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListPrintersQueryKey() });
          setEditingPrinter(null);
          toast({ title: "Registro actualizado" });
        },
        onError: () => {
          toast({
            title: "Error",
            description: "No se pudo actualizar el registro.",
            variant: "destructive",
          });
        },
      },
    );
  };

  const openEdit = (printer: NonNullable<typeof printers>[number]) => {
    setEditingPrinter({
      id: printer.id,
      ai: printer.ai,
      modelo: printer.modelo,
      estado: printer.estado,
      ubicacion: printer.ubicacion ?? "",
      descripcion: printer.descripcion ?? "",
    });
  };

  const exportXLSX = () => {
    if (!filteredPrinters.length) return;

    // Build data rows for the main sheet
    const data = filteredPrinters.map((p) => ({
      ID: p.id,
      AI: p.ai,
      Modelo: p.modelo,
      Estado: estadoLabel(p.estado),
      Ubicación: p.ubicacion ?? "",
      Descripción: p.descripcion ?? "",
      Fecha: format(new Date(p.createdAt), "dd/MM/yyyy HH:mm"),
    }));

    // Count by estado for a summary table
    const counts: Record<string, number> = {};
    for (const p of filteredPrinters) {
      const label = estadoLabel(p.estado);
      counts[label] = (counts[label] || 0) + 1;
    }
    const summary = Object.entries(counts).map(([Estado, Cantidad]) => ({
      Estado,
      Cantidad,
    }));
    summary.push({ Estado: "Total", Cantidad: filteredPrinters.length });

    // Create workbook with two sheets
    const wb = XLSX.utils.book_new();

    // Sheet 1: Detailed log
    const ws1 = XLSX.utils.json_to_sheet(data);
    XLSX.utils.sheet_add_aoa(ws1, [["ID", "AI", "Modelo", "Estado", "Ubicación", "Descripción", "Fecha"]], { origin: "A1" });
    // Auto-fit column widths
    const colWidths = [
      { wch: 6 },  // ID
      { wch: 14 }, // AI
      { wch: 24 }, // Modelo
      { wch: 14 }, // Estado
      { wch: 24 }, // Ubicación
      { wch: 36 }, // Descripción
      { wch: 18 }, // Fecha
    ];
    ws1["!cols"] = colWidths;
    XLSX.utils.book_append_sheet(wb, ws1, "Bitácora");

    // Sheet 2: Summary counts
    const ws2 = XLSX.utils.json_to_sheet(summary);
    ws2["!cols"] = [{ wch: 14 }, { wch: 12 }];
    XLSX.utils.book_append_sheet(wb, ws2, "Resumen");

    // Generate and download
    const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const blob = new Blob([wbout], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `bitacora_impresoras_${format(new Date(), "yyyyMMdd_HHmm")}.xlsx`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  return (
    <Card className="border-border/50 shadow-sm">
      {/* Header */}
      <CardHeader className="pb-3 space-y-3">
        {/* Row 1: title + action buttons */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <CardTitle className="text-base">Historial de Equipos</CardTitle>
            <CardDescription className="text-xs mt-0.5">
              {printers?.length ?? 0} registro{printers?.length !== 1 ? "s" : ""}
            </CardDescription>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <Button
              variant="outline"
              size="sm"
              className="h-8 gap-1.5 text-xs"
              onClick={exportXLSX}
              disabled={!filteredPrinters.length}
              title="Descargar XLSX"
              data-testid="button-export-xlsx"
            >
              <FileSpreadsheet className="h-4 w-4" />
              <span className="hidden sm:inline">XLSX</span>
            </Button>
          </div>
        </div>

        {/* Row 2: search — full width */}
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            data-testid="input-search"
            placeholder="Buscar AI, modelo, ubicación..."
            className="pl-9 bg-background w-full"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </CardHeader>

      {/* List */}
      <CardContent className="p-0">
        {isLoading ? (
          <div className="flex items-center justify-center py-14">
            <Spinner className="h-7 w-7 text-primary" />
          </div>
        ) : filteredPrinters.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-14 text-muted-foreground gap-2 px-4 text-center">
            <Printer className="h-9 w-9 opacity-25" />
            <p className="text-sm">
              {search
                ? "Sin resultados para esa búsqueda."
                : "La bitácora está vacía. Agregá el primer equipo."}
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-border/50">
            {filteredPrinters.map((printer) => (
              <li
                key={printer.id}
                data-testid={`row-printer-${printer.id}`}
                className={`group flex items-start gap-3 px-4 py-3.5 hover:bg-muted/40 active:bg-muted/60 transition-colors border-l-4 ${estadoAccent(printer.estado)}`}
              >
                {/* Main info */}
                <div className="flex-1 min-w-0 space-y-1.5">
                  {/* Line 1: AI code + model */}
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <span
                      data-testid={`text-ai-${printer.id}`}
                      className="font-mono text-sm font-semibold text-foreground"
                    >
                      {printer.ai}
                    </span>
                    <span className="text-sm text-muted-foreground truncate">{printer.modelo}</span>
                  </div>
                  {/* Line 2: estado badge + meta */}
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    <EstadoBadge estado={printer.estado} />
                    {printer.ubicacion && (
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <MapPin className="h-3 w-3 shrink-0" />
                        <span className="truncate max-w-[140px]">{printer.ubicacion}</span>
                      </span>
                    )}
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3 shrink-0" />
                      {format(new Date(printer.createdAt), "d MMM, HH:mm", { locale: es })}
                    </span>
                  </div>
                  {/* Line 3: description (only if present) */}
                  {printer.descripcion && (
                    <p className="flex items-start gap-1 text-xs text-muted-foreground leading-snug">
                      <FileText className="h-3 w-3 shrink-0 mt-0.5" />
                      <span className="line-clamp-2">{printer.descripcion}</span>
                    </p>
                  )}
                </div>

                {/* Edit + Delete */}
                <div className="flex items-center gap-0.5 shrink-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-primary shrink-0 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
                    onClick={() => openEdit(printer)}
                    disabled={updatePrinter.isPending}
                    title="Editar registro"
                    data-testid={`button-edit-${printer.id}`}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive shrink-0 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
                    onClick={() => handleDelete(printer.id)}
                    disabled={deletePrinter.isPending}
                    title="Eliminar registro"
                    data-testid={`button-delete-${printer.id}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>

      {/* Edit Dialog */}
      <Dialog
        open={!!editingPrinter}
        onOpenChange={(o) => {
          if (!o) {
            setEditingPrinter(null);
            editForm.reset();
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Registro</DialogTitle>
            <DialogDescription>Modificá los datos del equipo.</DialogDescription>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(handleEdit)} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <FormField
                  control={editForm.control}
                  name="ai"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Código AI</FormLabel>
                      <FormControl>
                        <Input placeholder="Ej. IMP-001" className="font-mono h-9 text-sm" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="modelo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Modelo</FormLabel>
                      <FormControl>
                        <Input placeholder="Ej. HP LaserJet" className="h-9 text-sm" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={editForm.control}
                name="estado"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">Estado</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-9 text-sm">
                          <SelectValue placeholder="Seleccione el estado" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="funciona">Funciona</SelectItem>
                        <SelectItem value="parcial">Parcial</SelectItem>
                        <SelectItem value="falla">Falla</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={editForm.control}
                name="ubicacion"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">Ubicación (Opcional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej. Oficina 302" className="h-9 text-sm" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={editForm.control}
                name="descripcion"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">Descripción (Opcional)</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Detalles sobre el estado o falla..." className="resize-none h-16 text-sm" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setEditingPrinter(null);
                    editForm.reset();
                  }}
                >
                  Cancelar
                </Button>
                <Button type="submit" size="sm" disabled={updatePrinter.isPending}>
                  {updatePrinter.isPending ? "Guardando..." : "Guardar cambios"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
