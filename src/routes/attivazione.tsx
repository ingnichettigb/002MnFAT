import * as React from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { verifyAndActivateLicense } from "@/lib/license.functions";
import { VERIFIED_EMAIL_KEY, ACTIVATED_KEY } from "@/routes/__root";

export const Route = createFileRoute("/attivazione")({
  head: () => ({
    meta: [
      { title: "Attivazione — 002MnFAT" },
      { name: "description", content: "Attiva la tua licenza." },
    ],
  }),
  component: AttivazionePage,
});

const INVALID_MSG =
  "Codice licenza o PUK non validi, oppure già utilizzati. Verifica i dati ricevuti via email o contattaci.";

function AttivazionePage() {
  const navigate = useNavigate();
  const activate = useServerFn(verifyAndActivateLicense);

  const [email, setEmail] = React.useState<string | null>(null);
  const [licenseKey, setLicenseKey] = React.useState("");
  const [puk, setPuk] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const verified = window.localStorage.getItem(VERIFIED_EMAIL_KEY);
    if (!verified) {
      navigate({ to: "/auth", replace: true });
      return;
    }
    setEmail(verified);
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email) return;
    if (!licenseKey.trim() || !puk.trim()) {
      setError("Compila entrambi i campi.");
      return;
    }
    setLoading(true);
    try {
      const res = await activate({
        data: {
          email,
          licenseKey: licenseKey.trim(),
          puk: puk.trim(),
        },
      });
      if (res.ok) {
        if (typeof window !== "undefined") {
          window.localStorage.setItem(ACTIVATED_KEY, "1");
        }
        navigate({ to: "/" });
        return;
      }
      if (res.reason === "email_not_verified") {
        navigate({ to: "/auth", replace: true });
        return;
      }
      setError(INVALID_MSG);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Errore durante l'attivazione.");
    } finally {
      setLoading(false);
    }
  };

  if (!email) return null;

  return (
    <div className="mx-auto flex min-h-[80vh] max-w-md items-center px-4 py-8">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Attivazione licenza</CardTitle>
          <CardDescription>
            Passaggio 2 di 2 — Inserisci il codice licenza e il PUK ricevuti via
            email al momento dell'acquisto.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div className="space-y-1.5">
              <Label>Email verificata</Label>
              <Input value={email} disabled readOnly />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="license">Codice licenza</Label>
              <Input
                id="license"
                value={licenseKey}
                onChange={(e) => setLicenseKey(e.target.value)}
                placeholder="XXXX-XXXX-XXXX"
                autoComplete="off"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="puk">Codice PUK</Label>
              <Input
                id="puk"
                value={puk}
                onChange={(e) => setPuk(e.target.value)}
                placeholder="Codice PUK"
                autoComplete="off"
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Attivazione…" : "Attiva"}
            </Button>
            <button
              type="button"
              onClick={() => {
                if (typeof window !== "undefined") {
                  window.localStorage.removeItem(VERIFIED_EMAIL_KEY);
                }
                navigate({ to: "/auth", replace: true });
              }}
              className="text-xs text-muted-foreground underline"
            >
              Cambia email
            </button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
