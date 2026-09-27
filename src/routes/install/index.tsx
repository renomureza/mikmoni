import { createFileRoute, redirect } from "@tanstack/react-router";
import { useState } from "react";
import Input from "~/components/input";
import Select from "~/components/select";
import { currencies, Currency, Language, languages } from "~/contants/locale";
import { useInstallMutation } from "~/serverfns/installation";
import SectionForm from "./-components/section-form";
import InlineError from "~/components/inline-error";
import { Trans, useLingui } from "@lingui/react/macro";
import type { NonNullableFields } from "~/utils/types";

export const Route = createFileRoute("/install/")({
  component: RouteComponent,
  beforeLoad: ({ context }) => {
    if (context.installed) {
      throw redirect({ to: "/" });
    }
  },
});

type Data = {
  language: Language | null;
  currency: Currency | null;
  name: string;
  username: string;
  password: string;
};

function RouteComponent() {
  const [step, setStep] = useState(0);
  const [data, setData] = useState<Data>({
    language: null,
    currency: null,

    name: "",
    username: "",
    password: "",
  });

  const installMutation = useInstallMutation();
  const { t } = useLingui();

  return (
    <div className="flex min-h-dvh items-center justify-center p-4">
      <div className="flex w-full max-w-md flex-col justify-center space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-center text-2xl font-semibold">
            <Trans>Install</Trans>
          </h1>
          {!!Object.values(installMutation.data?.errors ?? {}).length && (
            <InlineError
              message={<Trans>One or more fields are invalid.</Trans>}
            />
          )}
        </div>

        <div className="flex w-full items-center justify-center">
          {step === 0 ? (
            <SectionForm
              title={<Trans>Localization</Trans>}
              description={
                <Trans>
                  Choose the display language and default currency used across
                  the app. You can change these later in settings.
                </Trans>
              }
              onSubmit={() => {
                setStep((prev) => prev + 1);
              }}
              secondaryAction={{ disabled: true, onClick: () => {} }}
              primaryAction={{ children: <Trans>Next</Trans> }}
            >
              <Select
                required
                placeholder={t`Select language...`}
                label={<Trans>Language</Trans>}
                options={languages}
                value={data.language}
                onChange={(val) => {
                  setData((prev) => ({ ...prev, language: val }));
                }}
                error={installMutation.data?.errors.language?.[0]}
              />
              <Select
                required
                label={<Trans>Currency</Trans>}
                placeholder={t`Select currency...`}
                options={currencies}
                value={data.currency}
                onChange={(val) => {
                  setData((prev) => ({ ...prev, currency: val }));
                }}
                error={installMutation.data?.errors.currency?.[0]}
              />
            </SectionForm>
          ) : (
            <SectionForm
              title={<Trans>User</Trans>}
              description={
                <Trans>
                  Create the first admin account to sign in and manage this app.
                </Trans>
              }
              onSubmit={() => {
                installMutation.mutate({
                  data: data as NonNullableFields<Data>,
                });
              }}
              secondaryAction={{
                onClick: () => {
                  setStep((prev) => prev - 1);
                },
              }}
              primaryAction={{ children: <Trans>Install</Trans> }}
              isLoading={installMutation.isPending}
            >
              <Input
                required
                label={<Trans>Name</Trans>}
                placeholder={t`Admin`}
                value={data.name}
                onChange={(e) => {
                  setData((prev) => ({ ...prev, name: e.target.value }));
                }}
                error={installMutation.data?.errors.name?.[0]}
              />
              <Input
                required
                label={<Trans>Username</Trans>}
                placeholder={t`admin`}
                value={data.username}
                onChange={(e) => {
                  setData((prev) => ({ ...prev, username: e.target.value }));
                }}
                error={installMutation.data?.errors.username?.[0]}
              />
              <Input
                required
                type="password"
                autoComplete="new-password"
                autoCorrect="off"
                autoCapitalize="none"
                label={<Trans>Password</Trans>}
                value={data.password}
                onChange={(e) => {
                  setData((prev) => ({ ...prev, password: e.target.value }));
                }}
                error={installMutation.data?.errors.password?.[0]}
              />
            </SectionForm>
          )}
        </div>
      </div>
    </div>
  );
}
