import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { FileDown, RotateCcw, AlertTriangle } from "lucide-react";
import { toast } from "sonner";


import { FatStepper } from "@/components/fat-stepper";
import { FatToolbar } from "@/components/fat-toolbar";
import { Lbl } from "@/components/lbl";
import { SortableControlsList } from "@/components/sortable-controls-list";
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
import { usePdfSavedDialog } from "@/components/pdf-saved-dialog";
import { useExportQuota } from "@/common/exports/useExportQuota";
import { ExportCountBadge } from "@/common/exports/ExportCountBadge";


export const Route = createFileRoute("/report")({
  head: () => ({
    meta: [
      { title: "Genera Report — Mini F.A.T." },
      {
        name: "description",
        content: "Riepilogo e generazione del PDF del verbale F.A.T. (IT/EN).",
      },
    ],
  }),
  component: ReportPage,
});

function ReportPage() {
  const navigate = useNavigate();
  const { state, reset, reorderControls, markDone } = useFat();
  const { t, lang, secondary } = useI18n();
  const { general } = state;
  const selected = state.controls.filter((c) => c.selected);

  const fmtDate = (iso: string) => {
    if (!iso) return "—";
    const d = new Date(iso);
    return isNaN(d.getTime())
      ? iso
      : d.toLocaleDateString(lang === "it" ? "it-IT" : "en-GB");
  };

  const { showPdfSaved, dialog: pdfSavedDialog } = usePdfSavedDialog();
  const { showExhausted, dialog: exhaustedDialog } = usePdfExportsExhaustedDialog();
  const fetchPdfExportsStatus = useServerFn(getPdfExportsStatus);
  const decrementExports = useServerFn(decrementPdfExports);

  // Banner "questa e' l'ultima generazione disponibile": mostrato PRIMA che
  // l'utente generi, cosi' puo' decidere consapevolmente. Letto al mount
  // della pagina report (dopo verifyAndActivateLicense/checkLicenseStatus,
  // che sono i controlli di validita' gia' esistenti - qui leggiamo solo
  // il contatore, non decidiamo l'accesso).
  const [showLastExportWarning, setShowLastExportWarning] = useState(false);
  const [pdfExportsBadge, setPdfExportsBadge] = useState<number | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const licenseId = window.localStorage.getItem(LICENSE_ID_KEY);
    if (!licenseId) return;
    fetchPdfExportsStatus({ data: { licenseId } })
      .then(({ remaining }) => {
        setShowLastExportWarning(remaining === 1);
        // 999 fisso quando illimitato (remaining === null), altrimenti il valore reale
        setPdfExportsBadge(remaining === null ? 999 : remaining);
      })
      .catch((err) => {
        console.error("getPdfExportsStatus call failed:", err);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleGenerate = () => {
    markDone();
    toast.success(t("reportGeneratedDone"));
    const filename = generateFatPdf(state, lang, secondary);
    showPdfSaved(filename);

    // Scala il contatore di generazioni PDF della licenza (no-op per
    // licenze illimitate). Se questo era l'ultimo credito disponibile,
    // la licenza viene disattivata dal server e mostriamo il dialog
    // bloccante di avviso. Il PDF e' gia' stato scaricato in ogni caso.
    if (typeof window !== "undefined") {
      const licenseId = window.localStorage.getItem(LICENSE_ID_KEY);
      if (licenseId) {
        decrementExports({ data: { licenseId } })
          .then(({ remaining, exhausted }) => {
            setPdfExportsBadge(remaining === null ? 999 : remaining);
            if (exhausted) {
              showExhausted();
            }
          })
          .catch((err) => {
            console.error("decrementPdfExports call failed:", err);
          });
      }
    }
  };


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
            Mini F.A.T.
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("reportSubtitle")}
          </p>
        </div>
        <LangSwitcher />
      </header>

      <FatToolbar />

      {showLastExportWarning && (
        <div className="mb-6 flex items-start gap-3 rounded-md border border-amber-300 bg-amber-50 p-4 text-amber-900">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
          <div className="text-sm">
            <p className="font-semibold">
              Attenzione: questa è l'ultima generazione PDF disponibile per questa licenza.
            </p>
            <p className="mt-0.5">
              Dopo non potrai più generarne altri, fino al rinnovo della licenza o all'acquisto di una nuova licenza.
            </p>
          </div>
        </div>
      )}

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
              <Field label={t("orderNo")} value={general.numeroOrdineCliente} />
              <Field label={t("testDate")} value={fmtDate(general.dataCollaudo)} />
              <Field label={t("testPlace")} value={general.luogoCollaudo} />
            </dl>
          </div>
          <div className="md:col-span-2">
            <h3 className="mb-2 font-semibold">
              <Lbl id={LABELS.attendeesTitle.id}>{t("attendeesTitle")}</Lbl>
            </h3>
            {(() => {
              const normCmp = (s: string) => (s || "").trim().toLocaleLowerCase();
              const mfgName = normCmp(general.produttore.ragioneSociale);
              const sameCompany = (az: string) => {
                const a = normCmp(az);
                return !!a && !!mfgName && (a === mfgName || a.includes(mfgName) || mfgName.includes(a));
              };
              const isMfg = (a: { side?: string; azienda: string }) =>
                a.side === "mfg" || sameCompany(a.azienda);
              const nonEmpty = general.presenti.filter(
                (a) => a.nome || a.ruolo || a.azienda,
              );
              const ordered = [
                ...nonEmpty.filter((a) => !isMfg(a)),
                ...nonEmpty.filter((a) => isMfg(a)),
              ];
              if (ordered.length === 0) {
                return <p className="text-sm text-muted-foreground">—</p>;
              }
              const UP = (s: string) => (s || "").toLocaleUpperCase();
              return (
                <ul className="space-y-1 text-sm">
                  {ordered.map((a) => {
                    const name = UP(a.nome);
                    const ditta = UP(a.azienda);
                    const ruolo = UP(a.ruolo);
                    return (
                      <li key={a.id}>
                        <span className="font-medium">{name || "—"}</span>
                        {ditta && (
                          <span className="text-muted-foreground"> ({ditta})</span>
                        )}
                        {ruolo && (
                          <span className="text-muted-foreground"> — {ruolo}</span>
                        )}
                      </li>
                    );
                  })}
                </ul>
              );
            })()}
          </div>
        </CardContent>
      </Card>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>
            <Lbl id={LABELS.controlsTitle.id}>{t("summaryControls")}</Lbl> ({selected.length})
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
            <SortableControlsList
              controls={selected}
              onReorder={(newSelectedOrder) => {
                // Merge the new order of selected-unlocked items back into the
                // full unlocked list, keeping unselected items where they are.
                const unlocked = state.controls.filter((c) => !c.locked);
                const selectedIdsSet = new Set(
                  selected.filter((c) => !c.locked).map((c) => c.id),
                );
                let pickIdx = 0;
                const mergedUnlockedIds = unlocked.map((c) => {
                  if (selectedIdsSet.has(c.id)) {
                    const nextId = newSelectedOrder[pickIdx++];
                    return nextId ?? c.id;
                  }
                  return c.id;
                });
                reorderControls(mergedUnlockedIds);
              }}
              renderItem={({ control: c, index: idx }) => (
                <div className="flex flex-1 items-start gap-2 text-sm">
                  <span className="min-w-[1.5rem] text-muted-foreground">
                    {idx + 1}.
                  </span>
                  <span>{c.label}</span>
                </div>
              )}
            />
          )}
        </CardContent>
      </Card>

      <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:justify-between">
        <Button asChild variant="outline">
          <Link to="/controlli">
            <Lbl id={LABELS.modifyControls.id}>{t("modifyControls")}</Lbl>
          </Link>
        </Button>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button variant="outline" onClick={handleReset}>
            <RotateCcw className="mr-2 h-4 w-4" />
            <Lbl id={LABELS.restart.id}>{t("restart")}</Lbl>
          </Button>
          <div className="relative inline-flex">
            {pdfExportsBadge !== null && (
              <span
                className="absolute -right-2 -top-2 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-green-600 text-xs font-bold text-white shadow"
                title="Generazioni PDF rimanenti"
              >
                {pdfExportsBadge}
              </span>
            )}
            <Button
              size="lg"
              onClick={handleGenerate}
              disabled={
                selected.length === 0 || !general.produttore.ragioneSociale
              }
            >
              <FileDown className="mr-2 h-4 w-4" />
              <Lbl id={LABELS.generatePdf.id}>{t("generatePdf")}</Lbl>
            </Button>
          </div>
        </div>
      </div>
      {pdfSavedDialog}
      {exhaustedDialog}
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
