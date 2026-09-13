import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/(authed)/app/hotspot/hosts")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/(authed)/$routerosId/hotspot/hosts"!</div>;
}
