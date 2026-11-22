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
import { VERIFIED_EMAIL_KEY, ACTIVATED_KEY, LICENSE_ID_KEY, PUK_ID_KEY, CONSENT_KEY, clearGateKeys } from "@/lib/app-config";
import { APP_CODE } from "@/lib/app-config";
import { useI18n, LangSwitcher } from "@/lib/i18n";

export const Route = createFileRoute("/attivazione")({
  head: () => ({
    meta: [
      { title: "Attivazione — 002MnFAT" },
      { name: "description", content: "Attiva la tua licenza." },
    ],
  }),
  component: AttivazionePage,
});

type ReasonInfo = { message: string; code: string };

const REASON_KEYS = {
  email_not_verified: ["E001", "E-001"],
  license_not_found: ["E101", "E-101"],
  license_expired: ["E103", "E-103"],
  puk_not_found: ["E201", "E-201"],
  puk_wrong_product: ["E203", "E-203"],
  puk_not_in_license: ["E204", "E-204"],
  puk_claimed_by_other: ["E202", "E-202"],
  server_error: ["E500", "E-500"],
} as const;
type ReasonKey = keyof typeof REASON_KEYS;

function AttivazionePage() {
  const navigate = useNavigate();
  const activate = useServerFn(verifyAndActivateLicense);
  const { t } = useI18n();
  const reasonInfo = (r: string): ReasonInfo => {
    const [k, code] = REASON_KEYS[(r in REASON_KEYS ? r : "server_error") as ReasonKey];
    return { message: t(k), code };
  };

  const [email, setEmail] = React.useState<string | null>(null);
  const [licenseKey, setLicenseKey] = React.useState("");
  const [puk, setPuk] = React.useState("");
  const [error, setError] = React.useState<ReasonInfo | null>(null);
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
      setError({ message: t("errFillBoth"), code: "" });
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
          window.localStorage.setItem(PUK_ID_KEY, res.pukId);
          window.localStorage.removeItem(ACTIVATED_KEY);
          window.localStorage.removeItem(CONSENT_KEY);
        }
        navigate({ to: "/condizioni", replace: true });
        return;
      }

      if (res.reason === "email_not_verified") {
        navigate({ to: "/auth", replace: true });
        return;
      }
      setError(reasonInfo(res.reason));
    } catch (err) {
      console.error(err);
      setError(reasonInfo("server_error"));

    } finally {
      setLoading(false);
    }
  };

  if (!email) return null;

  return (
    <div className="mx-auto flex min-h-[80vh] max-w-md items-center px-4 py-8">
      <Card className="w-full">
        <CardHeader>
          <div className="mb-2 flex justify-end"><LangSwitcher /></div>
          <CardTitle>{t("actTitle")} — {APP_CODE}</CardTitle>
          <CardDescription>
            {t("actDesc")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div className="space-y-1.5">
              <Label>{t("verifiedEmail")}</Label>
              <Input value={email} disabled readOnly />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="license">{t("licenseCode")}</Label>
              <Input
                id="license"
                value={licenseKey}
                onChange={(e) => setLicenseKey(e.target.value)}
                placeholder="XXXX-XXXX-XXXX"
                autoComplete="off"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="puk">{t("pukCode")}</Label>
              <Input
                id="puk"
                value={puk}
                onChange={(e) => setPuk(e.target.value)}
                placeholder="PUK"
                autoComplete="off"
              />
            </div>
            {error && (
              <div className="space-y-1">
                <p className="text-sm text-destructive">{error.message}</p>
                {error.code && (
                  <p className="text-xs text-muted-foreground">
                    {t("errorCode")}: {error.code}
                  </p>
                )}
              </div>
            )}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? t("activating") : t("activate")}
            </Button>
            <button
              type="button"
              onClick={() => {
                clearGateKeys();
                navigate({ to: "/auth", replace: true });
              }}

              className="text-xs text-muted-foreground underline"
            >
              {t("changeEmail")}
            </button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
