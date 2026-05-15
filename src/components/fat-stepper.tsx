import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

const steps = [
  { to: "/", label: "Dati Generali" },
  { to: "/controlli", label: "Controlli" },
  { to: "/report", label: "Report PDF" },
] as const;

export function FatStepper({ current }: { current: 1 | 2 | 3 }) {
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
              className={cn(
                "flex items-center gap-2 rounded-full px-3 py-1.5 text-sm transition-colors",
                active && "bg-primary text-primary-foreground",
                done && "bg-secondary text-secondary-foreground",
                !active && !done && "text-muted-foreground hover:text-foreground",
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
              <span className="hidden sm:inline">{s.label}</span>
            </Link>
            {i < steps.length - 1 && (
              <div className="h-px w-6 bg-border sm:w-12" />
            )}
          </div>
        );
      })}
    </nav>
  );
}
