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
import DefaultCatchBoundary from "~/components/default-catch-boundary";
import NotFound from "~/components/not-found";
import appCss from "~/styles/app.css?url";
import { Toaster } from "sonner";
import { $getSession } from "~/serverfns/auth";
import { $getIsInstalled } from "~/serverfns/installation";
import { $getLocalization } from "~/serverfns/localization";
import { type I18n } from "@lingui/core";
import { APP_NAME } from "~/contants/app";
import { loadAndActivateLocale } from "~/lib/localization";

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient;
  i18n: I18n;
}>()({
  beforeLoad: async ({ location, context }) => {
    const [session, installed, localization] = await Promise.all([
      $getSession(),
      $getIsInstalled(),
      $getLocalization(),
    ]);

    if (!installed && !location.pathname.startsWith("/install")) {
      throw redirect({ to: "/install" });
    }

    await loadAndActivateLocale(localization.language, context.i18n);

    return {
      user: session?.user || null,
      routeros: session?.routeros || null,
      installed,
      localization,
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
      {
        title: APP_NAME,
      },
      {
        name: "robots",
        content: "noindex, nofollow",
      },
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
  const { localization } = Route.useRouteContext();

  return (
    <html lang={localization.language}>
      <head>
        <HeadContent />
      </head>
      <body>
        <div className="isolate">{children}</div>
        <TanStackRouterDevtools position="bottom-right" />
        <ReactQueryDevtools buttonPosition="bottom-right" />
        <Scripts />
        <Toaster richColors position="bottom-center" />
      </body>
    </html>
  );
}
