import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { APP_CODE } from "@/lib/app-config";

const OTP_TTL_MIN = 10;
const OTP_MAX_PER_WINDOW = 3;
const OTP_WINDOW_HOURS = 24;

const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .email()
  .max(254);

function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

async function sendOtpEmail(to: string, code: string) {
  const apiKey = process.env.RESEND_API_KEY;
  const lovableKey = process.env.LOVABLE_API_KEY;
  if (!apiKey || !lovableKey) {
    throw new Error("Email service not configured");
  }
  const res = await fetch(
    "https://connector-gateway.lovable.dev/resend/emails",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${lovableKey}`,
        "X-Connection-Api-Key": apiKey,
      },
      body: JSON.stringify({
        from: `${APP_CODE} <team@corporateboostservice.eu>`,
        to: [to],
        subject: `Codice di verifica: ${code}`,
        html: `<div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;padding:24px">
          <h2 style="color:#111">Codice di verifica</h2>
          <p>Usa questo codice per completare la verifica della tua email:</p>
          <div style="font-size:32px;font-weight:700;letter-spacing:8px;text-align:center;padding:16px;background:#f4f4f5;border-radius:8px;margin:16px 0">${code}</div>
          <p style="color:#666;font-size:13px">Il codice scade tra ${OTP_TTL_MIN} minuti.</p>
        </div>`,
      }),
    },
  );
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Email send failed (${res.status}): ${txt}`);
  }
}

export const requestOtp = createServerFn({ method: "POST" })
  .inputValidator((input: { email: string }) =>
    z.object({ email: emailSchema }).parse(input),
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import(
      "@/integrations/supabase/client.server"
    );
    const email = data.email;

    // 1) already verified?
    const { data: verified, error: verErr } = await supabaseAdmin
      .from("lead_emails")
      .select("id")
      .ilike("email", email)
      .eq("is_verified", true)
      .limit(1)
      .maybeSingle();
    if (verErr) throw new Error(verErr.message);
    if (verified) {
      return { alreadyVerified: true as const };
    }

    // 2) get the current pending row for this email (if any) to track rate-limit window
    const { data: pending, error: pendErr } = await supabaseAdmin
      .from("lead_emails")
      .select("id, otp_attempts, otp_window_start")
      .ilike("email", email)
      .eq("is_verified", false)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (pendErr) throw new Error(pendErr.message);

    const now = Date.now();
    let attempts = pending?.otp_attempts ?? 0;
    let windowStart = pending?.otp_window_start
      ? new Date(pending.otp_window_start as string).getTime()
      : 0;

    const windowMs = OTP_WINDOW_HOURS * 3600 * 1000;
    if (!windowStart || now - windowStart > windowMs) {
      attempts = 0;
      windowStart = now;
    }

    if (attempts >= OTP_MAX_PER_WINDOW) {
      return { rateLimited: true as const };
    }

    const code = generateOtp();
    const nextAttempts = attempts + 1;
    const windowIso = new Date(windowStart).toISOString();

    if (pending) {
      const { error: updErr } = await supabaseAdmin
        .from("lead_emails")
        .update({
          verification_code: code,
          otp_attempts: nextAttempts,
          otp_window_start: windowIso,
        })
        .eq("id", pending.id);
      if (updErr) throw new Error(updErr.message);
    } else {
      const { error: insErr } = await supabaseAdmin
        .from("lead_emails")
        .insert({
          email,
          verification_code: code,
          is_verified: false,
          source: APP_CODE,
          otp_attempts: nextAttempts,
          otp_window_start: windowIso,
        });
      if (insErr) throw new Error(insErr.message);
    }

    await sendOtpEmail(email, code);
    return { alreadyVerified: false as const };
  });

export const verifyOtp = createServerFn({ method: "POST" })
  .inputValidator((input: { email: string; code: string }) =>
    z
      .object({
        email: emailSchema,
        code: z.string().trim().regex(/^\d{6}$/),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import(
      "@/integrations/supabase/client.server"
    );
    const { email, code } = data;

    // already verified?
    const { data: alreadyOk } = await supabaseAdmin
      .from("lead_emails")
      .select("id")
      .ilike("email", email)
      .eq("is_verified", true)
      .limit(1)
      .maybeSingle();
    if (alreadyOk) return { ok: true as const };

    // find latest matching code
    const { data: row, error } = await supabaseAdmin
      .from("lead_emails")
      .select("id, verification_code, created_at, is_verified")
      .ilike("email", email)
      .eq("verification_code", code)
      .eq("is_verified", false)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!row) {
      return { ok: false as const, reason: "invalid" as const };
    }

    const createdAt = new Date(row.created_at as string).getTime();
    const ageMin = (Date.now() - createdAt) / 60000;
    if (ageMin > OTP_TTL_MIN) {
      return { ok: false as const, reason: "expired" as const };
    }

    const { error: updErr } = await supabaseAdmin
      .from("lead_emails")
      .update({ is_verified: true, verified_at: new Date().toISOString() })
      .eq("id", row.id);
    if (updErr) throw new Error(updErr.message);

    return { ok: true as const };
  });
