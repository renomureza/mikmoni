import type { AnyRouter } from "@tanstack/react-router";
import type { I18n } from "@lingui/core";
import { Fragment } from "react";
import { I18nProvider } from "@lingui/react";

export function setupRouterSsrLinguiIntegration<TRouter extends AnyRouter>({
  router,
  i18n,
}: {
  router: TRouter;
  i18n: I18n;
}) {
  if (router.isServer) {
    router.options.dehydrate = async () => {
      return {
        dehydratedI18n: {
          locale: i18n.locale,
          messages: i18n.messages,
        },
      };
    };
  } else {
    router.options.hydrate = async (dehydrated) => {
      i18n.loadAndActivate({
        locale: dehydrated.dehydratedI18n.locale,
        messages: dehydrated.dehydratedI18n.messages,
      });
    };
  }

  const Wrap = router.options.Wrap || Fragment;

  router.options.Wrap = ({ children }) => {
    return (
      <I18nProvider i18n={i18n}>
        <Wrap>{children}</Wrap>
      </I18nProvider>
    );
  };
}
