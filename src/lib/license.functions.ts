import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { APP_CODE } from "@/lib/app-config";
import type { LicenseStatus } from "@/lib/license-status.server";

const emailSchema = z.string().trim().toLowerCase().email().max(254);
const keySchema = z.string().trim().min(1).max(128);

export const checkLicenseStatus = createServerFn({ method: "POST" })
  .inputValidator((input: { licenseId: string }) =>
    z.object({ licenseId: z.string().uuid() }).parse(input),
  )
  .handler(async ({ data }): Promise<LicenseStatus> => {
    try {
      const { runLicenseStatus } = await import(
        "@/lib/license-status.server"
      );
      return await runLicenseStatus(data.licenseId);
    } catch (err) {
      console.error("checkLicenseStatus error:", err);
      return { valid: true, reason: null };
    }
  });


type FailReason =
  | "email_not_verified"
  | "license_not_found"
  | "license_expired"
  | "puk_not_found"
  | "puk_wrong_product"
  | "puk_not_in_license"
  | "puk_claimed_by_other"
  | "server_error";

type ActivateResult =
  | { ok: true; reactivated: boolean; licenseId: string; pukId: string; userId: string }
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
      const { supabaseExternal } = await import(
        "@/integrations/supabase/client.external"
      );
      // The external DB has columns not present in the generated Cloud types
      // (users, license_puk_map, puk_codes.user_id, puk_codes.type_product_code).
      // Cast once to bypass typed schema.
      const ext = supabaseExternal as unknown as {
        from: (t: string) => any;
      };
      const { email, licenseKey, puk } = data;

      // 1) email must be verified on Cloud
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

      // 2) find license by key + app_code (no email filter: self-claim scenario)
      const { data: license, error: lErr } = await ext
        .from("licenses")
        .select("id, is_active, expires_at, activated_at, subscription_type")
        .eq("license_key", licenseKey)
        .eq("app_code", APP_CODE)
        .eq("is_active", true)
        .limit(1)
        .maybeSingle();
      if (lErr) throw new Error(lErr.message);
      if (!license) {
        return { ok: false, reason: "license_not_found", code: "E-101" };
      }
      if (
        license.expires_at &&
        new Date(license.expires_at as string).getTime() <= Date.now()
      ) {
        return { ok: false, reason: "license_expired", code: "E-103" };
      }

      // 3) find PUK by code
      const { data: pukRow, error: pErr } = await ext
        .from("puk_codes")
        .select("id, used, user_id, type_product_code, license_id")
        .eq("code", puk)
        .limit(1)
        .maybeSingle();
      if (pErr) throw new Error(pErr.message);
      if (!pukRow) {
        return { ok: false, reason: "puk_not_found", code: "E-201" };
      }
      if (
        pukRow.type_product_code &&
        pukRow.type_product_code !== APP_CODE
      ) {
        return { ok: false, reason: "puk_wrong_product", code: "E-203" };
      }

      // 4) verify PUK belongs to this license via license_puk_map
      //    (also accept legacy direct puk_codes.license_id link)
      const { data: mapRow, error: mErr } = await ext
        .from("license_puk_map")
        .select("id")
        .eq("license_id", license.id)
        .eq("puk_id", pukRow.id)
        .limit(1)
        .maybeSingle();
      if (mErr) throw new Error(mErr.message);
      const linkedByMap = !!mapRow;
      const linkedByFk = pukRow.license_id === license.id;
      if (!linkedByMap && !linkedByFk) {
        return { ok: false, reason: "puk_not_in_license", code: "E-204" };
      }

      // 5) resolve / create user in external users table (by email)
      const { data: existingUser, error: uErr } = await ext
        .from("users")
        .select("id, email")
        .ilike("email", email)
        .limit(1)
        .maybeSingle();
      if (uErr) throw new Error(uErr.message);

      let userId: string;
      if (existingUser) {
        userId = existingUser.id as string;
      } else {
        const { data: insUser, error: insErr } = await ext
          .from("users")
          .insert({ email })
          .select("id")
          .single();
        if (insErr) throw new Error(insErr.message);
        userId = insUser.id as string;
      }

      // 6) claim logic
      if (pukRow.user_id && pukRow.user_id !== userId) {
        return { ok: false, reason: "puk_claimed_by_other", code: "E-202" };
      }

      let reactivated = false;
      if (pukRow.user_id === userId) {
        // same user re-entering: allow reactivation
        reactivated = true;
      } else {
        // pukRow.user_id is NULL → claim atomically (guard user_id IS NULL)
        const { data: claimed, error: claimErr } = await ext
          .from("puk_codes")
          .update({
            user_id: userId,
            used: true,
            used_at: new Date().toISOString(),
          })
          .eq("id", pukRow.id)
          .is("user_id", null)
          .select("id")
          .maybeSingle();
        if (claimErr) throw new Error(claimErr.message);
        if (!claimed) {
          // race: someone else claimed it in the meantime
          return { ok: false, reason: "puk_claimed_by_other", code: "E-202" };
        }
      }

      // 7) mark license activated_at if still null (first claim on this license).
      //    Se la licenza e' a uso singolo (subscription_type === "single_use"),
      //    le 48h di validita' partono da QUESTO istante (primo accesso reale),
      //    non dall'acquisto: valorizziamo expires_at nello stesso UPDATE.
      if (!license.activated_at) {
        const nowIso = new Date().toISOString();
        const updatePayload: Record<string, string> = { activated_at: nowIso };
        if (license.subscription_type === "single_use") {
          const singleUseExpiry = new Date(Date.now() + 48 * 60 * 60 * 1000);
          updatePayload.expires_at = singleUseExpiry.toISOString();
        }
        const { error: actErr } = await ext
          .from("licenses")
          .update(updatePayload)
          .eq("id", license.id)
          .is("activated_at", null);
        if (actErr) throw new Error(actErr.message);
      }

      return {
        ok: true,
        reactivated,
        licenseId: license.id as string,
        pukId: pukRow.id as string,
        userId,
      };
    } catch (err) {
      console.error("verifyAndActivateLicense error:", err);
      return { ok: false, reason: "server_error", code: "E-500" };
    }
  });

