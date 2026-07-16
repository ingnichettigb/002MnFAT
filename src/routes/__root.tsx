import * as React from "react";
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

export const VERIFIED_EMAIL_KEY = "002MnFAT:verifiedEmail";
export const ACTIVATED_KEY = "002MnFAT:activated";
export const LICENSE_ID_KEY = "002MnFAT:licenseId";
export const CONSENT_KEY = "002MnFAT:consent";
const PUBLIC_PATHS = new Set(["/auth"]);
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
      { title: "mini FAT — Verbali di Collaudo" },
      {
        name: "description",
        content:
          "mini FAT: compila e genera in PDF il verbale di Factory Acceptance Test (IT/EN).",
      },
      { name: "author", content: "mini FAT" },
      { property: "og:title", content: "mini FAT — Verbali di Collaudo" },
      {
        property: "og:description",
        content: "mini FAT: compila e genera in PDF il verbale di Factory Acceptance Test (IT/EN).",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:site", content: "@Lovable" },
      { name: "twitter:title", content: "mini FAT — Verbali di Collaudo" },
      { name: "description", content: "mini FAT: compila e genera in PDF il verbale di Factory Acceptance Test (IT/EN)." },
      { property: "og:description", content: "mini FAT: compila e genera in PDF il verbale di Factory Acceptance Test (IT/EN)." },
      { name: "twitter:description", content: "mini FAT: compila e genera in PDF il verbale di Factory Acceptance Test (IT/EN)." },
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
  const [checked, setChecked] = React.useState(false);
  const [allowed, setAllowed] = React.useState(false);

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const isPublic = PUBLIC_PATHS.has(pathname);
    const isActivation = pathname === ACTIVATION_PATH;
    const verified = window.localStorage.getItem(VERIFIED_EMAIL_KEY);
    const activated = window.localStorage.getItem(ACTIVATED_KEY);

    if (isPublic) {
      setAllowed(true);
    } else if (!verified) {
      navigate({ to: "/auth", replace: true });
      setAllowed(false);
    } else if (!activated && !isActivation) {
      navigate({ to: "/attivazione", replace: true });
      setAllowed(false);
    } else {
      setAllowed(true);
    }
    setChecked(true);
  }, [pathname, navigate]);

  if (!checked || !allowed) return null;
  const isPublic = PUBLIC_PATHS.has(pathname);
  return (
    <>
      {!isPublic && (
        <button
          type="button"
          onClick={() => {
            if (typeof window !== "undefined") {
              window.localStorage.removeItem(VERIFIED_EMAIL_KEY);
              window.localStorage.removeItem(ACTIVATED_KEY);
            }
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


