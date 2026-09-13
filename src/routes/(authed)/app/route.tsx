import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/(authed)/app")({
  component: RouteComponent,
});

function RouteComponent() {
  return <Outlet />;
}
