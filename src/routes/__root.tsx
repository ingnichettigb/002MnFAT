import * as React from "react";
import { useServerFn } from "@tanstack/react-start";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  useRouterState,
  useNavigate,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";

import appCss from "../styles.css?url";
import { FatProvider } from "@/lib/fat-context";
import { I18nProvider } from "@/lib/i18n";
import { Toaster } from "@/components/ui/sonner";
import { checkLicenseStatus } from "@/lib/license.functions";
import {
  VERIFIED_EMAIL_KEY,
  ACTIVATED_KEY,
  LICENSE_ID_KEY,
  CONSENT_KEY,
  LAST_LICENSE_CHECK_KEY,
  LICENSE_INVALID_REASON_KEY,
  clearGateKeys,
  clearLicenseKeys,
} from "@/lib/app-config";

export {
  VERIFIED_EMAIL_KEY,
  ACTIVATED_KEY,
  LICENSE_ID_KEY,
  CONSENT_KEY,
};
const PUBLIC_PATHS = new Set(["/auth", "/licenza-scaduta"]);
const ACTIVATION_PATH = "/attivazione";
const CONSENT_PATH = "/condizioni";




function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Mini F.A.T. — Verbali di Collaudo" },
      {
        name: "description",
        content:
          "Mini F.A.T.: compila e genera in PDF il verbale di Factory Acceptance Test (IT/EN).",
      },
      { name: "author", content: "Mini F.A.T." },
      { property: "og:title", content: "Mini F.A.T. — Verbali di Collaudo" },
      {
        property: "og:description",
        content: "Mini F.A.T.: compila e genera in PDF il verbale di Factory Acceptance Test (IT/EN).",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:site", content: "@Lovable" },
      { name: "twitter:title", content: "Mini F.A.T. — Verbali di Collaudo" },
      { name: "description", content: "Mini F.A.T.: compila e genera in PDF il verbale di Factory Acceptance Test (IT/EN)." },
      { property: "og:description", content: "Mini F.A.T.: compila e genera in PDF il verbale di Factory Acceptance Test (IT/EN)." },
      { name: "twitter:description", content: "Mini F.A.T.: compila e genera in PDF il verbale di Factory Acceptance Test (IT/EN)." },
      { property: "og:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/0yS65EUwnpUx9OQts7qM6xTJ5vi2/social-images/social-1784016340172-2026_TARGA_MniniFAT.webp" },
      { name: "twitter:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/0yS65EUwnpUx9OQts7qM6xTJ5vi2/social-images/social-1784016340172-2026_TARGA_MniniFAT.webp" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <I18nProvider>
        <FatProvider>
          <AuthGate>
            <Outlet />
          </AuthGate>
          <Toaster position="top-center" richColors />
        </FatProvider>
      </I18nProvider>
    </QueryClientProvider>
  );
}

function AuthGate({ children }: { children: React.ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const statusFn = useServerFn(checkLicenseStatus);
  const [checked, setChecked] = React.useState(false);
  const [allowed, setAllowed] = React.useState(false);

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    let cancelled = false;
    const isPublic = PUBLIC_PATHS.has(pathname);
    const isActivation = pathname === ACTIVATION_PATH;
    const isConsent = pathname === CONSENT_PATH;
    const verified = window.localStorage.getItem(VERIFIED_EMAIL_KEY);
    const activated = window.localStorage.getItem(ACTIVATED_KEY);
    const consent = window.localStorage.getItem(CONSENT_KEY);
    const storedLicenseId = window.localStorage.getItem(LICENSE_ID_KEY);
    const isUuid = (v: string | null): v is string =>
      !!v &&
      /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(
        v,
      );
    // Un valore non-UUID in localStorage (residuo/legacy) va scartato.
    if (storedLicenseId && !isUuid(storedLicenseId)) {
      clearLicenseKeys();
    }
    const licenseId = isUuid(storedLicenseId) ? storedLicenseId : null;
    const activatedOk = licenseId ? activated : null;

    const settle = (value: boolean) => {
      if (cancelled) return;
      setAllowed(value);
      setChecked(true);
    };

    if (isPublic) {
      settle(true);
    } else if (!verified) {
      navigate({ to: "/auth", replace: true });
      settle(false);
    } else if (isConsent) {
      if (!licenseId) {
        window.localStorage.removeItem(ACTIVATED_KEY);
        window.localStorage.removeItem(CONSENT_KEY);
        navigate({ to: "/attivazione", replace: true });
        settle(false);
      } else {
        settle(true);
      }
    } else if (licenseId && !consent && !isActivation) {
      navigate({ to: "/condizioni", replace: true });
      settle(false);
    } else if (!activatedOk && !isActivation) {
      navigate({ to: "/attivazione", replace: true });
      settle(false);
    } else if (!isActivation && activatedOk && licenseId) {
      // Rivalidazione della licenza a OGNI caricamento di pagina protetta.
      setChecked(false);
      void (async () => {
        try {
          const res = await statusFn({ data: { licenseId } });
          if (cancelled) return;
          if (res.valid) {
            window.localStorage.setItem(
              LAST_LICENSE_CHECK_KEY,
              new Date().toISOString(),
            );
            settle(true);
          } else {
            window.localStorage.setItem(
              LICENSE_INVALID_REASON_KEY,
              res.reason ?? "",
            );
            clearLicenseKeys();
            navigate({ to: "/licenza-scaduta", replace: true });
            settle(false);
          }
        } catch (err) {
          // fail-open: nessun blocco per errori tecnici
          console.error("license revalidation error:", err);
          settle(true);
        }
      })();
    } else {
      settle(true);
    }

    return () => {
      cancelled = true;
    };
  }, [pathname, navigate, statusFn]);


  if (!checked || !allowed) return null;
  const isPublic = PUBLIC_PATHS.has(pathname);
  return (
    <>
      {!isPublic && (
        <button
          type="button"
          onClick={() => {
            clearGateKeys();
            navigate({ to: "/auth", replace: true });
          }}
          className="fixed right-3 top-3 z-50 rounded-md border border-input bg-background/80 px-2.5 py-1 text-xs text-muted-foreground shadow-sm backdrop-blur hover:bg-accent"
        >
          Esci
        </button>
      )}
      {children}
    </>
  );
}


