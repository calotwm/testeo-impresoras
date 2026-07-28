import { useState, useMemo, useRef } from "react";
import {
  useListPrinters,
  useDeletePrinter,
  useDeleteAllPrinters,
  getListPrintersQueryKey,
  getGetPrinterStatsQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import {
  Search,
  Download,
  Trash2,
  ShieldAlert,
  MapPin,
  FileText,
  Calendar,
  Printer,
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Spinner } from "@/components/ui/spinner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

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

  const { data: printers, isLoading } = useListPrinters();
  const deletePrinter = useDeletePrinter();
  const deleteAllPrinters = useDeleteAllPrinters();

  const deleteFnRef = useRef(deletePrinter.mutate);
  deleteFnRef.current = deletePrinter.mutate;
  const deleteAllFnRef = useRef(deleteAllPrinters.mutate);
  deleteAllFnRef.current = deleteAllPrinters.mutate;

  const filteredPrinters = useMemo(() => {
    if (!printers) return [];
    if (!search.trim()) return printers;
    const q = search.toLowerCase();
    return printers.filter(
      (p) =>
        p.ai.toLowerCase().includes(q) ||
        p.modelo.toLowerCase().includes(q) ||
        (p.ubicacion && p.ubicacion.toLowerCase().includes(q)) ||
        (p.descripcion && p.descripcion.toLowerCase().includes(q))
    );
  }, [printers, search]);

  const handleDelete = (id: number) => {
    deleteFnRef.current({ id }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListPrintersQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetPrinterStatsQueryKey() });
        toast({ title: "Registro eliminado" });
      },
    });
  };

  const handleDeleteAll = () => {
    deleteAllFnRef.current(undefined, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListPrintersQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetPrinterStatsQueryKey() });
        toast({ title: "Bitácora limpiada", description: "Todos los registros eliminados." });
      },
    });
  };

  const exportCSV = () => {
    if (!filteredPrinters.length) return;
    const headers = ["ID", "AI", "Modelo", "Estado", "Ubicación", "Descripción", "Fecha"];
    const rows = filteredPrinters.map((p) => [
      p.id, p.ai, p.modelo, p.estado,
      `"${p.ubicacion || ""}"`,
      `"${(p.descripcion || "").replace(/"/g, '""')}"`,
      format(new Date(p.createdAt), "dd/MM/yyyy HH:mm"),
    ]);
    const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `bitacora_impresoras_${format(new Date(), "yyyyMMdd_HHmm")}.csv`;
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
              size="icon"
              className="h-8 w-8"
              onClick={exportCSV}
              disabled={!filteredPrinters.length}
              title="Exportar CSV"
              data-testid="button-export-csv"
            >
              <Download className="h-4 w-4" />
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="destructive"
                  size="icon"
                  className="h-8 w-8"
                  disabled={!printers?.length}
                  title="Limpiar bitácora"
                  data-testid="button-clear-all"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="max-w-sm mx-4">
                <AlertDialogHeader>
                  <AlertDialogTitle className="flex items-center gap-2">
                    <ShieldAlert className="h-5 w-5 text-destructive" />
                    ¿Limpiar todos los registros?
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta acción eliminará todos los registros de forma permanente.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    onClick={handleDeleteAll}
                  >
                    Sí, limpiar
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
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

                {/* Delete — always visible on mobile (no hover needed) */}
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
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
