import { Link } from "@tanstack/react-router";
import { Printer } from "lucide-react";
import { cn } from "@/lib/utils";
import { useI18n, dict } from "@/lib/i18n";
import { LABELS } from "@/lib/fat-numbering";
import { ExportCountBadge } from "@/common/exports/ExportCountBadge";
import { useExportQuota } from "@/common/exports/useExportQuota";

export function FatStepper({
  current,
  onPrint,
  printDisabled = false,
}: {
  current: 1 | 2 | 3;
  /** Handler della stampa PDF (stessa funzione del pulsante "Genera Report F.A.T." in fondo).
   *  Se presente e current === 3, la pillola dello step 3 si sdoppia e compare la parte verde "Stampa PDF". */
  onPrint?: () => void;
  /** Stessa condizione di disabilitazione del pulsante in fondo alla pagina. */
  printDisabled?: boolean;
}) {
  const { t, primary } = useI18n();
  const { remaining } = useExportQuota();
  const steps = [
    { to: "/" as const,          label: t("stepGeneral"),  num: LABELS.stepGeneral.id },
    { to: "/controlli" as const, label: t("stepControls"), num: LABELS.stepControls.id },
    { to: "/report" as const,    label: t("stepReport"),   num: LABELS.stepReport.id },
  ];

  return (
    <div className="relative mb-8 rounded-xl border border-green-500/60 bg-green-500/[0.02] px-4 py-5 sm:px-6 sm:py-6">
      <span className="absolute -top-2 left-3 bg-background px-2 text-[10px] font-semibold uppercase tracking-wider text-green-600 sm:left-4">
        {dict.currentPhase[primary]}
      </span>
      <nav className="flex items-center justify-center gap-2 sm:gap-4">
        {steps.map((s, i) => {
          const n = (i + 1) as 1 | 2 | 3;
          const active = n === current;
          const done = n < current;
          // Sdoppiamento: solo sullo step 3 attivo e solo se è stato passato onPrint.
          const split = n === 3 && active && !!onPrint;
          const link = (
            <Link
              to={s.to}
              aria-current={active ? "step" : undefined}
              className={cn(
                "relative flex items-center gap-2 rounded-full px-3 py-1.5 text-sm transition-colors",
                active && "bg-primary text-primary-foreground",
                done && "bg-secondary text-secondary-foreground",
                !active && !done && "text-muted-foreground hover:text-foreground",
                split && "rounded-r-none",
              )}
            >
              <span
                className={cn(
                  "grid h-6 w-6 place-content-center rounded-full text-xs font-semibold",
                  active && "bg-primary-foreground text-primary",
                  done && "bg-primary text-primary-foreground",
                  !active && !done && "border border-current",
                )}
              >
                {n}
              </span>
              <span className="hidden items-start gap-1 sm:inline-flex">
                <sup className="mt-[1px] text-[8px] font-semibold leading-none opacity-70">
                  {s.num}
                </sup>
                <span>{s.label}</span>
              </span>
            </Link>
          );

          const stepEl = split ? (
            <div className="inline-flex items-stretch">
              {link}
              <button
                type="button"
                onClick={onPrint}
                disabled={printDisabled}
                aria-label={t("stepPrintPdf")}
                title={t("stepPrintPdf")}
                className={cn(
                  "flex items-center gap-1.5 rounded-r-full border-l border-white/40 bg-green-600 px-3 py-1.5 text-sm font-semibold text-white transition-colors",
                  "hover:bg-green-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2",
                  "disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-green-600",
                )}
              >
                <Printer className="h-4 w-4" />
                <span className="hidden whitespace-nowrap sm:inline">
                  {t("stepPrintPdf")}
                </span>
              </button>
            </div>
          ) : (
            link
          );

          return (
            <div key={s.to} className="flex items-center gap-2 sm:gap-4">
              {n === 3 && active ? (
                <ExportCountBadge count={remaining} lang={primary}>
                  {stepEl}
                </ExportCountBadge>
              ) : (
                stepEl
              )}
              {i < steps.length - 1 && <div className="h-px w-6 bg-border sm:w-12" />}
            </div>
          );

        })}
      </nav>
    </div>
  );
}
