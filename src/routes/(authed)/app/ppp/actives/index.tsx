import { createFileRoute } from "@tanstack/react-router";
import { msg } from "@lingui/core/macro";

export const Route = createFileRoute("/(authed)/app/ppp/actives/")({
  component: RouteComponent,
  loader: async ({ context }) => {
    return { title: context.i18n.t(msg`PPP Actives`) };
  },
  head: ({ loaderData }) => ({ meta: [{ title: loaderData?.title }] }),
});

function RouteComponent() {
  return <div>Hello "/(authed)/app/ppp/actives"!</div>;
}
