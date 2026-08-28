import type { ReactNode } from "react";

interface ExportCountBadgeProps {
  count: number | null | undefined;
  lang?: string;
  children: ReactNode;
}

export function ExportCountBadge({
  count,
  lang = "it",
  children,
}: ExportCountBadgeProps) {
  const title =
    lang === "en"
      ? "PDF exports remaining"
      : lang === "es"
        ? "Exportaciones PDF restantes"
        : lang === "de"
          ? "Verbleibende PDF-Exporte"
          : "Export PDF rimanenti";

  return (
    <div className="relative inline-flex">
      {count !== null && count !== undefined && (
        <span
          className="absolute -right-2 -top-2 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-green-600 text-xs font-bold text-white shadow"
          title={title}
        >
          {count}
        </span>
      )}
      {children}
    </div>
  );
}

export default ExportCountBadge;
