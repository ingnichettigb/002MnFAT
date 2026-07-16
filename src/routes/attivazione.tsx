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
import { checkTermsConsent } from "@/lib/consent.functions";
import { TermsConsent } from "@/components/terms-consent";
import { VERIFIED_EMAIL_KEY, ACTIVATED_KEY, LICENSE_ID_KEY, CONSENT_KEY } from "@/routes/__root";
import { useI18n } from "@/lib/i18n";
import { APP_CODE } from "@/lib/app-config";

export const Route = createFileRoute("/attivazione")({
  head: () => ({
    meta: [
      { title: "Attivazione — 002MnFAT" },
      { name: "description", content: "Attiva la tua licenza." },
    ],
  }),
  component: AttivazionePage,
});

const REASON_MESSAGES: Record<string, string> = {
  license_not_found:
    "Il codice licenza inserito non risulta valido. Verifica di averlo copiato correttamente dall'email di acquisto. (E-101)",
  email_mismatch:
    "Questo codice licenza è associato a un altro indirizzo email. Verifica di aver usato l'email con cui hai effettuato l'acquisto. (E-102)",
  license_expired:
    "Questa licenza risulta scaduta. Contattaci per il rinnovo. (E-103)",
  puk_not_found:
    "Il codice PUK inserito non è valido per questa licenza. Verifica di averlo copiato correttamente dall'email di acquisto. (E-201)",
  puk_already_used:
    "Questo codice PUK risulta già utilizzato. Se hai già attivato la licenza in precedenza, contattaci per assistenza. (E-202)",
  server_error:
    "Si è verificato un errore tecnico. Riprova tra qualche minuto o contattaci indicando il codice errore. (E-500)",
};


function AttivazionePage() {
  const navigate = useNavigate();
  const activate = useServerFn(verifyAndActivateLicense);
  const checkConsent = useServerFn(checkTermsConsent);
  const { primary } = useI18n();

  const [email, setEmail] = React.useState<string | null>(null);
  const [licenseKey, setLicenseKey] = React.useState("");
  const [puk, setPuk] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [pendingConsent, setPendingConsent] = React.useState<string | null>(
    null,
  );

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const verified = window.localStorage.getItem(VERIFIED_EMAIL_KEY);
    if (!verified) {
      navigate({ to: "/auth", replace: true });
      return;
    }
    setEmail(verified);
  }, [navigate]);

  const finalizeActivation = () => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(ACTIVATED_KEY, "1");
      window.localStorage.setItem(CONSENT_KEY, "1");
    }
    navigate({ to: "/" });
  };


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
          window.localStorage.setItem(LICENSE_ID_KEY, res.licenseId);
        }
        const consent = await checkConsent({
          data: { licenseId: res.licenseId },
        });
        if (consent.accepted) {
          finalizeActivation();
        } else {
          setPendingConsent(res.licenseId);
        }
        return;
      }

      if (res.reason === "email_not_verified") {
        navigate({ to: "/auth", replace: true });
        return;
      }
      setError(
        REASON_MESSAGES[res.reason] ?? REASON_MESSAGES.server_error,
      );
    } catch (err) {
      console.error(err);
      setError(REASON_MESSAGES.server_error);

    } finally {
      setLoading(false);
    }
  };

  if (!email) return null;

  if (pendingConsent) {
    return (
      <TermsConsent
        licenseId={pendingConsent}
        email={email}
        initialLang={primary}
        onAccepted={finalizeActivation}
      />
    );
  }



  return (
    <div className="mx-auto flex min-h-[80vh] max-w-md items-center px-4 py-8">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Attivazione licenza — {APP_CODE}</CardTitle>
          <CardDescription>
            Passaggio 2 di 3 — Inserisci il codice licenza e il PUK ricevuti via
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
