import { Link } from "@tanstack/react-router";
import { Archive, Plus, Save } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Lbl } from "@/components/lbl";
import { useFat } from "@/lib/fat-context";
import { useI18n } from "@/lib/i18n";
import { LABELS } from "@/lib/fat-numbering";

export function FatToolbar() {
  const { t } = useI18n();
  const { saveDraft, newFat, activeFat } = useFat();

  const titlePieces = [
    activeFat?.state.general.commessa,
    activeFat?.state.general.numeroMatricola,
    activeFat?.state.general.cliente.ragioneSociale,
  ].filter(Boolean);
  const title = titlePieces.length ? titlePieces.join(" · ") : t("untitledFat");

  return (
    <div className="mb-4 flex flex-wrap items-center justify-between gap-2 rounded-md border bg-muted/30 px-3 py-2">
      <div className="min-w-0 truncate text-xs text-muted-foreground">
        <span className="font-medium text-foreground">{t("activeFat")}:</span>{" "}
        <span className="truncate">{title}</span>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Button asChild variant="outline" size="sm">
          <Link to="/archivio">
            <Archive className="mr-1 h-4 w-4" />
            <Lbl id={LABELS.archiveOpen.id}>{t("archiveOpen")}</Lbl>
          </Link>
        </Button>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() => saveDraft()}
        >
          <Save className="mr-1 h-4 w-4" />
          <Lbl id={LABELS.saveDraft.id}>{t("saveDraft")}</Lbl>
        </Button>
        <Button type="button" size="sm" onClick={() => newFat()}>
          <Plus className="mr-1 h-4 w-4" />
          <Lbl id={LABELS.newFatBtn.id}>{t("newFat")}</Lbl>
        </Button>
      </div>
    </div>
  );
}
