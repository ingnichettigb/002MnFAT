import { useCallback, useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import {
  getPdfExportsStatus,
  decrementPdfExports,
} from "@/lib/license.functions";
import { PUK_ID_KEY } from "@/lib/app-config";
import { usePdfExportsExhaustedDialog } from "@/components/pdf-exports-exhausted-dialog";

export function useExportQuota() {
  const [remaining, setRemaining] = useState<number | null>(null);
  const [showLastExportWarning, setShowLastExportWarning] = useState(false);
  const fetchStatus = useServerFn(getPdfExportsStatus);
  const decrement = useServerFn(decrementPdfExports);
  const { showExhausted, dialog } = usePdfExportsExhaustedDialog();
  const inFlight = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const pukId = window.localStorage.getItem(PUK_ID_KEY);
    if (!pukId) return;
    fetchStatus({ data: { pukId } })
      .then(({ remaining: r }) => {
        setRemaining(r);
        setShowLastExportWarning(r === 1);
      })
      .catch((err) => console.error("getPdfExportsStatus call failed:", err));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const blocked = remaining !== null && remaining <= 0;

  const consume = useCallback(async (): Promise<boolean> => {
    if (typeof window === "undefined") return true;
    const pukId = window.localStorage.getItem(PUK_ID_KEY);
    if (!pukId) return true;

    if (remaining !== null && remaining <= 0) {
      showExhausted();
      return false;
    }

    if (inFlight.current) return false;
    inFlight.current = true;
    try {
      const { remaining: r, exhausted } = await decrement({ data: { pukId } });
      setRemaining(r);
      setShowLastExportWarning(false);
      if (exhausted) showExhausted();
      return true;
    } catch (err) {
      console.error("decrementPdfExports call failed:", err);
      return true; // fail-open
    } finally {
      inFlight.current = false;
    }
  }, [decrement, remaining, showExhausted]);

  return { remaining, blocked, showLastExportWarning, consume, dialog };
}

export default useExportQuota;
