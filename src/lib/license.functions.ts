import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { APP_CODE } from "@/lib/app-config";

const emailSchema = z.string().trim().toLowerCase().email().max(254);
const keySchema = z.string().trim().min(1).max(128);

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
        .select("id, is_active, expires_at, activated_at")
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

      // 7) mark license activated_at if still null (first claim on this license)
      if (!license.activated_at) {
        const { error: actErr } = await ext
          .from("licenses")
          .update({ activated_at: new Date().toISOString() })
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
