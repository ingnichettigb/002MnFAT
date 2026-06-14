import * as React from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useEffect, useId } from "react";
import { Trash2, Plus } from "lucide-react";

import { FatStepper } from "@/components/fat-stepper";
import { FatToolbar } from "@/components/fat-toolbar";
import { Lbl } from "@/components/lbl";
import { useFat, newAttendee } from "@/lib/fat-context";
import { useI18n, LangSwitcher } from "@/lib/i18n";
import { LABELS, attendeeNumbers } from "@/lib/fat-numbering";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "mini FAT — Verbali di Collaudo" },
      {
        name: "description",
        content:
          "mini FAT: compila e genera in PDF il verbale di Factory Acceptance Test (IT/EN).",
      },
    ],
  }),
  component: IndexPage,
});

const partySchema = z.object({
  ragioneSociale: z.string().trim().min(1).max(200),
  indirizzo: z.string().trim().max(300).default(""),
  referente: z.string().trim().max(150).default(""),
  email: z.string().trim().max(150).default(""),
  telefono: z.string().trim().max(60).default(""),
});

const attendeeSchema = z.object({
  id: z.string(),
  nome: z.string().trim().max(150).default(""),
  ruolo: z.string().trim().max(150).default(""),
  azienda: z.string().trim().max(200).default(""),
  side: z.enum(["mfg", "cli"]).default("cli"),
});

const conclusioniSchema = z.object({
  accettato: z.enum(["", "si", "no"]).default(""),
  motivoNonAccettazione: z.string().trim().max(500).default(""),
  note: z.string().trim().max(2000).default(""),
  azioniCorrettive: z.enum(["", "si", "no"]).default(""),
  dataIspezione: z.string().default(""),
  ispettoreEsterno: z.string().trim().max(200).default(""),
  controlloInterno: z.string().trim().max(200).default(""),
  dopoAzioni: z.enum(["", "si", "no", "na"]).default(""),
  dataFinale: z.string().default(""),
  firma: z.string().trim().max(200).default(""),
});

const schema = z.object({
  produttore: partySchema,
  cliente: partySchema,
  numeroDisegno: z.string().trim().min(1).max(120),
  numeroMatricola: z.string().trim().min(1).max(120),
  tagNumber: z.string().trim().max(120).default(""),
  numeroOrdineCliente: z.string().trim().max(120).default(""),
  commessa: z.string().trim().max(120).default(""),
  dataCollaudo: z.string().min(1),
  luogoCollaudo: z.string().trim().min(1).max(200),
  descrizione: z.string().trim().max(2000).default(""),
  presenti: z.array(attendeeSchema),
  conclusioni: conclusioniSchema,
});

type FormValues = z.infer<typeof schema>;

