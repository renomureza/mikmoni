import { createFileRoute, redirect } from "@tanstack/react-router";
import { useIntl } from "react-intl";
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
  const intl = useIntl();

  return (
    <main className="flex min-h-dvh items-center justify-center">
      <div className="w-full max-w-md space-y-4 rounded-2xl border bg-white p-10">
        <div>
          <h1 className="text-2xl font-semibold">
            {intl.formatMessage({ id: "login.title" })}
          </h1>
          <p className="text-neutral-600">
            {intl.formatMessage({ id: "login.description" })}
          </p>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            loginMutation.mutate({
              data: Object.fromEntries(new FormData(e.currentTarget)) as any,
            });
          }}
          className="flex flex-col gap-3"
        >
          <Input
            label={intl.formatMessage({ id: "username" })}
            placeholder="admin"
            name="username"
            error={loginMutation.data?.errors?.username?.[0]}
          />
          <Input
            label={intl.formatMessage({ id: "password" })}
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
            Login
          </Button>
        </form>
      </div>
    </main>
  );
}
