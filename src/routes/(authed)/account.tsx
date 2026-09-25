import { createFileRoute } from "@tanstack/react-router";
import { msg } from "@lingui/core/macro";
import SettingCard from "~/components/setting-card";
import { Trans } from "@lingui/react/macro";
import { useUpdateAccountMutation } from "~/serverfns/account";
import Input from "~/components/input";
import { useState } from "react";

export const Route = createFileRoute("/(authed)/account")({
  component: RouteComponent,
  loader: ({ context }) => {
    return { title: context.i18n.t(msg`Account`) };
  },
  head: ({ loaderData }) => ({ meta: [{ title: loaderData?.title }] }),
});

function RouteComponent() {
  const user = Route.useRouteContext({ select: (s) => s.user });
  const { title } = Route.useLoaderData();
  const updateAccountMutation = useUpdateAccountMutation();

  const [name, setName] = useState(user.name);
  const [username, setUsername] = useState(user.username);
  const [password, setPassword] = useState({ current: "", new: "" });

  const isNameDirty = user.name !== name && name;
  const isUsernameDirty = user.username !== username && username;
  const isPasswordDirty = !!(password.current && password.new);

  return (
    <div className="mx-auto w-full max-w-5xl space-y-4">
      <h1 className="text-2xl font-semibold">{title}</h1>
      <div className="space-y-3">
        <SettingCard
          title={<Trans>Name</Trans>}
          description={
            <Trans>Choose your preferred language for the app interface.</Trans>
          }
          isPending={
            updateAccountMutation.isPending &&
            !!updateAccountMutation.variables.data.name
          }
          disabled={!isNameDirty}
          onSave={() => {
            updateAccountMutation.mutate({
              data: { name: name },
            });
          }}
        >
          <Input
            value={name}
            onChange={(e) => {
              setName(e.target.value);
            }}
            error={updateAccountMutation.data?.errors?.name?.[0]}
          />
        </SettingCard>

        <SettingCard
          title={<Trans>Username</Trans>}
          description={
            <Trans>Choose your preferred language for the app interface.</Trans>
          }
          isPending={
            updateAccountMutation.isPending &&
            !!updateAccountMutation.variables.data.username
          }
          disabled={!isUsernameDirty}
          onSave={() => {
            updateAccountMutation.mutate({
              data: { username: username },
            });
          }}
        >
          <Input
            value={username}
            onChange={(e) => {
              setUsername(e.target.value);
            }}
            error={updateAccountMutation.data?.errors?.username?.[0]}
          />
        </SettingCard>

        <SettingCard
          title={<Trans>Password</Trans>}
          description={
            <Trans>Choose your preferred language for the app interface.</Trans>
          }
          isPending={
            updateAccountMutation.isPending &&
            !!(
              updateAccountMutation.variables.data.currentPasswod ||
              updateAccountMutation.variables.data.newPasswod
            )
          }
          disabled={!isPasswordDirty}
          onSave={() => {
            updateAccountMutation.mutate(
              {
                data: {
                  currentPasswod: password.current,
                  newPasswod: password.new,
                },
              },
              {
                onSuccess: (data) => {
                  if (data.success) {
                    setPassword({ new: "", current: "" });
                  }
                },
              },
            );
          }}
        >
          <Input
            label={<Trans>Current password</Trans>}
            value={password.current}
            type="password"
            onChange={(e) => {
              setPassword((prev) => ({ ...prev, current: e.target.value }));
            }}
            error={updateAccountMutation.data?.errors?.currentPasswod?.[0]}
          />
          <Input
            label={<Trans>New password</Trans>}
            value={password.new}
            type="password"
            onChange={(e) => {
              setPassword((prev) => ({ ...prev, new: e.target.value }));
            }}
            error={updateAccountMutation.data?.errors?.newPasswod?.[0]}
          />
        </SettingCard>
      </div>
    </div>
  );
}
