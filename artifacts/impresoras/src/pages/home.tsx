import { useState } from "react";
import { Printer, ChevronDown, ChevronUp } from "lucide-react";
import { PrinterForm } from "@/components/printer-form";
import { PrinterTable } from "@/components/printer-table";
import { Button } from "@/components/ui/button";

export default function Home() {
  const [formOpen, setFormOpen] = useState(false);

  return (
    <div className="min-h-screen bg-muted/20">
      {/* Header */}
      <div className="bg-background border-b border-border/50 sticky top-0 z-20 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded bg-primary/10 flex items-center justify-center">
              <Printer className="w-4 h-4 text-primary" />
            </div>
            <h1 className="text-base font-bold tracking-tight text-foreground">
              Testeo de Impresoras
            </h1>
          </div>
          <span className="text-xs font-medium text-muted-foreground font-mono hidden sm:block">
            IT-LOG v1.0
          </span>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-4 py-4 sm:py-6 space-y-4">
        {/* On mobile: collapsible form toggle */}
        <div className="lg:hidden">
          <Button
            variant="outline"
            className="w-full justify-between"
            onClick={() => setFormOpen((v) => !v)}
            data-testid="button-toggle-form"
          >
            <span className="font-medium">Nuevo Registro</span>
            {formOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
          {formOpen && (
            <div className="mt-3">
              <PrinterForm onSuccess={() => setFormOpen(false)} />
            </div>
          )}
        </div>

        {/* Desktop: side-by-side */}
        <div className="hidden lg:grid lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-4 sticky top-20">
            <PrinterForm />
          </div>
          <div className="lg:col-span-8">
            <PrinterTable />
          </div>
        </div>

        {/* Mobile: list below the toggle form */}
        <div className="lg:hidden">
          <PrinterTable />
        </div>
      </main>
    </div>
  );
}
