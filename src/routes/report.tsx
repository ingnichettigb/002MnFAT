import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { FileDown, RotateCcw } from "lucide-react";

import { FatStepper } from "@/components/fat-stepper";
import { Lbl } from "@/components/lbl";
import { useFat } from "@/lib/fat-context";
import { useI18n, LangSwitcher } from "@/lib/i18n";
import { LABELS } from "@/lib/fat-numbering";
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
        content: "Riepilogo e generazione del PDF del verbale FAT (IT/EN).",
      },
    ],
  }),
  component: ReportPage,
});

function ReportPage() {
  const navigate = useNavigate();
  const { state, reset } = useFat();
  const { t, lang } = useI18n();
  const { general } = state;
  const selected = state.controls.filter((c) => c.selected);

  const fmtDate = (iso: string) => {
    if (!iso) return "—";
    const d = new Date(iso);
    return isNaN(d.getTime())
      ? iso
      : d.toLocaleDateString(lang === "it" ? "it-IT" : "en-GB");
  };

  const handleGenerate = () => generateFatPdf(state, lang);

  const handleReset = () => {
    if (confirm(t("restartConfirm"))) {
      reset();
      navigate({ to: "/" });
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:py-12">
      <header className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            mini FAT
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("reportSubtitle")}
          </p>
        </div>
        <LangSwitcher />
      </header>

      <FatStepper current={3} />

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>{t("summaryGeneral")}</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <h3 className="mb-2 font-semibold">
              <Lbl id={LABELS.manufacturerTitle.id}>{t("manufacturerTitle")}</Lbl>
            </h3>
            <PartySummary p={general.produttore} />
          </div>
          <div>
            <h3 className="mb-2 font-semibold">
              <Lbl id={LABELS.customerTitle.id}>{t("customerTitle")}</Lbl>
            </h3>
            <PartySummary p={general.cliente} />
          </div>
          <div className="md:col-span-2">
            <h3 className="mb-2 font-semibold">
              <Lbl id={LABELS.commonTitle.id}>{t("commonTitle")}</Lbl>
            </h3>
            <dl className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
              <Field label={t("drawingNo")} value={general.numeroDisegno} />
              <Field label={t("serialNo")} value={general.numeroMatricola} />
              <Field label={t("tagNo")} value={general.tagNumber} />
              <Field label={t("testDate")} value={fmtDate(general.dataCollaudo)} />
              <Field label={t("testPlace")} value={general.luogoCollaudo} />
            </dl>
          </div>
          <div className="md:col-span-2">
            <h3 className="mb-2 font-semibold">
              <Lbl id={LABELS.attendeesTitle.id}>{t("attendeesTitle")}</Lbl>
            </h3>
            {general.presenti.filter((a) => a.nome || a.ruolo).length === 0 ? (
              <p className="text-sm text-muted-foreground">—</p>
            ) : (
              <ul className="space-y-1 text-sm">
                {general.presenti
                  .filter((a) => a.nome || a.ruolo)
                  .map((a) => (
                    <li key={a.id}>
                      <span className="font-medium">{a.nome || "—"}</span>
                      {a.ruolo && (
                        <span className="text-muted-foreground"> — {a.ruolo}</span>
                      )}
                    </li>
                  ))}
              </ul>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>
            {t("summaryControls")} ({selected.length})
          </CardTitle>
          <CardDescription>{t("summaryControlsDesc")}</CardDescription>
        </CardHeader>
        <CardContent>
          {selected.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              {t("noneSelected")}{" "}
              <Link to="/controlli" className="text-primary underline">
                {t("goBack")}
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
          <Link to="/controlli">{t("modifyControls")}</Link>
        </Button>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button variant="outline" onClick={handleReset}>
            <RotateCcw className="mr-2 h-4 w-4" />
            {t("restart")}
          </Button>
          <Button
            size="lg"
            onClick={handleGenerate}
            disabled={
              selected.length === 0 || !general.produttore.ragioneSociale
            }
          >
            <FileDown className="mr-2 h-4 w-4" />
            {t("generatePdf")}
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

function PartySummary({
  p,
}: {
  p: {
    ragioneSociale: string;
    indirizzo: string;
    referente: string;
    email: string;
    telefono: string;
  };
}) {
  return (
    <div className="space-y-0.5 text-sm">
      <p className="font-medium">{p.ragioneSociale || "—"}</p>
      {p.indirizzo && <p className="text-muted-foreground">{p.indirizzo}</p>}
      {p.referente && <p>{p.referente}</p>}
      {p.email && <p className="text-muted-foreground">{p.email}</p>}
      {p.telefono && <p className="text-muted-foreground">{p.telefono}</p>}
    </div>
  );
}
