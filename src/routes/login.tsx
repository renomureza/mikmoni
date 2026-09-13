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
    <main className="flex justify-center items-center min-h-dvh">
      <div className="max-w-md space-y-4 p-10 w-full bg-white rounded-2xl border">
        <div>
          <h1 className="text-2xl font-semibold">Welcome back</h1>
          <p className="text-neutral-600">Log in to manage your RouterOS.</p>
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
            type="email"
            label="Email"
            placeholder="name@example.com"
            name="email"
            error={loginMutation.data?.errors?.email?.[0]}
          />
          <Input
            label="Password"
            name="password"
            placeholder="••••••••••"
            error={loginMutation.data?.errors?.password?.[0]}
            type="password"
          />
          <InlineError message={loginMutation.data?.error} />

          <Button
            isLoading={loginMutation.isPending}
            type="submit"
            className="w-full mt-2"
          >
            Login
          </Button>
        </form>
      </div>
    </main>
  );
}