// Da chiamare subito dopo la generazione del PDF finale (report.tsx).
// Se la licenza e' a uso singolo (subscription_type === "single_use"),
// la disattiva immediatamente: al prossimo controllo di runLicenseStatus
// (gia' eseguito ad ogni navigazione tramite AuthGate) l'accesso viene
// bloccato senza bisogno di toccare AuthGate/license-status.server.ts.
// Per qualsiasi altro tipo di licenza (monthly, annual, o nessuna) e' un no-op.
export const burnLicenseIfSingleUse = createServerFn({ method: "POST" })
  .inputValidator((input: { licenseId: string }) =>
    z.object({ licenseId: z.string().uuid() }).parse(input),
  )
  .handler(async ({ data }): Promise<{ burned: boolean }> => {
    try {
      const { supabaseExternal } = await import(
        "@/integrations/supabase/client.external"
      );
      const ext = supabaseExternal as unknown as {
        from: (t: string) => any;
      };

      const { data: license, error: lErr } = await ext
        .from("licenses")
        .select("id, subscription_type, is_active")
        .eq("id", data.licenseId)
        .limit(1)
        .maybeSingle();
      if (lErr) throw new Error(lErr.message);
      if (!license || license.subscription_type !== "single_use") {
        return { burned: false };
      }
      if (license.is_active === false) {
        // gia' bruciata (es. doppio click, retry di rete): no-op idempotente
        return { burned: true };
      }

      const { error: updErr } = await ext
        .from("licenses")
        .update({ is_active: false })
        .eq("id", data.licenseId);
      if (updErr) throw new Error(updErr.message);

      return { burned: true };
    } catch (err) {
      console.error("burnLicenseIfSingleUse error:", err);
      // fail-open: non blocchiamo la generazione/consegna del PDF gia' avvenuta
      // per un problema tecnico sul burn; verra' comunque bloccata alle 48h.
      return { burned: false };
    }
  });
