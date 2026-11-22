import type { ReactNode } from "react";

interface ExportCountBadgeProps {
  count: number | null | undefined;
  lang?: string;
  children: ReactNode;
}

export function ExportCountBadge({ count, lang = "it", children }: ExportCountBadgeProps) {
  const title =
    ({
      it: "Export PDF rimanenti",
      en: "PDF exports remaining",
      de: "Verbleibende PDF-Exporte",
      es: "Exportaciones PDF restantes",
      fr: "Exportations PDF restantes",
    } as Record<string, string>)[lang] ?? "Export PDF rimanenti";

  return (
    <div className="relative inline-flex">
      {count !== null && count !== undefined && (
        <span
          className="absolute -left-2 -top-2 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-green-600 text-xs font-bold text-white shadow"
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
