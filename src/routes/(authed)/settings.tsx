import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import Button from "~/components/button";
import ComboboxSingle from "~/components/combobox-single";
import { currencies, Currency, Language, languages } from "~/contants/locale";
import {
  useUpdateCurrencyMutation,
  useUpdateLanguageMutation,
} from "~/serverfns/localization";

export const Route = createFileRoute("/(authed)/settings")({
  component: RouteComponent,
});

function RouteComponent() {
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
    <div className="max-w-5xl space-y-4 w-full mx-auto py-6">
      <h1 className="text-2xl font-semibold">Settings</h1>
      <div className="space-y-3">
        <div className="bg-white border rounded-xl overflow-hidden">
          <div className="p-5 space-y-4">
            <div>
              <h2 className="text-base font-medium">Language</h2>
              <p className="text-neutral-500">
                This is the name of your workspace on Dub.
              </p>
            </div>

            <ComboboxSingle
              className="max-w-md"
              options={languages}
              value={language}
              error={updateLanguageMutation.data?.error}
              onChange={(value) => {
                setLanguage(value);
              }}
            />
          </div>
          <div className="border-t py-2 bg-neutral-50 px-5 flex justify-end">
            <Button
              isLoading={updateLanguageMutation.isPending}
              type="button"
              onClick={() => {
                updateLanguageMutation.mutate({
                  data: { language: language! },
                });
              }}
            >
              Save
            </Button>
          </div>
        </div>
        <div className="bg-white border rounded-xl overflow-hidden">
          <div className="p-5 space-y-4">
            <div>
              <h2 className="text-base font-medium">Currency</h2>
              <p className="text-neutral-500">
                This is the name of your workspace on Dub.
              </p>
            </div>

            <ComboboxSingle
              className="max-w-md"
              options={currencies}
              value={currency}
              onChange={(value) => {
                setCurrency(value);
              }}
              error={updateCurrencyMutation.data?.error}
            />
          </div>
          <div className="border-t py-2 bg-neutral-50 px-5 flex justify-end">
            <Button
              type="button"
              isLoading={updateCurrencyMutation.isPending}
              onClick={() => {
                updateCurrencyMutation.mutate({
                  data: { currency: currency! },
                });
              }}
            >
              Save
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
