import { useState, useCallback } from "react";
import { CheckCircle2, Download } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";

export function usePdfSavedDialog() {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [filename, setFilename] = useState<string>("");

  const showPdfSaved = useCallback((name: string) => {
    setFilename(name);
    setOpen(true);
  }, []);

  const dialog = (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
              <CheckCircle2 className="h-6 w-6 text-green-600" />
            </div>
            <DialogTitle className="text-xl">{t("pdfSavedTitle")}</DialogTitle>
          </div>
          <DialogDescription className="pt-3 text-base">
            {t("pdfSavedBody")}
          </DialogDescription>
        </DialogHeader>

        <div className="my-2 flex items-start gap-2 rounded-md border bg-muted/50 p-3">
          <Download className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
          <code className="break-all text-sm font-medium">{filename}</code>
        </div>

        <DialogFooter>
          <Button
            className="w-full"
            size="lg"
            onClick={() => setOpen(false)}
          >
            {t("clickToContinue")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  return { showPdfSaved, dialog };
}
