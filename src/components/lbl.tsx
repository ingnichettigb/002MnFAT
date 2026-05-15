import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Etichetta con numero univoco in apice (alto-sinistra, font 8px).
 * Usato ovunque: titoli sezione, label di campo, pulsanti, step.
 *
 * - `id`  → numero univoco preso dal registro `LABELS` di
 *           `src/lib/fat-numbering.ts`.
 * - `as`  → tag HTML da rendere (default `span`).
 */
type LblProps = {
  id: number;
  as?: React.ElementType;
  className?: string;
  children: React.ReactNode;
};

export function Lbl({ id, as: Tag = "span", className, children }: LblProps) {
  return (
    <Tag className={cn("inline-flex items-start gap-1 leading-tight", className)}>
      <sup
        aria-hidden="true"
        className="mt-[1px] shrink-0 text-[8px] font-semibold leading-none text-muted-foreground"
      >
        {id}
      </sup>
      <span>{children}</span>
    </Tag>
  );
}
