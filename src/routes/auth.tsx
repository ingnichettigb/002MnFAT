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
import { useI18n, LangSwitcher } from "@/lib/i18n";
import { VERIFIED_EMAIL_KEY } from "@/lib/app-config";

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
  const { t } = useI18n();
  const RATE_LIMIT_MSG = `${t("errRateLimit")} (E-011)`;
  const SEND_FAIL_MSG = `${t("errSendFail")} (E-010)`;
  const OTP_INVALID_MSG = `${t("errOtpInvalid")} (E-012)`;
  const OTP_SAVE_FAIL_MSG = `${t("errOtpSave")} (E-013)`;

  const [stage, setStage] = React.useState<Stage>("email");
  const [email, setEmail] = React.useState("");
  const [code, setCode] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [info, setInfo] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  const goActivation = (verifiedEmail: string) => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(VERIFIED_EMAIL_KEY, verifiedEmail);
    }
    navigate({ to: "/attivazione" });
  };

  const handleRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);

    const normalized = email.trim().toLowerCase();
    if (!normalized) {
      setError(t("errEmailInvalid"));
      return;
    }

    setLoading(true);
    try {
      const res = await reqOtp({ data: { email: normalized } });
      if (!res.ok) {
        if (res.reason === "rate_limited") setError(RATE_LIMIT_MSG);
        else setError(SEND_FAIL_MSG);
        return;
      }
      setStage("otp");
      setInfo(`${t("codeSentTo")} ${normalized}`);
    } catch (err) {
      console.error(err);
      setError(SEND_FAIL_MSG);
    } finally {
      setLoading(false);
    }
  };


  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const normalized = email.trim().toLowerCase();
    if (!/^\d{6}$/.test(code.trim())) {
      setError(t("errCode6"));
      return;
    }
    setLoading(true);
    try {
      const res = await vOtp({
        data: { email: normalized, code: code.trim() },
      });
      if (res.ok) {
        setStage("done");
        setTimeout(() => goActivation(normalized), 600);
      } else if (res.reason === "verify_save_failed") {
        setError(OTP_SAVE_FAIL_MSG);
      } else {
        setError(OTP_INVALID_MSG);
      }
    } catch (err) {
      console.error(err);
      setError(OTP_SAVE_FAIL_MSG);
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
      if (!res.ok) {
        if (res.reason === "rate_limited") setError(RATE_LIMIT_MSG);
        else setError(SEND_FAIL_MSG);
        return;
      }
      setInfo(`${t("newCodeSentTo")} ${normalized}`);
      setCode("");
    } catch (err) {
      console.error(err);
      setError(SEND_FAIL_MSG);

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-[80vh] max-w-md items-center px-4 py-8">
      <Card className="w-full">
        <CardHeader>
          <div className="mb-2 flex justify-end"><LangSwitcher /></div>
          <CardTitle>002MnFAT — {t("authTitle")}</CardTitle>
          <CardDescription>
            {stage === "email" && t("authStepEmail")}
            {stage === "otp" && t("authStepOtp")}
            {stage === "done" && t("authVerified")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {stage === "email" && (
            <form onSubmit={handleRequest} className="space-y-4" noValidate>
              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="mario@example.com"
                />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? t("pleaseWait") : t("sendCode")}
              </Button>
            </form>
          )}

          {stage === "otp" && (
            <form onSubmit={handleVerify} className="space-y-4">
              {info && (
                <p className="text-sm text-muted-foreground">{info}</p>
              )}
              <div className="space-y-1.5">
                <Label htmlFor="code">{t("codeLabel")}</Label>
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
                  {loading ? t("verifying") : t("verify")}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleResend}
                  disabled={loading}
                >
                  {t("resend")}
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
                {t("changeEmail")}
              </button>
            </form>
          )}

          {stage === "done" && (
            <p className="text-sm text-green-600">
              {t("authVerified")} {t("authRedirecting")}
            </p>
          )}

        </CardContent>
      </Card>
    </div>
  );
}
