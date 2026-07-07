import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { APP_CODE } from "@/lib/app-config";

const emailSchema = z.string().trim().toLowerCase().email().max(254);
const keySchema = z.string().trim().min(1).max(128);

type FailReason =
  | "email_not_verified"
  | "license_not_found"
  | "email_mismatch"
  | "license_expired"
  | "puk_not_found"
  | "puk_already_used"
  | "server_error";

type ActivateResult =
  | { ok: true; reactivated: boolean; licenseId: string }
  | { ok: false; reason: FailReason; code: string };

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
  .handler(async ({ data }): Promise<ActivateResult> => {
    try {
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
        return { ok: false, reason: "email_not_verified", code: "E-001" };
      }

      // 2) find license by key+app (no email filter yet, so we can distinguish mismatch)
      const { data: license, error: lErr } = await supabaseAdmin
        .from("licenses")
        .select("id, is_active, expires_at, activated_at, user_email")
        .eq("license_key", licenseKey)
        .eq("app_code", APP_CODE)
        .eq("is_active", true)
        .limit(1)
        .maybeSingle();
      if (lErr) throw new Error(lErr.message);

      if (!license) {
        return { ok: false, reason: "license_not_found", code: "E-101" };
      }

      if (license.user_email.toLowerCase() !== email.toLowerCase()) {
        return { ok: false, reason: "email_mismatch", code: "E-102" };
      }

      if (
        license.expires_at &&
        new Date(license.expires_at as string).getTime() <= Date.now()
      ) {
        return { ok: false, reason: "license_expired", code: "E-103" };
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
        return { ok: false, reason: "puk_not_found", code: "E-201" };
      }

      if (pukRow.used) {
        if (license.activated_at) {
          return { ok: true, reactivated: true, licenseId: license.id };
        }
        return { ok: false, reason: "puk_already_used", code: "E-202" };
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

      return { ok: true, reactivated: false, licenseId: license.id };
    } catch (err) {
      console.error("verifyAndActivateLicense error:", err);
      return { ok: false, reason: "server_error", code: "E-500" };
    }
  });
