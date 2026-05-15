import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Trash2 } from "lucide-react";

import { FatStepper } from "@/components/fat-stepper";
import { useFat } from "@/lib/fat-context";
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
  const { state, toggleControl, addCustomControl, removeControl } = useFat();
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
    navigate({ to: "/report" });
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:py-12">
      <header className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">mini FAT</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Selezione dei controlli da eseguire
        </p>
      </header>

      <FatStepper current={2} />

      <Card>
        <CardHeader>
          <CardTitle>Lista Controlli</CardTitle>
          <CardDescription>
            Seleziona i controlli (meccanici, elettrici, software) che faranno
            parte del verbale. Puoi aggiungerne di personalizzati.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <ul className="divide-y rounded-md border">
            {state.controls.map((c) => (
              <li
                key={c.id}
                className="flex items-start gap-3 px-4 py-3 hover:bg-accent/30"
              >
                <Checkbox
                  id={c.id}
                  checked={c.selected}
                  onCheckedChange={() => toggleControl(c.id)}
                  className="mt-1"
                />
                <label
                  htmlFor={c.id}
                  className="flex-1 cursor-pointer text-sm leading-relaxed"
                >
                  {c.label}
                  {c.custom && (
                    <span className="ml-2 rounded-full bg-secondary px-2 py-0.5 text-xs text-secondary-foreground">
                      personalizzato
                    </span>
                  )}
                </label>
                {c.custom && (
                  <button
                    type="button"
                    aria-label="Rimuovi controllo"
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
              Aggiungi controllo personalizzato
            </label>
            <div className="flex gap-2">
              <Input
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                placeholder="Descrivi il controllo da aggiungere…"
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
                Aggiungi
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-between border-t pt-4">
            <span className="text-sm text-muted-foreground">
              {selectedCount} controll{selectedCount === 1 ? "o" : "i"} selezionat
              {selectedCount === 1 ? "o" : "i"}
            </span>
            <div className="flex gap-2">
              <Button asChild variant="outline">
                <Link to="/">← Indietro</Link>
              </Button>
              <Button onClick={handleNext} disabled={selectedCount === 0}>
                Avanti →
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
