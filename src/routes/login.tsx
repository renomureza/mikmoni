import { Trans } from "@lingui/react/macro";
import { createFileRoute, redirect } from "@tanstack/react-router";
import Button from "~/components/button";
import InlineError from "~/components/inline-error";
import Input from "~/components/input";
import { useLoginMutation } from "~/serverfns/auth";

export const Route = createFileRoute("/login")({
  component: RouteComponent,
  loader: ({ context }) => {
    if (context.user) {
      throw redirect({ to: "/" });
    }
  },
});

function RouteComponent() {
  const loginMutation = useLoginMutation();

  return (
    <main className="flex min-h-dvh items-center justify-center">
      <div className="w-full max-w-md space-y-4 rounded-2xl border bg-white p-10">
        <div>
          <h1 className="text-2xl font-semibold">
            <Trans>Welcome Back</Trans>
          </h1>
          <p className="text-neutral-600">
            <Trans>Login to manage your RouterOS</Trans>
          </p>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            loginMutation.mutate({
              data: Object.fromEntries(new FormData(e.currentTarget)) as {
                username: string;
                password: string;
              },
            });
          }}
          className="flex flex-col gap-3"
        >
          <Input
            label={<Trans>Username</Trans>}
            placeholder="admin"
            name="username"
            error={loginMutation.data?.errors?.username?.[0]}
          />
          <Input
            label={<Trans>Password</Trans>}
            name="password"
            placeholder="••••••••••"
            error={loginMutation.data?.errors?.password?.[0]}
            type="password"
          />
          <InlineError message={loginMutation.data?.error} />

          <Button
            isLoading={loginMutation.isPending}
            type="submit"
            className="mt-2 w-full"
          >
            <Trans>Login</Trans>
          </Button>
        </form>
      </div>
    </main>
  );
}