function IndexPage() {
  const navigate = useNavigate();
  const { state, setGeneral, activeId } = useFat();
  const { t } = useI18n();

  const form = useForm<FormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(schema) as any,
    defaultValues: state.general as FormValues,
  });

  useEffect(() => {
    form.reset(state.general);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeId]);

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "presenti",
  });

  const onSubmit = (values: FormValues) => {
    setGeneral(values);
    navigate({ to: "/controlli" });
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:py-12">
      <header className="mb-6 flex items-start justify-between gap-4">
        <div className="text-center sm:text-left">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            mini FAT
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">{t("appSubtitle")}</p>
        </div>
        <LangSwitcher />
      </header>

      <FatToolbar />
      <FatStepper current={1} />


      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Manufacturer */}
        <Card>
          <CardHeader>
            <CardTitle>
              <Lbl id={LABELS.manufacturerTitle.id}>{t("manufacturerTitle")}</Lbl>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <PartyFields
              path="produttore"
              form={form}
              numbers={{
                ragioneSociale: LABELS.mfgCompanyName.id,
                indirizzo: LABELS.mfgAddress.id,
                referente: LABELS.mfgContact.id,
                email: LABELS.mfgEmail.id,
                telefono: LABELS.mfgPhone.id,
              }}
              required
            />
          </CardContent>
        </Card>

        {/* Customer */}
        <Card>
          <CardHeader>
            <CardTitle>
              <Lbl id={LABELS.customerTitle.id}>{t("customerTitle")}</Lbl>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <PartyFields
              path="cliente"
              form={form}
              numbers={{
                ragioneSociale: LABELS.cliCompanyName.id,
                indirizzo: LABELS.cliAddress.id,
                referente: LABELS.cliContact.id,
                email: LABELS.cliEmail.id,
                telefono: LABELS.cliPhone.id,
              }}
              required
            />
          </CardContent>
        </Card>

        {/* Common test data */}
        <Card>
          <CardHeader>
            <CardTitle>
              <Lbl id={LABELS.commonTitle.id}>{t("commonTitle")}</Lbl>
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <NumberedTextarea
              n={LABELS.descrizione.id}
              label={t("descrizione")}
              rows={3}
              {...form.register("descrizione")}
              placeholder={t("descrizionePlaceholder")}
              className="sm:col-span-2"
            />
            <NumberedField
              n={LABELS.drawingNo.id}
              label={t("drawingNo")}
              required
              error={form.formState.errors.numeroDisegno?.message && t("required")}
              {...form.register("numeroDisegno")}
              placeholder="DWG-2025-001"
            />
            <NumberedField
              n={LABELS.serialNo.id}
              label={t("serialNo")}
              required
              error={
                form.formState.errors.numeroMatricola?.message && t("required")
              }
              {...form.register("numeroMatricola")}
              placeholder="SN-00123"
            />
            <NumberedField
              n={LABELS.tagNo.id}
              label={t("tagNo")}
              {...form.register("tagNumber")}
              placeholder="TAG-001"
            />
            <NumberedField
              n={LABELS.orderNo.id}
              label={t("orderNo")}
              {...form.register("numeroOrdineCliente")}
              placeholder="ORD-2025-001"
            />
            <NumberedField
              n={LABELS.commessa.id}
              label={t("commessa")}
              {...form.register("commessa")}
              placeholder="JOB-2025-001"
            />
            <NumberedField
              n={LABELS.testPlace.id}
              label={t("testPlace")}
              required
              error={
                form.formState.errors.luogoCollaudo?.message && t("required")
              }
              {...form.register("luogoCollaudo")}
              placeholder="Milano, Stab. Nord"
            />
            <NumberedField
              n={LABELS.testDate.id}
              label={t("testDate")}
              type="date"
              required
              error={form.formState.errors.dataCollaudo?.message && t("required")}
              {...form.register("dataCollaudo")}
            />
          </CardContent>
        </Card>

        {/* Attendees — Manufacturer side */}
        <AttendeesBlock
          form={form}
          fields={fields}
          append={append}
          remove={remove}
          side="mfg"
        />

        {/* Attendees — Customer side */}
        <AttendeesBlock
          form={form}
          fields={fields}
          append={append}
          remove={remove}
          side="cli"
        />


        {/* Conclusioni / Final results */}
        <ConclusioniSection form={form} />

        <div className="flex flex-col items-end gap-2">
          {Object.keys(form.formState.errors).length > 0 && (
            <p className="text-sm text-destructive">
              {t("required")}: completa i campi obbligatori contrassegnati con *
            </p>
          )}
          <Button type="submit" size="lg">
            <Lbl id={LABELS.next.id}>{t("next")}</Lbl>
          </Button>
        </div>
      </form>
    </div>
  );
}

/* ───────── Party (Manufacturer / Customer) sub-form ───────── */
type PartyNums = {
  ragioneSociale: number;
  indirizzo: number;
  referente: number;
  email: number;
  telefono: number;
};

function PartyFields({
  path,
  form,
  numbers,
  required,
}: {
  path: "produttore" | "cliente";
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: any;
  numbers: PartyNums;
  required?: boolean;
}) {
  const { t } = useI18n();
  const err = form.formState.errors[path];
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
      <NumberedField
        n={numbers.ragioneSociale}
        label={t("companyName")}
        required={required}
        error={err?.ragioneSociale?.message && t("required")}
        {...form.register(`${path}.ragioneSociale` as const)}
        className="sm:col-span-2"
        placeholder="Acme S.p.A."
      />
      <NumberedField
        n={numbers.indirizzo}
        label={t("address")}
        {...form.register(`${path}.indirizzo` as const)}
        className="sm:col-span-2"
        placeholder="Via Roma 1, Milano"
      />
      <NumberedField
        n={numbers.referente}
        label={t("contact")}
        {...form.register(`${path}.referente` as const)}
        placeholder="Mario Rossi"
      />
      <NumberedField
        n={numbers.email}
        label={t("email")}
        type="email"
        {...form.register(`${path}.email` as const)}
        placeholder="info@acme.com"
      />
      <NumberedField
        n={numbers.telefono}
        label={t("phone")}
        {...form.register(`${path}.telefono` as const)}
        placeholder="+39 02 1234567"
      />
    </div>
  );
}

/* ───────── Numbered input field ───────── */
type NumberedFieldProps = React.InputHTMLAttributes<HTMLInputElement> & {
  n: number;
  label: string;
  required?: boolean;
  error?: string | false | undefined;
};

