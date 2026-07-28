import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PrinterFormValues, printerFormSchema } from "@/lib/schemas";
import { useCreatePrinter, getListPrintersQueryKey, getGetPrinterStatsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Plus, Printer } from "lucide-react";
import { useRef } from "react";

interface PrinterFormProps {
  /** Called after a successful save — used on mobile to collapse the form */
  onSuccess?: () => void;
}

export function PrinterForm({ onSuccess }: PrinterFormProps = {}) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<PrinterFormValues>({
    resolver: zodResolver(printerFormSchema),
    defaultValues: {
      ai: "",
      modelo: "",
      estado: "funciona",
      ubicacion: "",
      descripcion: "",
    },
  });

  const createPrinter = useCreatePrinter();
  const mutateRef = useRef(createPrinter.mutate);
  mutateRef.current = createPrinter.mutate;

  const onSubmit = (data: PrinterFormValues) => {
    mutateRef.current(
      { data },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListPrintersQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetPrinterStatsQueryKey() });
          toast({ title: "Registro añadido" });
          form.reset();
          onSuccess?.();
          const firstInput = document.querySelector('input[name="ai"]') as HTMLInputElement;
          firstInput?.focus();
        },
        onError: () => {
          toast({
            title: "Error",
            description: "No se pudo guardar el registro. Intente nuevamente.",
            variant: "destructive",
          });
        },
      }
    );
  };

  return (
    <Card className="border-border/50 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Printer className="w-4 h-4" />
          Nuevo Registro
        </CardTitle>
        <CardDescription className="text-xs">
          Completá los datos de la impresora testeada.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
            {/* AI + Model side by side on sm+ */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="ai"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">Código AI</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ej. IMP-001"
                        className="font-mono h-9 text-sm"
                        data-testid="input-ai"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="modelo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">Modelo</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ej. HP LaserJet"
                        className="h-9 text-sm"
                        data-testid="input-modelo"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="estado"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs">Estado</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="h-9 text-sm" data-testid="select-estado">
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
              control={form.control}
              name="ubicacion"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs">Ubicación (Opcional)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ej. Oficina 302"
                      className="h-9 text-sm"
                      data-testid="input-ubicacion"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="descripcion"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs">Descripción (Opcional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Detalles sobre el estado o falla..."
                      className="resize-none h-16 text-sm"
                      data-testid="input-descripcion"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full h-10 text-sm"
              disabled={createPrinter.isPending}
              data-testid="button-submit"
            >
              <Plus className="w-4 h-4 mr-2" />
              {createPrinter.isPending ? "Guardando..." : "Guardar Registro"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
