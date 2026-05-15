import * as React from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useEffect, useId } from "react";
import { Trash2, Plus } from "lucide-react";

import { FatStepper } from "@/components/fat-stepper";
import { Lbl } from "@/components/lbl";
import { useFat, newAttendee } from "@/lib/fat-context";
import { useI18n, LangSwitcher } from "@/lib/i18n";
import { LABELS, attendeeNumbers } from "@/lib/fat-numbering";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
});

const schema = z.object({
  produttore: partySchema,
  cliente: partySchema,
  numeroDisegno: z.string().trim().min(1).max(120),
  numeroMatricola: z.string().trim().min(1).max(120),
  tagNumber: z.string().trim().max(120).default(""),
  dataCollaudo: z.string().min(1),
  luogoCollaudo: z.string().trim().min(1).max(200),
  presenti: z.array(attendeeSchema),
});

type FormValues = z.infer<typeof schema>;

function IndexPage() {
  const navigate = useNavigate();
  const { state, setGeneral } = useFat();
  const { t } = useI18n();

  const form = useForm<FormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(schema) as any,
    defaultValues: state.general as FormValues,
  });

  useEffect(() => {
    form.reset(state.general);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.general.numeroMatricola]);

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
              n={LABELS.testDate.id}
              label={t("testDate")}
              type="date"
              required
              error={form.formState.errors.dataCollaudo?.message && t("required")}
              {...form.register("dataCollaudo")}
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
              className="sm:col-span-2"
            />
          </CardContent>
        </Card>

        {/* Attendees */}
        <Card>
          <CardHeader>
            <CardTitle>
              <Lbl id={LABELS.attendeesTitle.id}>{t("attendeesTitle")}</Lbl>
            </CardTitle>
            <CardDescription>{t("attendeesDesc")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {fields.map((f, idx) => {
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
                        label={t("attendeeName")}
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
                        placeholder="QA Manager — Acme"
                        {...field}
                      />
                    )}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => remove(idx)}
                    disabled={fields.length <= 1}
                    aria-label={t("remove")}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              );
            })}
            <Button
              type="button"
              variant="secondary"
              onClick={() => append(newAttendee())}
            >
              <Plus className="mr-1 h-4 w-4" />
              <Lbl id={LABELS.addAttendee.id}>{t("addAttendee")}</Lbl>
            </Button>
          </CardContent>
        </Card>

        <div className="flex justify-end">
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
