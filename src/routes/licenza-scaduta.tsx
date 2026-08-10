import * as React from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useI18n, type Lang } from "@/lib/i18n";
import {
  LICENSE_INVALID_REASON_KEY,
  VERIFIED_EMAIL_KEY,
  APP_NAME,
} from "@/lib/app-config";

export const Route = createFileRoute("/licenza-scaduta")({
  head: () => ({
    meta: [
      { title: "Licenza non valida — Mini F.A.T." },
      {
        name: "description",
        content: "La licenza associata a questo dispositivo non è più valida.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: LicenzaScadutaPage,
});

type Reason = "expired" | "deactivated" | "not_found" | "generic";

const COPY: Record<
  Lang,
  { title: string; cta: string; body: Record<Reason, string> }
> = {
  it: {
    title: "Licenza non valida",
    cta: "Vai all'attivazione",
    body: {
      expired: "La tua licenza è scaduta. Rinnovala o inserisci una nuova licenza per continuare.",
      deactivated: "La tua licenza è stata disattivata. Contatta l'assistenza o inserisci una nuova licenza.",
      not_found: "La licenza associata a questo dispositivo non è stata trovata. Inserisci di nuovo licenza e codice PUK.",
      generic: "La licenza associata a questo dispositivo non è più valida. Inserisci di nuovo licenza e codice PUK.",
    },
  },
  en: {
    title: "License not valid",
    cta: "Go to activation",
    body: {
      expired: "Your license has expired. Renew it or enter a new license to continue.",
      deactivated: "Your license has been deactivated. Contact support or enter a new license.",
      not_found: "The license linked to this device was not found. Please enter your license and PUK code again.",
      generic: "The license linked to this device is no longer valid. Please enter your license and PUK code again.",
    },
  },
  de: {
    title: "Lizenz ungültig",
    cta: "Zur Aktivierung",
    body: {
      expired: "Ihre Lizenz ist abgelaufen. Verlängern Sie sie oder geben Sie eine neue Lizenz ein.",
      deactivated: "Ihre Lizenz wurde deaktiviert. Wenden Sie sich an den Support oder geben Sie eine neue Lizenz ein.",
      not_found: "Die mit diesem Gerät verknüpfte Lizenz wurde nicht gefunden. Bitte geben Sie Lizenz und PUK-Code erneut ein.",
      generic: "Die mit diesem Gerät verknüpfte Lizenz ist nicht mehr gültig. Bitte geben Sie Lizenz und PUK-Code erneut ein.",
    },
  },
  es: {
    title: "Licencia no válida",
    cta: "Ir a la activación",
    body: {
      expired: "Tu licencia ha caducado. Renuévala o introduce una nueva licencia para continuar.",
      deactivated: "Tu licencia ha sido desactivada. Contacta con soporte o introduce una nueva licencia.",
      not_found: "No se ha encontrado la licencia asociada a este dispositivo. Introduce de nuevo la licencia y el código PUK.",
      generic: "La licencia asociada a este dispositivo ya no es válida. Introduce de nuevo la licencia y el código PUK.",
    },
  },
};

function LicenzaScadutaPage() {
  const navigate = useNavigate();
  const { primary } = useI18n();
  const [reason, setReason] = React.useState<Reason>("generic");

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = window.localStorage.getItem(LICENSE_INVALID_REASON_KEY);
    if (raw === "expired" || raw === "deactivated" || raw === "not_found") {
      setReason(raw);
    } else {
      setReason("generic");
    }
  }, []);

  const copy = COPY[primary] ?? COPY.it;

  const handleContinue = () => {
    const verified =
      typeof window === "undefined"
        ? null
        : window.localStorage.getItem(VERIFIED_EMAIL_KEY);
    navigate({ to: verified ? "/attivazione" : "/auth", replace: true });
  };

  return (
    <div className="mx-auto flex min-h-[80vh] max-w-md items-center px-4 py-8">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>{copy.title}</CardTitle>
          <CardDescription>{APP_NAME}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">{copy.body[reason]}</p>
          <Button className="w-full" onClick={handleContinue}>
            {copy.cta}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
