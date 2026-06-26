import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const searchSchema = z.object({
  msg: z.string().optional(),
});

export const Route = createFileRoute("/fase2")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [{ title: "Fase 2 — 002MnFAT" }],
  }),
  component: Fase2Page,
});

function Fase2Page() {
  const { msg } = Route.useSearch();
  const navigate = useNavigate();
  return (
    <div className="mx-auto flex min-h-[80vh] max-w-md items-center px-4 py-8">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Fase 2</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-green-600">
            {msg ?? "Email verificata con successo"}
          </p>
          <p className="mt-3 text-sm text-muted-foreground">
            Fase 2 da implementare.
          </p>
          <Button
            className="mt-4 w-full"
            onClick={() => navigate({ to: "/" })}
          >
            Accesso sviluppatore
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
