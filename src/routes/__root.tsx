/// <reference types="vite/client" />
import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRouteWithContext,
  redirect,
} from "@tanstack/react-router";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import * as React from "react";
import type { QueryClient } from "@tanstack/react-query";
import { DefaultCatchBoundary } from "~/components/DefaultCatchBoundary";
import { NotFound } from "~/components/NotFound";
import appCss from "~/styles/app.css?url";
import { seo } from "~/utils/seo";
import { Toaster } from "sonner";
import { $getSession } from "~/serverfns/auth";
import { $getIsInstalled } from "~/serverfns/installation";
import { $getLocalization } from "~/serverfns/localization";
import { IntlProvider } from "react-intl";
import { getLocale } from "~/lib/locale";

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient;
}>()({
  beforeLoad: async ({ location }) => {
    const [session, installed, localization] = await Promise.all([
      $getSession(),
      $getIsInstalled(),
      $getLocalization(),
    ]);

    if (!installed && !location.pathname.startsWith("/install")) {
      throw redirect({ to: "/install" });
    }

    const localeMessages = await getLocale(localization.language);

    return {
      user: session?.user || null,
      routeros: session?.routeros || null,
      installed,
      localization,
      localeMessages,
    };
  },
  head: () => ({
    meta: [
      {
        charSet: "utf-8",
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      ...seo({
        title:
          "TanStack Start | Type-Safe, Client-First, Full-Stack React Framework",
        description: `TanStack Start is a type-safe, client-first, full-stack React framework. `,
      }),
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      {
        rel: "apple-touch-icon",
        sizes: "180x180",
        href: "/apple-touch-icon.png",
      },
      {
        rel: "icon",
        type: "image/png",
        sizes: "32x32",
        href: "/favicon-32x32.png",
      },
      {
        rel: "icon",
        type: "image/png",
        sizes: "16x16",
        href: "/favicon-16x16.png",
      },
      { rel: "manifest", href: "/site.webmanifest", color: "#fffff" },
      { rel: "icon", href: "/favicon.ico" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      {
        rel: "preconnect",
        href: "https://fonts.gstatic.com",
        crossOrigin: "anonymous",
      },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Geist+Mono:ital,wght@0,100..900;1,100..900&family=Geist:ital,wght@0,100..900;1,100..900&display=swap",
      },
    ],
  }),
  errorComponent: (props) => {
    return (
      <RootDocument>
        <DefaultCatchBoundary {...props} />
      </RootDocument>
    );
  },
  notFoundComponent: () => <NotFound />,
  component: RootComponent,
});

function RootComponent() {
  return (
    <RootDocument>
      <Outlet />
    </RootDocument>
  );
}

function RootDocument({ children }: { children: React.ReactNode }) {
  const { localization, localeMessages } = Route.useRouteContext();

  return (
    <html lang={localization.language}>
      <head>
        <HeadContent />
      </head>
      <body>
        <IntlProvider locale={localization.language} messages={localeMessages}>
          <div className="isolate">{children}</div>
          <TanStackRouterDevtools position="bottom-right" />
          <ReactQueryDevtools buttonPosition="bottom-right" />
          <Scripts />
          <Toaster richColors position="bottom-center" />
        </IntlProvider>
      </body>
    </html>
  );
}
