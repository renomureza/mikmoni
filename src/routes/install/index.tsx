import { createFileRoute, redirect } from "@tanstack/react-router";
import { useState } from "react";
import Input from "~/components/input";
import Select from "~/components/select";
import { currencies, Currency, Language, languages } from "~/contants/locale";
import { useInstallMutation } from "~/serverfns/installation";
import SectionForm from "./-components/section-form";
import InlineError from "~/components/inline-error";

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
  username: string;
  password: string;
};

function RouteComponent() {
  const [step, setStep] = useState(0);
  const [data, setData] = useState<Data>({
    language: null,
    currency: null,

    username: "",
    password: "",
  });

  const installMutation = useInstallMutation();

  return (
    <div className="flex min-h-dvh items-center justify-center">
      <div className="flex w-full max-w-md flex-col justify-center space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-center text-2xl font-semibold">Install</h1>
          {!!Object.values(installMutation.data?.errors ?? {}).length && (
            <InlineError message="One or more fields are invalid." />
          )}
        </div>

        <div className="flex w-full items-center justify-center">
          {step === 0 ? (
            <SectionForm
              title="Localization"
              description="Choose the display language and default currency used across the app. You can change these later in settings."
              onSubmit={() => {
                setStep((prev) => prev + 1);
              }}
              secondaryAction={{ disabled: true, onClick: () => {} }}
              primaryAction={{ children: "Next" }}
            >
              <Select
                required
                placeholder="Select language..."
                label="Language"
                options={languages}
                value={data.language}
                onChange={(val) => {
                  setData((prev) => ({ ...prev, language: val }));
                }}
                error={installMutation.data?.errors.language?.[0]}
              />
              <Select
                required
                label="Currency"
                placeholder="Select currency..."
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
              title="User"
              description="Create the first admin account to sign in and manage this app."
              onSubmit={() => {
                installMutation.mutate({ data: data as any });
              }}
              secondaryAction={{
                onClick: () => {
                  setStep((prev) => prev - 1);
                },
              }}
              primaryAction={{ children: "Install" }}
              isLoading={installMutation.isPending}
            >
              <Input
                required
                label="Username"
                placeholder="admin"
                value={data.username}
                onChange={(e) => {
                  setData((prev) => ({ ...prev, username: e.target.value }));
                }}
                error={installMutation.data?.errors.username?.[0]}
              />
              <Input
                required
                type="password"
                label="Password"
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
