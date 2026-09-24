import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/(authed)/app/ppp/profiles/")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/(authed)/app/ppp/profiles/"!</div>;
}
