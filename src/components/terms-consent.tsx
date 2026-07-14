import * as React from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useServerFn } from "@tanstack/react-start";
import { recordTermsConsent } from "@/lib/consent.functions";
import { TERMS } from "@/lib/terms-i18n";
import { APP_NAME } from "@/lib/app-config";
import type { Lang } from "@/lib/i18n";

type Props = {
  licenseId: string;
  email: string;
  initialLang?: Lang;
  onAccepted: () => void;
};

const LANGS: { code: Lang; flag: string }[] = [
  { code: "it", flag: "🇮🇹" },
  { code: "en", flag: "🇬🇧" },
  { code: "de", flag: "🇩🇪" },
  { code: "es", flag: "🇪🇸" },
];

const BRAND_BG = "#06090f";
const BRAND_SURFACE = "#0a2a4a";
const BRAND_ACCENT = "#b4ff3c";

function interpolate(s: string) {
  return s.replaceAll("{{APP_NAME}}", APP_NAME);
}

export function TermsConsent({
  licenseId,
  email,
  initialLang = "it",
  onAccepted,
}: Props) {
  const record = useServerFn(recordTermsConsent);
  const [lang, setLang] = React.useState<Lang>(initialLang);
  const [checked, setChecked] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const t = TERMS[lang];

  const handleAccept = async () => {
    setError(null);
    setLoading(true);
    try {
      const res = await record({ data: { licenseId, language: lang } });
      if (res.ok) {
        onAccepted();
        return;
      }
      setError(`${t.errorGeneric} (${res.code})`);
    } catch (err) {
      console.error(err);
      setError(t.errorGeneric);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="mx-auto flex min-h-[80vh] max-w-2xl items-center px-4 py-8"
      style={{ color: "inherit" }}
    >
      <Card
        className="w-full border"
        style={{ backgroundColor: BRAND_BG, borderColor: BRAND_SURFACE }}
      >
        <CardHeader>
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <CardTitle style={{ color: BRAND_ACCENT }}>
                {t.pageTitle} — {APP_NAME}
              </CardTitle>
              <CardDescription className="text-neutral-300">
                {t.stepLabel} · {email}
              </CardDescription>
            </div>
            <div className="flex items-center gap-1">
              {LANGS.map((o) => {
                const active = lang === o.code;
                return (
                  <button
                    key={o.code}
                    type="button"
                    onClick={() => setLang(o.code)}
                    aria-label={TERMS[o.code].langLabel}
                    title={TERMS[o.code].langLabel}
                    className="h-8 w-9 rounded-md border text-base leading-none transition-all hover:scale-110"
                    style={{
                      borderColor: active ? BRAND_ACCENT : BRAND_SURFACE,
                      backgroundColor: active
                        ? `${BRAND_ACCENT}22`
                        : "transparent",
                      opacity: active ? 1 : 0.7,
                    }}
                  >
                    {o.flag}
                  </button>
                );
              })}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-neutral-300">{t.intro}</p>

          <div
            className="max-h-[50vh] overflow-y-auto rounded-md border p-4 text-sm leading-relaxed"
            style={{
              borderColor: BRAND_SURFACE,
              backgroundColor: "rgba(10,42,74,0.25)",
              color: "#e5e7eb",
            }}
          >
            <h2
              className="text-base font-bold"
              style={{ color: BRAND_ACCENT }}
            >
              {t.content.heading}
            </h2>
            <p className="mt-1 text-neutral-300">
              {interpolate(t.content.subheading)}
            </p>
            <div className="mt-4 space-y-3">
              {t.content.sections.map((s) => (
                <section key={s.title}>
                  <h3 className="font-semibold text-neutral-100">{s.title}</h3>
                  <p className="mt-1 whitespace-pre-line text-neutral-300">
                    {interpolate(s.body)}
                  </p>
                </section>
              ))}
            </div>
            <p className="mt-4 text-xs italic text-neutral-400">
              {t.content.footer}
            </p>
          </div>

          <div className="flex items-start gap-2">
            <Checkbox
              id="terms-accept"
              checked={checked}
              onCheckedChange={(v) => setChecked(v === true)}
              className="mt-0.5"
              style={{ borderColor: BRAND_ACCENT }}
            />
            <Label
              htmlFor="terms-accept"
              className="cursor-pointer text-sm text-neutral-200"
            >
              {t.checkboxLabel}
            </Label>
          </div>

          {error && <p className="text-sm text-red-400">{error}</p>}

          <Button
            type="button"
            onClick={handleAccept}
            disabled={!checked || loading}
            className="w-full font-semibold"
            style={{
              backgroundColor: BRAND_ACCENT,
              color: BRAND_BG,
            }}
          >
            {loading ? t.acceptingButton : t.acceptButton}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
