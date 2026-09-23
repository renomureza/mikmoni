import { createFileRoute } from "@tanstack/react-router";
import {
  ensureGetHotspotHostsQuery,
  useGetHotspotHostsSuspenseQuery,
} from "~/serverfns/hotspot-hosts";
import { msg } from "@lingui/core/macro";
import { Trans, useLingui } from "@lingui/react/macro";
import RouterosPage from "~/components/routeros-page";
import Input from "~/components/input";
import HotspotHostsTable from "./-components/hotspot-hosts-table";
import { useMemo, useState } from "react";

export const Route = createFileRoute("/(authed)/app/hotspot/hosts/")({
  component: RouteComponent,
  loader: async ({ context }) => {
    await ensureGetHotspotHostsQuery({ queryClient: context.queryClient });
    return { title: context.i18n.t(msg`Hotspot Hosts`) };
  },
  head: ({ loaderData }) => ({ meta: [{ title: loaderData?.title }] }),
});

function RouteComponent() {
  const { t } = useLingui();
  const hotspotsHostsQuery = useGetHotspotHostsSuspenseQuery();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredHosts = useMemo(() => {
    const query = searchQuery.trim().toLocaleLowerCase();
    if (!query) return hotspotsHostsQuery.data;
    return hotspotsHostsQuery.data.filter((user) => {
      return (
        (user.address?.toLowerCase().includes(query) ?? false) ||
        (user["mac-address"]?.toLowerCase().includes(query) ?? false) ||
        (user["to-address"]?.toLowerCase().includes(query) ?? false)
      );
    });
  }, [searchQuery, hotspotsHostsQuery.data]);

  return (
    <RouterosPage title={<Trans>Hosts</Trans>}>
      <div className="overflow-hidden rounded-xl border bg-white">
        <div className="flex w-full justify-between gap-2 p-4">
          <Input
            className="w-sm"
            type="search"
            placeholder={t`Search hosts...`}
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
            }}
          />
        </div>

        <div className="max-h-160 w-full overflow-y-auto">
          <HotspotHostsTable searchQuery={searchQuery} hosts={filteredHosts} />
        </div>
      </div>
    </RouterosPage>
  );
}
