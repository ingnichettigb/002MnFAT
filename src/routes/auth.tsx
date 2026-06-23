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
import { requestOtp, verifyOtp } from "@/lib/otp.functions";
import { VERIFIED_EMAIL_KEY } from "@/routes/__root";


export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Accesso — 002MnFAT" },
      { name: "description", content: "Verifica email per accedere." },
    ],
  }),
  component: AuthPage,
});

type Stage = "email" | "otp" | "done";

function AuthPage() {
  const navigate = useNavigate();
  const reqOtp = useServerFn(requestOtp);
  const vOtp = useServerFn(verifyOtp);

  const [stage, setStage] = React.useState<Stage>("email");
  const [email, setEmail] = React.useState("");
  const [puk, setPuk] = React.useState("");
  const [code, setCode] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [info, setInfo] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  // Dev bypass: 7 consecutive clicks of "Prosegui"
  const clickCountRef = React.useRef(0);

  const goPhase2 = (msg = "Email verificata con successo") => {
    navigate({ to: "/fase2", search: { msg } });
  };

  const handleProsegui = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);

    clickCountRef.current += 1;
    if (clickCountRef.current >= 7) {
      clickCountRef.current = 0;
      goPhase2();
      return;
    }

    const normalized = email.trim().toLowerCase();
    if (!normalized) {
      setError("Inserisci una email valida.");
      return;
    }

    setLoading(true);
    try {
      const res = await reqOtp({ data: { email: normalized } });
      if (res.alreadyVerified) {
        goPhase2();
        return;
      }
      setStage("otp");
      setInfo(`Abbiamo inviato il codice a ${normalized}`);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Errore durante l'invio del codice.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const normalized = email.trim().toLowerCase();
    if (!/^\d{6}$/.test(code.trim())) {
      setError("Il codice deve essere di 6 cifre.");
      return;
    }
    setLoading(true);
    try {
      const res = await vOtp({
        data: { email: normalized, code: code.trim() },
      });
      if (res.ok) {
        setStage("done");
        setTimeout(() => goPhase2(), 800);
      } else if (res.reason === "expired") {
        setError("Codice scaduto, richiedi un nuovo codice.");
      } else {
        setError("Codice non valido.");
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Errore durante la verifica.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError(null);
    setInfo(null);
    setLoading(true);
    try {
      const normalized = email.trim().toLowerCase();
      const res = await reqOtp({ data: { email: normalized } });
      if (res.alreadyVerified) {
        goPhase2();
        return;
      }
      setInfo(`Nuovo codice inviato a ${normalized}`);
      setCode("");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Errore durante l'invio del codice.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-[80vh] max-w-md items-center px-4 py-8">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>002MnFAT — Accesso</CardTitle>
          <CardDescription>
            {stage === "email" && "Inserisci la tua email per iniziare."}
            {stage === "otp" && "Inserisci il codice ricevuto per email."}
            {stage === "done" && "Email verificata con successo."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {stage === "email" && (
            <form onSubmit={handleProsegui} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="mario@example.com"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="puk">PUK</Label>
                <Input
                  id="puk"
                  type="text"
                  value={puk}
                  onChange={(e) => setPuk(e.target.value)}
                  placeholder="Codice PUK"
                />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Attendere…" : "Prosegui"}
              </Button>
            </form>
          )}

          {stage === "otp" && (
            <form onSubmit={handleVerify} className="space-y-4">
              {info && (
                <p className="text-sm text-muted-foreground">{info}</p>
              )}
              <div className="space-y-1.5">
                <Label htmlFor="code">Codice (6 cifre)</Label>
                <Input
                  id="code"
                  inputMode="numeric"
                  pattern="\d{6}"
                  maxLength={6}
                  required
                  value={code}
                  onChange={(e) =>
                    setCode(e.target.value.replace(/\D/g, "").slice(0, 6))
                  }
                  placeholder="123456"
                />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <div className="flex gap-2">
                <Button type="submit" className="flex-1" disabled={loading}>
                  {loading ? "Verifica…" : "Verifica"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleResend}
                  disabled={loading}
                >
                  Reinvia
                </Button>
              </div>
              <button
                type="button"
                onClick={() => {
                  setStage("email");
                  setCode("");
                  setError(null);
                  setInfo(null);
                }}
                className="text-xs text-muted-foreground underline"
              >
                Cambia email
              </button>
            </form>
          )}

          {stage === "done" && (
            <p className="text-sm text-green-600">
              Email verificata con successo. Reindirizzamento…
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
