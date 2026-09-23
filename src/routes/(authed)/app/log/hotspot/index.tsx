import { createFileRoute } from "@tanstack/react-router";
import RouterosPage from "~/components/routeros-page";
import {
  ensureGetHotspotLogsQuery,
  useGetHotspotLogsSuspenseQuery,
} from "~/serverfns/hotspot-log";
import { msg } from "@lingui/core/macro";
import TableContent from "~/components/table-content";
import HotspotLogTable from "./-components/hotspot-log-table";
import Input from "~/components/input";
import { useMemo, useState } from "react";
import { useLingui } from "@lingui/react/macro";

export const Route = createFileRoute("/(authed)/app/log/hotspot/")({
  component: RouteComponent,
  loader: async ({ context }) => {
    await ensureGetHotspotLogsQuery({ queryClient: context.queryClient });
    return { title: context.i18n.t(msg`Hotspot Log`) };
  },
  head: ({ loaderData }) => ({ meta: [{ title: loaderData?.title }] }),
});

function RouteComponent() {
  const hotspotLogsQuery = useGetHotspotLogsSuspenseQuery();
  const { title } = Route.useLoaderData();
  const { t } = useLingui();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredLogs = useMemo(() => {
    const query = searchQuery.trim().toLocaleLowerCase();
    if (!query) return hotspotLogsQuery.data;
    return hotspotLogsQuery.data.filter((user) => {
      return (
        user.time.toLowerCase().includes(query) ||
        (user.userIp.toLowerCase().includes(query) ?? false) ||
        (user.message.toLowerCase().includes(query) ?? false)
      );
    });
  }, [searchQuery, hotspotLogsQuery.data]);

  return (
    <RouterosPage title={title}>
      <TableContent
        filters={
          <Input
            className="w-sm"
            type="search"
            placeholder={t`Search hotspot logs...`}
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
            }}
          />
        }
      >
        <HotspotLogTable searchQuery={searchQuery} hotspotLogs={filteredLogs} />
      </TableContent>
    </RouterosPage>
  );
}
