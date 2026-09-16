import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/(authed)/app/quick-print/")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/(authed)/app/quick-print/"!</div>;
}
