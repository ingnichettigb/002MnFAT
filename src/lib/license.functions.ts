import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { APP_CODE } from "@/lib/app-config";

const emailSchema = z.string().trim().toLowerCase().email().max(254);
const keySchema = z.string().trim().min(1).max(128);

// Verify + activate in a single server call.
// Steps:
//  1) Ensure the email is verified in lead_emails.
//  2) Match licenses+puk_codes (app_code, is_active, expires_at, user_email match, puk unused).
//  3) If matched: set activated_at (when NULL), mark puk used, return success.
//  4) If not matched but a license already activated exists for this email/app that is still
//     active (is_active + expires_at future), consider it a re-entry and allow access.
export const verifyAndActivateLicense = createServerFn({ method: "POST" })
  .inputValidator(
    (input: { email: string; licenseKey: string; puk: string }) =>
      z
        .object({
          email: emailSchema,
          licenseKey: keySchema,
          puk: keySchema,
        })
        .parse(input),
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import(
      "@/integrations/supabase/client.server"
    );
    const { email, licenseKey, puk } = data;

    // 1) email must be verified
    const { data: verified, error: vErr } = await supabaseAdmin
      .from("lead_emails")
      .select("id")
      .ilike("email", email)
      .eq("is_verified", true)
      .limit(1)
      .maybeSingle();
    if (vErr) throw new Error(vErr.message);
    if (!verified) {
      return { ok: false as const, reason: "email_not_verified" as const };
    }

    // 2) find license by key+app+email (case-insensitive email)
    const { data: license, error: lErr } = await supabaseAdmin
      .from("licenses")
      .select("id, is_active, expires_at, activated_at, user_email")
      .eq("license_key", licenseKey)
      .eq("app_code", APP_CODE)
      .eq("is_active", true)
      .limit(1)
      .maybeSingle();
    if (lErr) throw new Error(lErr.message);

    const emailMatches =
      license && license.user_email.toLowerCase() === email.toLowerCase();
    const notExpired =
      license && (!license.expires_at || new Date(license.expires_at as string).getTime() > Date.now());

    if (!license || !emailMatches || !notExpired) {
      return { ok: false as const, reason: "invalid" as const };
    }

    // 3) find matching puk
    const { data: pukRow, error: pErr } = await supabaseAdmin
      .from("puk_codes")
      .select("id, used")
      .eq("license_id", license.id)
      .eq("code", puk)
      .limit(1)
      .maybeSingle();
    if (pErr) throw new Error(pErr.message);

    if (!pukRow) {
      return { ok: false as const, reason: "invalid" as const };
    }

    if (pukRow.used) {
      // PUK already used: allow only if this license is already activated for this email.
      if (license.activated_at) {
        return {
          ok: true as const,
          reactivated: true as const,
          licenseId: license.id,
        };
      }
      return { ok: false as const, reason: "invalid" as const };
    }

    // 4) activate: set activated_at (if null) + mark puk used
    if (!license.activated_at) {
      const { error: actErr } = await supabaseAdmin
        .from("licenses")
        .update({ activated_at: new Date().toISOString() })
        .eq("id", license.id)
        .is("activated_at", null);
      if (actErr) throw new Error(actErr.message);
    }

    const { error: pukUpdErr } = await supabaseAdmin
      .from("puk_codes")
      .update({ used: true, used_at: new Date().toISOString() })
      .eq("id", pukRow.id)
      .eq("used", false);
    if (pukUpdErr) throw new Error(pukUpdErr.message);

    return {
      ok: true as const,
      reactivated: false as const,
      licenseId: license.id,
    };
  });
