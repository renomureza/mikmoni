import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/(authed)/app/ppp/secrets/")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/(authed)/app/ppp/secrets/"!</div>;
}
