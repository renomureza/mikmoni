import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/(authed)/users")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/(authed)/routeros"!</div>;
}
