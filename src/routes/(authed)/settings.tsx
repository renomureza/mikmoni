import { Trans } from "@lingui/react/macro";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import ComboboxSingle from "~/components/combobox-single";
import SettingCard from "~/components/setting-card";
import { currencies, Currency, Language, languages } from "~/contants/locale";
import {
  useUpdateCurrencyMutation,
  useUpdateLanguageMutation,
} from "~/serverfns/localization";
import { msg } from "@lingui/core/macro";

export const Route = createFileRoute("/(authed)/settings")({
  component: RouteComponent,
  loader: ({ context }) => {
    return { title: context.i18n.t(msg`Settings`) };
  },
  head: ({ loaderData }) => ({ meta: [{ title: loaderData?.title }] }),
});

function RouteComponent() {
  const { title } = Route.useLoaderData();
  const localization = Route.useRouteContext({ select: (s) => s.localization });
  const [language, setLanguage] = useState<Language | null>(
    localization.language,
  );
  const [currency, setCurrency] = useState<Currency | null>(
    localization.currency,
  );

  const updateLanguageMutation = useUpdateLanguageMutation();
  const updateCurrencyMutation = useUpdateCurrencyMutation();

  return (
    <div className="mx-auto w-full max-w-5xl space-y-4">
      <h1 className="text-2xl font-semibold">{title}</h1>
      <div className="space-y-3">
        <SettingCard
          title={<Trans>Language</Trans>}
          description={
            <Trans>Choose your preferred language for the app interface.</Trans>
          }
          isPending={updateLanguageMutation.isPending}
          onSave={() => {
            updateLanguageMutation.mutate({
              data: { language: language! },
            });
          }}
        >
          <ComboboxSingle
            options={languages}
            value={language}
            error={updateLanguageMutation.data?.error}
            onChange={(value) => {
              setLanguage(value);
            }}
          />
        </SettingCard>
        <SettingCard
          title={<Trans>Currency</Trans>}
          description={
            <Trans>
              Choose the currency used to display prices across the app.
            </Trans>
          }
          isPending={updateCurrencyMutation.isPending}
          onSave={() => {
            updateCurrencyMutation.mutate({
              data: { currency: currency! },
            });
          }}
        >
          <ComboboxSingle
            options={currencies}
            value={currency}
            onChange={(value) => {
              setCurrency(value);
            }}
            error={updateCurrencyMutation.data?.error}
          />
        </SettingCard>
      </div>
    </div>
  );
}
