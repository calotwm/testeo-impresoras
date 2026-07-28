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

export function PrinterForm() {
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
          toast({
            title: "Registro añadido",
            description: "El estado de la impresora se ha guardado correctamente.",
          });
          form.reset();
          // Focus back on the first input
          const firstInput = document.querySelector('input[name="ai"]') as HTMLInputElement;
          if (firstInput) firstInput.focus();
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
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Printer className="w-5 h-5" />
          Nuevo Registro
        </CardTitle>
        <CardDescription>
          Ingrese los detalles del equipo a registrar en la bitácora.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="ai"
                render={({ field }) => (
                  <FormItem className="col-span-2 sm:col-span-1">
                    <FormLabel>Código AI</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej. IMP-001" className="font-mono" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="modelo"
                render={({ field }) => (
                  <FormItem className="col-span-2 sm:col-span-1">
                    <FormLabel>Modelo</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej. HP LaserJet" {...field} />
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
                  <FormLabel>Estado del Equipo</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
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
                  <FormLabel>Ubicación (Opcional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej. Oficina 302" {...field} />
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
                  <FormLabel>Notas / Descripción (Opcional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Detalles sobre fallas o componentes faltantes..." 
                      className="resize-none h-20"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button 
              type="submit" 
              className="w-full"
              disabled={createPrinter.isPending}
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