const NumberedField = React.forwardRef<HTMLInputElement, NumberedFieldProps>(
  function NumberedField(
    { n, label, required, error, className, id, ...rest },
    ref,
  ) {
    const autoId = useId();
    const fieldId = id ?? autoId;
    return (
      <div className={"space-y-1.5 " + (className ?? "")}>
        <Label htmlFor={fieldId} className="flex items-start gap-1 leading-tight">
          <sup className="mt-[1px] text-[8px] font-semibold leading-none text-muted-foreground">
            {n}
          </sup>
          <span>
            {label}
            {required && <span className="ml-0.5 text-destructive">*</span>}
          </span>
        </Label>
        <Input id={fieldId} ref={ref} {...rest} />
        {error && <p className="text-xs text-destructive">{error}</p>}
      </div>
    );
  },
);

/* ───────── Numbered textarea ───────── */
type NumberedTextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  n: number;
  label: string;
  required?: boolean;
};

const NumberedTextarea = React.forwardRef<
  HTMLTextAreaElement,
  NumberedTextareaProps
>(function NumberedTextarea(
  { n, label, required, className, id, ...rest },
  ref,
) {
  const autoId = useId();
  const fieldId = id ?? autoId;
  return (
    <div className={"space-y-1.5 " + (className ?? "")}>
      <Label htmlFor={fieldId} className="flex items-start gap-1 leading-tight">
        <sup className="mt-[1px] text-[8px] font-semibold leading-none text-muted-foreground">
          {n}
        </sup>
        <span>
          {label}
          {required && <span className="ml-0.5 text-destructive">*</span>}
        </span>
      </Label>
      <Textarea id={fieldId} ref={ref} {...rest} />
    </div>
  );
});

/* ───────── Attendees block (per side: mfg | cli) ───────── */
type FieldArrayReturn = {
  fields: Array<{ id: string } & FormValues["presenti"][number]>;
  append: (v: FormValues["presenti"][number]) => void;
  remove: (idx: number) => void;
};

function AttendeesBlock({
  form,
  fields,
  append,
  remove,
  side,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: any;
  fields: FieldArrayReturn["fields"];
  append: FieldArrayReturn["append"];
  remove: FieldArrayReturn["remove"];
  side: "mfg" | "cli";
}) {
  const { t } = useI18n();
  const partyPath = side === "mfg" ? "produttore" : "cliente";
  const companyName: string =
    form.watch(`${partyPath}.ragioneSociale`) || "";
  const titleBase =
    side === "mfg" ? t("manufacturerTitle") : t("customerTitle");
  const title = companyName ? `${titleBase} — ${companyName}` : titleBase;

  // Keep azienda in sync with party.ragioneSociale for this side
  React.useEffect(() => {
    fields.forEach((f, idx) => {
      if (f.side !== side) return;
      const current = form.getValues(`presenti.${idx}.azienda`);
      if (current !== companyName) {
        form.setValue(`presenti.${idx}.azienda`, companyName, {
          shouldDirty: false,
        });
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [companyName, fields.length]);

  // Indices of attendees belonging to this side, with local 1-based number
  const rows = fields
    .map((f, idx) => ({ f, idx }))
    .filter(({ f }) => f.side === side);

  const sideCount = rows.length;

  const handleAdd = () => {
    append({
      id: `att-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      nome: "",
      ruolo: "",
      azienda: companyName,
      side,
    });
  };

  const labelIdBase =
    side === "mfg" ? LABELS.manufacturerTitle.id : LABELS.customerTitle.id;

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <Lbl id={labelIdBase}>{titleBase}</Lbl>
          {companyName && (
            <span className="text-muted-foreground"> — {companyName}</span>
          )}
        </CardTitle>
        <CardDescription>{t("attendeesDesc")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {rows.map(({ f, idx }, localIdx) => {
          const an = attendeeNumbers(idx);
          return (
            <div
              key={f.id}
              className="grid grid-cols-1 items-end gap-3 rounded-md border p-3 sm:grid-cols-[1fr_1fr_auto]"
            >
              <Controller
                control={form.control}
                name={`presenti.${idx}.nome`}
                render={({ field }) => (
                  <NumberedField
                    n={an.nome}
                    label={`${t("attendeeName")} #${localIdx + 1}`}
                    placeholder="Mario Rossi"
                    {...field}
                  />
                )}
              />
              <Controller
                control={form.control}
                name={`presenti.${idx}.ruolo`}
                render={({ field }) => (
                  <NumberedField
                    n={an.ruolo}
                    label={t("attendeeRole")}
                    placeholder="QA Manager"
                    {...field}
                  />
                )}
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => remove(idx)}
                disabled={sideCount <= 1}
                aria-label={t("remove")}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          );
        })}
        <Button type="button" variant="secondary" onClick={handleAdd}>
          <Plus className="mr-1 h-4 w-4" />
          <Lbl id={LABELS.addAttendee.id}>{t("addAttendee")}</Lbl>
        </Button>
      </CardContent>
    </Card>
  );
}


