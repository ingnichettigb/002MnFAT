import * as React from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";

import { TermsConsent } from "@/components/terms-consent";
import { checkTermsConsent } from "@/lib/consent.functions";
import {
  VERIFIED_EMAIL_KEY,
  ACTIVATED_KEY,
  LICENSE_ID_KEY,
  CONSENT_KEY,
} from "@/routes/__root";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/condizioni")({
  head: () => ({
    meta: [
      { title: "Condizioni d'Uso — mini FAT" },
      { name: "description", content: "Accettazione delle condizioni d'uso." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: CondizioniPage,
});

function CondizioniPage() {
  const navigate = useNavigate();
  const check = useServerFn(checkTermsConsent);
  const { primary } = useI18n();

  const [email, setEmail] = React.useState<string | null>(null);
  const [licenseId, setLicenseId] = React.useState<string | null>(null);
  const [ready, setReady] = React.useState(false);

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const verified = window.localStorage.getItem(VERIFIED_EMAIL_KEY);
    const lid = window.localStorage.getItem(LICENSE_ID_KEY);
    if (!verified) {
      navigate({ to: "/auth", replace: true });
      return;
    }
    if (!lid) {
      // Legacy activation without stored license id — force re-activation
      window.localStorage.removeItem(ACTIVATED_KEY);
      navigate({ to: "/attivazione", replace: true });
      return;
    }
    setEmail(verified);
    setLicenseId(lid);

    // If consent already recorded server-side, skip
    check({ data: { licenseId: lid } })
      .then((res) => {
        if (res.accepted) {
          window.localStorage.setItem(CONSENT_KEY, "1");
          window.localStorage.setItem(ACTIVATED_KEY, "1");
          navigate({ to: "/", replace: true });
        } else {
          setReady(true);
        }
      })
      .catch(() => setReady(true));
  }, [navigate, check]);

  const handleAccepted = () => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(CONSENT_KEY, "1");
      window.localStorage.setItem(ACTIVATED_KEY, "1");
    }
    navigate({ to: "/", replace: true });
  };

  if (!ready || !email || !licenseId) return null;

  return (
    <TermsConsent
      licenseId={licenseId}
      email={email}
      initialLang={primary}
      onAccepted={handleAccepted}
    />
  );
}
