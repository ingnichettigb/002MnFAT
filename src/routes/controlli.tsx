import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Trash2 } from "lucide-react";

import { FatStepper } from "@/components/fat-stepper";
import { FatToolbar } from "@/components/fat-toolbar";
import { Lbl } from "@/components/lbl";
import { useFat } from "@/lib/fat-context";
import { useI18n, LangSwitcher } from "@/lib/i18n";
import { LABELS, controlNumber } from "@/lib/fat-numbering";
import { generateFatPdf } from "@/lib/generate-fat-pdf";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const Route = createFileRoute("/controlli")({
  head: () => ({
    meta: [
      { title: "Controlli — mini FAT" },
      {
        name: "description",
        content: "Seleziona i controlli da includere nel verbale FAT.",
      },
    ],
  }),
  component: ControlliPage,
});

function ControlliPage() {
  const navigate = useNavigate();
  const { state, toggleControl, addCustomControl, removeControl, markDone, refreshDefaultControls } =
    useFat();
  const { t, lang, secondary } = useI18n();
  const [newLabel, setNewLabel] = useState("");

  const selectedCount = state.controls.filter((c) => c.selected).length;

  const handleAdd = () => {
    const trimmed = newLabel.trim();
    if (trimmed.length === 0 || trimmed.length > 200) return;
    addCustomControl(trimmed);
    setNewLabel("");
  };

  const handleNext = () => {
    if (selectedCount === 0) return;
    generateFatPdf(state, lang, secondary);
    markDone();
    navigate({ to: "/report" });
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:py-12">
      <header className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            mini FAT
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">{t("controlsDesc")}</p>
        </div>
        <LangSwitcher />
      </header>

      <FatToolbar />
      <FatStepper current={2} />

      <Card>
        <CardHeader>
          <CardTitle>
            <Lbl id={LABELS.controlsTitle.id}>{t("controlsTitle")}</Lbl>
          </CardTitle>
          <CardDescription>{t("controlsDesc")}</CardDescription>
          <div className="pt-2">
            <Button type="button" variant="outline" size="sm" onClick={refreshDefaultControls}>
              Aggiorna lista predefinita
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <ul className="divide-y rounded-md border">
            {state.controls.map((c, idx) => (
              <li
                key={c.id}
                className="flex items-start gap-3 px-4 py-3 hover:bg-accent/30"
              >
                <Checkbox
                  id={c.id}
                  checked={c.selected}
                  disabled={c.locked}
                  onCheckedChange={() => !c.locked && toggleControl(c.id)}
                  className="mt-1"
                />
                <label
                  htmlFor={c.id}
                  className={
                    "flex flex-1 items-start gap-1 text-sm leading-relaxed " +
                    (c.locked ? "cursor-default" : "cursor-pointer")
                  }
                >
                  <sup className="mt-[1px] text-[8px] font-semibold leading-none text-muted-foreground">
                    {controlNumber(idx)}
                  </sup>
                  <span>
                    {c.label}
                    {c.custom && (
                      <span className="ml-2 rounded-full bg-secondary px-2 py-0.5 text-xs text-secondary-foreground">
                        {t("customLabel")}
                      </span>
                    )}
                    {c.locked && (
                      <span className="ml-2 rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                        🔒
                      </span>
                    )}
                  </span>
                </label>
                {c.custom && !c.locked && (
                  <button
                    type="button"
                    aria-label={t("remove")}
                    onClick={() => removeControl(c.id)}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </li>
            ))}
          </ul>

          <div className="space-y-2">
            <label className="text-sm font-medium">
              <Lbl id={LABELS.addCustom.id}>{t("addCustom")}</Lbl>
            </label>
            <div className="flex gap-2">
              <Input
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                placeholder={t("customPlaceholder")}
                maxLength={200}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAdd();
                  }
                }}
              />
              <Button
                type="button"
                onClick={handleAdd}
                disabled={newLabel.trim().length === 0}
              >
                {t("add")}
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-between border-t pt-4">
            <span className="text-sm text-muted-foreground">
              {selectedCount} {t("selectedCount")}
            </span>
            <div className="flex gap-2">
              <Button asChild variant="outline">
                <Link to="/">
                  <Lbl id={LABELS.back.id}>{t("back")}</Lbl>
                </Link>
              </Button>
              <Button onClick={handleNext} disabled={selectedCount === 0}>
                <Lbl id={LABELS.next.id}>{t("next")}</Lbl>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
