import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { FileDown, RotateCcw } from "lucide-react";

import { FatStepper } from "@/components/fat-stepper";
import { useFat } from "@/lib/fat-context";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { generateFatPdf } from "@/lib/generate-fat-pdf";

export const Route = createFileRoute("/report")({
  head: () => ({
    meta: [
      { title: "Genera Report — mini FAT" },
      {
        name: "description",
        content: "Riepilogo e generazione del PDF del verbale FAT.",
      },
    ],
  }),
  component: ReportPage,
});

function ReportPage() {
  const navigate = useNavigate();
  const { state, reset } = useFat();
  const { general } = state;
  const selected = state.controls.filter((c) => c.selected);

  const handleGenerate = () => {
    generateFatPdf(state);
  };

  const handleReset = () => {
    if (confirm("Vuoi davvero ricominciare? Tutti i dati verranno cancellati.")) {
      reset();
      navigate({ to: "/" });
    }
  };

  const fmtDate = (iso: string) => {
    if (!iso) return "—";
    const d = new Date(iso);
    return isNaN(d.getTime()) ? iso : d.toLocaleDateString("it-IT");
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:py-12">
      <header className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">mini FAT</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Riepilogo e generazione del PDF
        </p>
      </header>

      <FatStepper current={3} />

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Dati Generali</CardTitle>
          <CardDescription>Compariranno nel frontespizio.</CardDescription>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
            <Field label="Ragione Sociale" value={general.ragioneSociale} />
            <Field label="Compilatore" value={general.compilatore} />
            <Field label="Data Collaudo" value={fmtDate(general.dataCollaudo)} />
            <Field label="Luogo Collaudo" value={general.luogoCollaudo} />
            <Field label="N° Disegno" value={general.numeroDisegno} />
            <Field label="N° Matricola" value={general.numeroMatricola} />
          </dl>
        </CardContent>
      </Card>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Controlli selezionati ({selected.length})</CardTitle>
          <CardDescription>
            Ogni controllo avrà un capitolo dedicato nel PDF.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {selected.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nessun controllo selezionato.{" "}
              <Link to="/controlli" className="text-primary underline">
                Torna indietro
              </Link>
              .
            </p>
          ) : (
            <ol className="list-inside list-decimal space-y-1.5 text-sm">
              {selected.map((c) => (
                <li key={c.id}>{c.label}</li>
              ))}
            </ol>
          )}
        </CardContent>
      </Card>

      <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:justify-between">
        <Button asChild variant="outline">
          <Link to="/controlli">← Modifica controlli</Link>
        </Button>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button variant="outline" onClick={handleReset}>
            <RotateCcw className="mr-2 h-4 w-4" />
            Ricomincia
          </Button>
          <Button
            size="lg"
            onClick={handleGenerate}
            disabled={selected.length === 0 || !general.ragioneSociale}
          >
            <FileDown className="mr-2 h-4 w-4" />
            Genera Report FAT
          </Button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-muted-foreground">
        {label}
      </dt>
      <dd className="mt-0.5 font-medium">{value || "—"}</dd>
    </div>
  );
}
