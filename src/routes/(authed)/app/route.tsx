import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/(authed)/app")({
  component: RouteComponent,
  beforeLoad: ({ context }) => {
    if (!context.routeros) {
      throw redirect({ to: "/" });
    }
  },
});

function RouteComponent() {
  return <Outlet />;
}
