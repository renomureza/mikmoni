import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/(authed)/app/hotspot/actives")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/(authed)/$routerosId/hotspot/active"!</div>;
}
