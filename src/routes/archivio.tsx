import * as React from "react";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { Archive, Copy, Eye, Pencil, Plus, Trash2 } from "lucide-react";
import { generateFatPdf } from "@/lib/generate-fat-pdf";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Lbl } from "@/components/lbl";
import { useFat, type FatStatus, type SavedFat } from "@/lib/fat-context";
import { useI18n, LangSwitcher } from "@/lib/i18n";
import { LABELS } from "@/lib/fat-numbering";

export const Route = createFileRoute("/archivio")({
  head: () => ({
    meta: [
      { title: "Archivio FAT — mini FAT" },
      {
        name: "description",
        content:
          "Elenco dei FAT salvati: da lavorare, in lavorazione e completati.",
      },
    ],
  }),
  component: ArchivioPage,
});

function fmtDate(ts: number) {
  try {
    return new Date(ts).toLocaleString();
  } catch {
    return "";
  }
}

function statusVariant(s: FatStatus) {
  switch (s) {
    case "done":
      return "default" as const;
    case "in_progress":
      return "secondary" as const;
    default:
      return "outline" as const;
  }
}

function ArchivioPage() {
  const { t, lang, secondary } = useI18n();
  const {
    archive,
    activeId,
    loadFat,
    duplicateFat,
    deleteFat,
    newFat,
  } = useFat();
  const navigate = useNavigate();
  const [tab, setTab] = React.useState<FatStatus | "all">("all");

  const sorted = React.useMemo(
    () => [...archive].sort((a, b) => b.updatedAt - a.updatedAt),
    [archive],
  );
  const filtered = tab === "all" ? sorted : sorted.filter((f) => f.status === tab);

  const handleOpen = (id: string) => {
    loadFat(id);
    navigate({ to: "/" });
  };
  const handleView = (id: string) => {
    const f = archive.find((x) => x.id === id);
    if (!f) return;
    generateFatPdf(f.state, lang, secondary);
  };
  const handleNew = () => {
    newFat();
    navigate({ to: "/" });
  };

  const counts = {
    todo: archive.filter((f) => f.status === "todo").length,
    in_progress: archive.filter((f) => f.status === "in_progress").length,
    done: archive.filter((f) => f.status === "done").length,
    all: archive.length,
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:py-12">
      <header className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            <Lbl id={LABELS.archiveTitle.id}>{t("archiveTitle")}</Lbl>
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">{t("archiveDesc")}</p>
        </div>
        <LangSwitcher />
      </header>

      <Card>
        <CardHeader className="flex-row items-center justify-between gap-2 space-y-0">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Archive className="h-5 w-5" /> {t("archiveTitle")}
            </CardTitle>
            <CardDescription>{t("archiveDesc")}</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button asChild variant="outline" size="sm">
              <Link to="/">{t("back")}</Link>
            </Button>
            <Button size="sm" onClick={handleNew}>
              <Plus className="mr-1 h-4 w-4" />
              <Lbl id={LABELS.newFatBtn.id}>{t("newFat")}</Lbl>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
            <TabsList className="mb-4">
              <TabsTrigger value="all">
                {t("statusAll")} ({counts.all})
              </TabsTrigger>
              <TabsTrigger value="todo">
                <Lbl id={LABELS.tabTodo.id}>{t("statusTodo")}</Lbl> ({counts.todo})
              </TabsTrigger>
              <TabsTrigger value="in_progress">
                <Lbl id={LABELS.tabInProgress.id}>{t("statusInProgress")}</Lbl>{" "}
                ({counts.in_progress})
              </TabsTrigger>
              <TabsTrigger value="done">
                <Lbl id={LABELS.tabDone.id}>{t("statusDone")}</Lbl> ({counts.done})
              </TabsTrigger>
            </TabsList>
            <TabsContent value={tab} className="mt-0">
              <ArchiveTable
                rows={filtered}
                activeId={activeId}
                onOpen={handleOpen}
                onView={handleView}
                onDuplicate={duplicateFat}
                onDelete={deleteFat}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

function ArchiveTable({
  rows,
  activeId,
  onOpen,
  onView,
  onDuplicate,
  onDelete,
}: {
  rows: SavedFat[];
  activeId: string | null;
  onOpen: (id: string) => void;
  onView: (id: string) => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const { t } = useI18n();

  if (rows.length === 0) {
    return (
      <p className="py-10 text-center text-sm text-muted-foreground">
        {t("noFats")}
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t("commessa")}</TableHead>
            <TableHead>{t("customerTitle")}</TableHead>
            <TableHead>{t("drawingNo")}</TableHead>
            <TableHead>{t("serialNo")}</TableHead>
            <TableHead>{t("testDate")}</TableHead>
            <TableHead>
              <Lbl id={LABELS.archiveStatus.id}>{t("status")}</Lbl>
            </TableHead>
            <TableHead>
              <Lbl id={LABELS.archiveUpdated.id}>{t("lastUpdated")}</Lbl>
            </TableHead>
            <TableHead className="text-right">—</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((f) => {
            const g = f.state.general;
            const isActive = f.id === activeId;
            return (
              <TableRow key={f.id} className={isActive ? "bg-accent/30" : ""}>
                <TableCell className="font-medium">
                  {g.commessa || "—"}
                  {isActive && (
                    <span className="ml-2 text-[10px] uppercase text-primary">
                      • {t("activeFat")}
                    </span>
                  )}
                </TableCell>
                <TableCell>{g.cliente.ragioneSociale || "—"}</TableCell>
                <TableCell>{g.numeroDisegno || "—"}</TableCell>
                <TableCell>{g.numeroMatricola || "—"}</TableCell>
                <TableCell>{g.dataCollaudo || "—"}</TableCell>
                <TableCell>
                  <Badge variant={statusVariant(f.status)}>
                    {f.status === "todo" && t("statusTodo")}
                    {f.status === "in_progress" && t("statusInProgress")}
                    {f.status === "done" && t("statusDone")}
                  </Badge>
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {fmtDate(f.updatedAt)}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onView(f.id)}
                      title={t("viewReport") || "Apri report"}
                    >
                      <Eye className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onOpen(f.id)}
                      title={t("open")}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onDuplicate(f.id)}
                      title={t("duplicate")}
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-destructive hover:text-destructive"
                          title={t("deleteAction")}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            {t("deleteAction")}
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            {t("confirmDelete")}
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>{t("back")}</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => onDelete(f.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            {t("deleteAction")}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
