import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";
import { LABELS } from "@/lib/fat-numbering";

export function FatStepper({
  current,
}: {
  current: 1 | 2 | 3;
}) {
  const { t } = useI18n();
  const steps = [
    { to: "/" as const,          label: t("stepGeneral"),  num: LABELS.stepGeneral.id },
    { to: "/controlli" as const, label: t("stepControls"), num: LABELS.stepControls.id },
    { to: "/report" as const,    label: t("stepReport"),   num: LABELS.stepReport.id },
  ];
  return (
    <nav className="mb-8 flex items-center justify-center gap-2 sm:gap-4">
      {steps.map((s, i) => {
        const n = (i + 1) as 1 | 2 | 3;
        const active = n === current;
        const done = n < current;
        return (
          <div key={s.to} className="flex items-center gap-2 sm:gap-4">
            <Link
              to={s.to}
              aria-current={active ? "step" : undefined}
              className={cn(
                "relative flex items-center gap-2 rounded-full px-3 py-1.5 text-sm transition-colors",
                active && "bg-primary text-primary-foreground ring-1 ring-green-500",
                done && "bg-secondary text-secondary-foreground",
                !active && !done && "text-muted-foreground hover:text-foreground",
              )}
            >
              {active && (
                <span className="absolute -top-2 left-2 bg-background px-1 text-[9px] font-semibold uppercase tracking-wider text-green-600">
                  {t("currentPhase")}
                </span>
              )}
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
            {i < steps.length - 1 && <div className="h-px w-6 bg-border sm:w-12" />}
          </div>
        );
      })}
    </nav>
  );
}
