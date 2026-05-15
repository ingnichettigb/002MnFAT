import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useEffect } from "react";

import { FatStepper } from "@/components/fat-stepper";
import { useFat } from "@/lib/fat-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
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
          "mini FAT: compila e genera il verbale di Factory Acceptance Test in PDF.",
      },
    ],
  }),
  component: IndexPage,
});

const schema = z.object({
  ragioneSociale: z.string().trim().min(1, "Campo obbligatorio").max(200),
  compilatore: z.string().trim().min(1, "Campo obbligatorio").max(120),
  dataCollaudo: z.string().min(1, "Campo obbligatorio"),
  luogoCollaudo: z.string().trim().min(1, "Campo obbligatorio").max(200),
  numeroDisegno: z.string().trim().min(1, "Campo obbligatorio").max(120),
  numeroMatricola: z.string().trim().min(1, "Campo obbligatorio").max(120),
});
type FormValues = z.infer<typeof schema>;

function IndexPage() {
  const navigate = useNavigate();
  const { state, setGeneral } = useFat();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: state.general,
  });

  // Sync once dopo l'idratazione del context da localStorage
  useEffect(() => {
    form.reset(state.general);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.general.ragioneSociale]);

  const onSubmit = (values: FormValues) => {
    setGeneral(values);
    navigate({ to: "/controlli" });
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:py-12">
      <header className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">mini FAT</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Generatore di verbali di Factory Acceptance Test
        </p>
      </header>

      <FatStepper current={1} />

      <Card>
        <CardHeader>
          <CardTitle>Dati Generali del Collaudo</CardTitle>
          <CardDescription>
            Inserisci le informazioni che compariranno nel frontespizio del verbale.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="grid grid-cols-1 gap-5 sm:grid-cols-2"
            >
              <FormField
                control={form.control}
                name="ragioneSociale"
                render={({ field }) => (
                  <FormItem className="sm:col-span-2">
                    <FormLabel>Ragione Sociale Ditta Cliente</FormLabel>
                    <FormControl>
                      <Input placeholder="Es. Acme S.p.A." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="compilatore"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Compilatore / Ispettore</FormLabel>
                    <FormControl>
                      <Input placeholder="Nome e cognome" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="dataCollaudo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data del Collaudo</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="luogoCollaudo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Luogo del Collaudo</FormLabel>
                    <FormControl>
                      <Input placeholder="Città, stabilimento" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="numeroDisegno"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>N° Disegno / Specifica</FormLabel>
                    <FormControl>
                      <Input placeholder="Es. DWG-2025-001" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="numeroMatricola"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>N° Fabbrica / Matricola</FormLabel>
                    <FormControl>
                      <Input placeholder="Es. SN-00123" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="sm:col-span-2 flex justify-end pt-2">
                <Button type="submit">Avanti →</Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
