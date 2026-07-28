import { useState, useMemo, useRef } from "react";
import { 
  useListPrinters, 
  useDeletePrinter, 
  useDeleteAllPrinters, 
  getListPrintersQueryKey, 
  getGetPrinterStatsQueryKey 
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Search, Download, Trash2, ShieldAlert } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Empty, EmptyMedia, EmptyTitle, EmptyDescription } from "@/components/ui/empty";
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
    const lowerSearch = search.toLowerCase();
    return printers.filter(p => 
      p.ai.toLowerCase().includes(lowerSearch) ||
      p.modelo.toLowerCase().includes(lowerSearch) ||
      (p.ubicacion && p.ubicacion.toLowerCase().includes(lowerSearch)) ||
      (p.descripcion && p.descripcion.toLowerCase().includes(lowerSearch))
    );
  }, [printers, search]);

  const handleDelete = (id: number) => {
    deleteFnRef.current(
      { id },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListPrintersQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetPrinterStatsQueryKey() });
          toast({
            title: "Registro eliminado",
            description: "La impresora ha sido eliminada de la bitácora.",
          });
        },
      }
    );
  };

  const handleDeleteAll = () => {
    deleteAllFnRef.current(undefined, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListPrintersQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetPrinterStatsQueryKey() });
        toast({
          title: "Bitácora limpiada",
          description: "Todos los registros han sido eliminados.",
        });
      },
    });
  };

  const exportCSV = () => {
    if (!filteredPrinters.length) return;
    
    const headers = ["ID", "AI", "Modelo", "Estado", "Ubicación", "Descripción", "Fecha Registro"];
    const rows = filteredPrinters.map(p => [
      p.id, 
      p.ai, 
      p.modelo, 
      p.estado, 
      `"${p.ubicacion || ""}"`, 
      `"${p.descripcion || ""}"`, 
      format(new Date(p.createdAt), "dd/MM/yyyy HH:mm")
    ]);
    
    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `bitacora_impresoras_${format(new Date(), "yyyyMMdd_HHmm")}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case 'funciona':
        return <Badge className="bg-emerald-500/10 text-emerald-700 border-emerald-500/20 hover:bg-emerald-500/20 dark:text-emerald-400 font-medium">Funciona</Badge>;
      case 'parcial':
        return <Badge className="bg-amber-500/10 text-amber-700 border-amber-500/20 hover:bg-amber-500/20 dark:text-amber-400 font-medium">Parcial</Badge>;
      case 'falla':
        return <Badge className="bg-red-500/10 text-red-700 border-red-500/20 hover:bg-red-500/20 dark:text-red-400 font-medium">Falla</Badge>;
      default:
        return <Badge>{estado}</Badge>;
    }
  };

  return (
    <Card className="border-border/50 shadow-sm flex flex-col h-[calc(100vh-22rem)] min-h-[400px]">
      <CardHeader className="pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <CardTitle>Historial de Equipos</CardTitle>
            <CardDescription>Visualice y gestione los registros de la bitácora.</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar AI, modelo..."
                className="pl-9 w-full bg-background"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Button variant="outline" size="icon" onClick={exportCSV} disabled={!filteredPrinters.length} title="Exportar CSV">
              <Download className="h-4 w-4" />
            </Button>
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="icon" disabled={!printers?.length} title="Limpiar bitácora">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle className="flex items-center gap-2">
                    <ShieldAlert className="h-5 w-5 text-destructive" />
                    ¿Limpiar todos los registros?
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta acción eliminará todos los registros de prueba de impresoras de la base de datos de forma permanente.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction 
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    onClick={handleDeleteAll}
                  >
                    Sí, limpiar bitácora
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 p-0 overflow-hidden flex flex-col">
        <div className="flex-1 overflow-auto border-t">
          {isLoading ? (
            <div className="h-full w-full flex items-center justify-center p-8">
              <Spinner className="h-8 w-8 text-primary" />
            </div>
          ) : filteredPrinters.length === 0 ? (
            <div className="h-full w-full flex items-center justify-center p-8">
              <Empty className="border-none max-w-sm mx-auto p-0 md:p-0">
                <EmptyMedia variant="icon">
                  <Search className="h-5 w-5 text-muted-foreground" />
                </EmptyMedia>
                <EmptyTitle>Sin resultados</EmptyTitle>
                <EmptyDescription>
                  {search ? "No hay registros que coincidan con la búsqueda." : "La bitácora está vacía. Añade el primer equipo."}
                </EmptyDescription>
              </Empty>
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-muted/50 sticky top-0 z-10">
                <TableRow>
                  <TableHead className="w-[120px]">Código AI</TableHead>
                  <TableHead>Modelo</TableHead>
                  <TableHead className="w-[100px]">Estado</TableHead>
                  <TableHead>Ubicación</TableHead>
                  <TableHead>Descripción</TableHead>
                  <TableHead className="w-[150px]">Fecha</TableHead>
                  <TableHead className="w-[60px] text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPrinters.map((printer) => (
                  <TableRow key={printer.id} className="group">
                    <TableCell className="font-mono text-sm font-medium">{printer.ai}</TableCell>
                    <TableCell>{printer.modelo}</TableCell>
                    <TableCell>{getEstadoBadge(printer.estado)}</TableCell>
                    <TableCell className="text-muted-foreground">{printer.ubicacion || "—"}</TableCell>
                    <TableCell className="text-muted-foreground max-w-[200px] truncate" title={printer.descripcion || undefined}>
                      {printer.descripcion || "—"}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {format(new Date(printer.createdAt), "d MMM, yyyy HH:mm", { locale: es })}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => handleDelete(printer.id)}
                        disabled={deletePrinter.isPending}
                        title="Eliminar registro"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
