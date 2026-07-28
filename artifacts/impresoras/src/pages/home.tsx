import { Printer } from "lucide-react";
import { PrinterForm } from "@/components/printer-form";
import { StatsSummary } from "@/components/stats-summary";
import { PrinterTable } from "@/components/printer-table";

export default function Home() {
  return (
    <div className="min-h-screen bg-muted/20">
      {/* Header Bar */}
      <div className="bg-background border-b border-border/50 sticky top-0 z-20 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center">
              <Printer className="w-5 h-5 text-primary" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-foreground">
              Testeo de Impresoras
            </h1>
          </div>
          <div className="text-sm font-medium text-muted-foreground font-mono">
            IT-LOG v1.0
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <StatsSummary />
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-4 sticky top-24">
            <PrinterForm />
          </div>
          <div className="lg:col-span-8">
            <PrinterTable />
          </div>
        </div>
      </main>
    </div>
  );
}
