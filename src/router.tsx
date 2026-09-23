import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { setupRouterSsrQueryIntegration } from "@tanstack/react-router-ssr-query";
import { routeTree } from "./routeTree.gen";
import { DefaultCatchBoundary } from "./components/DefaultCatchBoundary";
import { NotFound } from "./components/NotFound";
import { toast } from "sonner";
import { setupI18n } from "@lingui/core";
import { I18nProvider } from "@lingui/react";
import { setupRouterSsrLinguiIntegration } from "./lib/localization/setup";

export function getRouter() {
  const queryClient = new QueryClient({
    defaultOptions: {
      mutations: {
        onError: (e) => {
          toast.error(e.message || "Something went wrong");
        },
      },
    },
  });

  const i18n = setupI18n();

  const router = createRouter({
    routeTree,
    context: { queryClient, i18n },
    defaultPreload: "intent",
    defaultErrorComponent: DefaultCatchBoundary,
    defaultNotFoundComponent: () => <NotFound />,
    Wrap: ({ children }) => {
      return <I18nProvider i18n={i18n}>{children}</I18nProvider>;
    },
  });

  setupRouterSsrLinguiIntegration({
    router,
    i18n,
  });

  setupRouterSsrQueryIntegration({
    router,
    queryClient,
  });

  return router;
}

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof getRouter>;
  }
}
