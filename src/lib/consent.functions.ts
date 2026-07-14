import { createServerFn } from "@tanstack/react-start";
import { getRequestHeader } from "@tanstack/react-start/server";
import { z } from "zod";
import { APP_CODE, TERMS_VERSION } from "@/lib/app-config";

const uuidSchema = z.string().uuid();
const langSchema = z.enum(["it", "en", "de", "es"]);

export const checkTermsConsent = createServerFn({ method: "POST" })
  .inputValidator((input: { licenseId: string }) =>
    z.object({ licenseId: uuidSchema }).parse(input),
  )
  .handler(async ({ data }): Promise<{ accepted: boolean }> => {
    try {
      const { supabaseExternal } = await import(
        "@/integrations/supabase/client.external"
      );
      const { data: row, error } = await supabaseExternal
        .from("license_consents" as never)
        .select("id")
        .eq("license_id", data.licenseId)
        .eq("terms_version", TERMS_VERSION)
        .limit(1)
        .maybeSingle();
      if (error) throw new Error(error.message);
      return { accepted: !!row };
    } catch (err) {
      console.error("checkTermsConsent error:", err);
      // Fail-safe: if we cannot verify, require re-acceptance
      return { accepted: false };
    }
  });

type RecordResult =
  | { ok: true; alreadyExisted: boolean }
  | { ok: false; code: string };

export const recordTermsConsent = createServerFn({ method: "POST" })
  .inputValidator(
    (input: { licenseId: string; language: "it" | "en" | "de" | "es" }) =>
      z
        .object({ licenseId: uuidSchema, language: langSchema })
        .parse(input),
  )
  .handler(async ({ data }): Promise<RecordResult> => {
    try {
      const { supabaseExternal } = await import(
        "@/integrations/supabase/client.external"
      );

      // Validate license exists and get its app_code (server-side source of truth)
      const { data: license, error: lErr } = await supabaseExternal
        .from("licenses")
        .select("id, app_code")
        .eq("id", data.licenseId)
        .eq("app_code", APP_CODE)
        .limit(1)
        .maybeSingle();
      if (lErr) throw new Error(lErr.message);
      if (!license) return { ok: false, code: "E-302" };

      const userAgent = getRequestHeader("user-agent") ?? null;
      const xff = getRequestHeader("x-forwarded-for");
      const ipAddress = xff ? xff.split(",")[0]!.trim() : null;

      const { error: insErr } = await supabaseExternal
        .from("license_consents" as never)
        .insert({
          license_id: data.licenseId,
          app_code: license.app_code,
          language: data.language,
          terms_version: TERMS_VERSION,
          user_agent: userAgent,
          ip_address: ipAddress,
        } as never);

      if (insErr) {
        const code = (insErr as { code?: string }).code;
        if (code === "23505") {
          return { ok: true, alreadyExisted: true };
        }
        throw new Error(insErr.message);
      }

      return { ok: true, alreadyExisted: false };
    } catch (err) {
      console.error("recordTermsConsent error:", err);
      return { ok: false, code: "E-301" };
    }
  });
