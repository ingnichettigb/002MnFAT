// Utility: esporta tutte le etichette numerate in CSV (per Excel).
// Uso (da console del browser):
//
//   import("/src/lib/export-labels.ts").then(m => m.downloadLabelsCsv())
//
// Genera un file `mini-fat-labels.csv` con colonne: id, key, it, en, descrizione.

import { getStaticLabelTable } from "./fat-numbering";
import { dict } from "./i18n";

export function buildLabelRows() {
  return getStaticLabelTable().map((e) => {
    const tr = (dict as Record<string, { it: string; en: string }>)[e.i18nKey];
    return {
      id: e.id,
      key: e.i18nKey,
      it: tr?.it ?? "",
      en: tr?.en ?? "",
      descrizione: e.desc,
    };
  });
}

function toCsv(rows: ReturnType<typeof buildLabelRows>): string {
  const head = ["id", "key", "it", "en", "descrizione"];
  const escape = (v: string | number) => {
    const s = String(v);
    return /[",\n;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const lines = [head.join(";")];
  for (const r of rows) {
    lines.push([r.id, r.key, r.it, r.en, r.descrizione].map(escape).join(";"));
  }
  return lines.join("\n");
}

export function downloadLabelsCsv() {
  const csv = "\ufeff" + toCsv(buildLabelRows()); // BOM per Excel
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "mini-fat-labels.csv";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