/* ───────── Conclusioni / Final results ───────── */
type YesNo = "" | "si" | "no";
type YesNoNa = "" | "si" | "no" | "na";

function ChoiceGroup<T extends string>({
  value,
  onChange,
  options,
  name,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string }[];
  name: string;
}) {
  return (
    <div className="flex flex-wrap gap-3">
      {options.map((o) => (
        <label
          key={o.value}
          className="flex cursor-pointer items-center gap-1.5 text-sm"
        >
          <input
            type="radio"
            name={name}
            value={o.value}
            checked={value === o.value}
            onChange={() => onChange(o.value)}
            className="h-4 w-4 accent-primary"
          />
          <span>{o.label}</span>
        </label>
      ))}
    </div>
  );
}

function NumberedRow({
  n,
  label,
  children,
}: {
  n: number;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-start gap-1 text-sm font-medium leading-tight">
        <sup className="mt-[1px] text-[8px] font-semibold leading-none text-muted-foreground">
          {n}
        </sup>
        <span>{label}</span>
      </div>
      {children}
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function ConclusioniSection({ form }: { form: any }) {
  const { t } = useI18n();
  const yesNoOpts: { value: YesNo; label: string }[] = [
    { value: "si", label: t("optYes") },
    { value: "no", label: t("optNo") },
  ];
  const yesNoNaOpts: { value: YesNoNa; label: string }[] = [
    { value: "si", label: t("optYes") },
    { value: "no", label: t("optNo") },
    { value: "na", label: t("optNa") },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <Lbl id={LABELS.conclusioniTitle.id}>{t("conclusioniTitle")}</Lbl>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* SERB. ACCETTATO + motivo */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-[auto_1fr] sm:items-start">
          <NumberedRow n={LABELS.serbAccettato.id} label={t("serbAccettato")}>
            <Controller
              control={form.control}
              name="conclusioni.accettato"
              render={({ field }) => (
                <ChoiceGroup
                  name="conclusioni.accettato"
                  value={(field.value ?? "") as YesNo}
                  onChange={field.onChange}
                  options={yesNoOpts}
                />
              )}
            />
          </NumberedRow>
          <NumberedTextarea
            n={LABELS.motivoNonAccettazione.id}
            label={t("motivoNonAccettazione")}
            rows={2}
            {...form.register("conclusioni.motivoNonAccettazione")}
          />
        </div>

        {/* NOTE / REMARKS */}
        <NumberedTextarea
          n={LABELS.noteRilievi.id}
          label={t("noteRilievi")}
          rows={4}
          {...form.register("conclusioni.note")}
        />

        {/* AZIONI CORRETTIVE */}
        <NumberedRow
          n={LABELS.azioniCorrettive.id}
          label={t("azioniCorrettive")}
        >
          <Controller
            control={form.control}
            name="conclusioni.azioniCorrettive"
            render={({ field }) => (
              <ChoiceGroup
                name="conclusioni.azioniCorrettive"
                value={(field.value ?? "") as YesNo}
                onChange={field.onChange}
                options={yesNoOpts}
              />
            )}
          />
        </NumberedRow>

        {/* Data + ispettore esterno / controllo interno */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <NumberedField
            n={LABELS.dataIspezione.id}
            label={t("dataIspezione")}
            type="date"
            {...form.register("conclusioni.dataIspezione")}
          />
          <NumberedField
            n={LABELS.ispettoreEsterno.id}
            label={t("ispettoreEsterno")}
            {...form.register("conclusioni.ispettoreEsterno")}
            placeholder="PPG Coatings Nederland BV"
          />
          <NumberedField
            n={LABELS.controlloInterno.id}
            label={t("controlloInterno")}
            {...form.register("conclusioni.controlloInterno")}
            placeholder="Azzini SpA"
            className="sm:col-span-2"
          />
        </div>

        {/* DOPO AZIONI */}
        <NumberedRow n={LABELS.dopoAzioni.id} label={t("dopoAzioni")}>
          <Controller
            control={form.control}
            name="conclusioni.dopoAzioni"
            render={({ field }) => (
              <ChoiceGroup
                name="conclusioni.dopoAzioni"
                value={(field.value ?? "") as YesNoNa}
                onChange={field.onChange}
                options={yesNoNaOpts}
              />
            )}
          />
        </NumberedRow>

        {/* Data + firma finali */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <NumberedField
            n={LABELS.dataFinale.id}
            label={t("dataFinale")}
            type="date"
            {...form.register("conclusioni.dataFinale")}
          />
          <NumberedField
            n={LABELS.firma.id}
            label={t("firma")}
            {...form.register("conclusioni.firma")}
            placeholder="—"
          />
        </div>
      </CardContent>
    </Card>
  );
}
