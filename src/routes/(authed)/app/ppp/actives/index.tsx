import { createFileRoute } from "@tanstack/react-router";
import { msg } from "@lingui/core/macro";
import RouterosPage from "~/components/routeros-page";
import TableContent from "~/components/table-content";
import {
  ensureGetPppActivesQuery,
  useGetPppActivesSuspenseQuery,
} from "~/serverfns/ppp-active";
import PppActivesTable from "./-components/ppp-actives-table";
import Input from "~/components/input";
import { useLingui } from "@lingui/react/macro";
import { useMemo, useState } from "react";

export const Route = createFileRoute("/(authed)/app/ppp/actives/")({
  component: RouteComponent,
  loader: async ({ context }) => {
    await ensureGetPppActivesQuery({
      queryClient: context.queryClient,
    });
    return { title: context.i18n.t(msg`PPP Actives`) };
  },
  head: ({ loaderData }) => ({ meta: [{ title: loaderData?.title }] }),
});

function RouteComponent() {
  const { title } = Route.useLoaderData();
  const { t } = useLingui();
  const [searchQuery, setSearchQuery] = useState("");
  const pppActivesQuery = useGetPppActivesSuspenseQuery();

  const filteredActives = useMemo(() => {
    const query = searchQuery.trim().toLocaleLowerCase();
    if (!query) return pppActivesQuery.data;
    return pppActivesQuery.data.filter((active) => {
      return (
        active.name.toLowerCase().includes(query) ||
        (active.address.toLowerCase().includes(query) ?? false)
      );
    });
  }, [searchQuery, pppActivesQuery.data]);

  return (
    <RouterosPage title={title}>
      <TableContent
        filters={
          <Input
            className="w-sm"
            type="search"
            placeholder={t`Search actives...`}
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
            }}
          />
        }
      >
        <PppActivesTable actives={filteredActives} />
      </TableContent>
    </RouterosPage>
  );
}
