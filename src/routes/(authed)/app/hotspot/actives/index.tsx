import { createFileRoute } from "@tanstack/react-router";
import RouterosPage from "~/components/routeros-page";
import {
  ensureGetHotspotActivesQuery,
  useGetHotspotActivesSuspenseQuery,
} from "~/serverfns/hotspot-active";
import { msg } from "@lingui/core/macro";
import Input from "~/components/input";
import { useMemo, useState } from "react";
import { useLingui } from "@lingui/react/macro";
import HotspotActivesTable from "./-components/hotspot-actives-table";
import TableContent from "~/components/table-content";

export const Route = createFileRoute("/(authed)/app/hotspot/actives/")({
  component: RouteComponent,
  loader: async ({ context }) => {
    await ensureGetHotspotActivesQuery({ queryClient: context.queryClient });
    return { title: context.i18n.t(msg`Hotspot Actives`) };
  },
  head: ({ loaderData }) => ({ meta: [{ title: loaderData?.title }] }),
});

function RouteComponent() {
  const { title } = Route.useLoaderData();
  const { t } = useLingui();
  const hotspotActivesQuery = useGetHotspotActivesSuspenseQuery();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredActives = useMemo(() => {
    const query = searchQuery.trim().toLocaleLowerCase();
    if (!query) return hotspotActivesQuery.data;
    return hotspotActivesQuery.data.filter((user) => {
      return (
        user.user.toLowerCase().includes(query) ||
        (user.address?.toLowerCase().includes(query) ?? false)
      );
    });
  }, [searchQuery, hotspotActivesQuery.data]);

  return (
    <RouterosPage title={title}>
      <TableContent
        filters={
          <Input
            className="w-sm"
            type="search"
            placeholder={t`Search hotspot active...`}
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
            }}
          />
        }
      >
        <HotspotActivesTable
          searchQuery={searchQuery}
          actives={filteredActives}
        />
      </TableContent>
    </RouterosPage>
  );
}
