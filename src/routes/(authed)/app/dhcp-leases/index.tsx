import { createFileRoute } from "@tanstack/react-router";
import Input from "~/components/input";
import RouterosPage from "~/components/routeros-page";
import {
  ensureGetDhcpLeasesQuery,
  useGetDhcpLeasesSuspenseQuery,
} from "~/serverfns/dhcp-leases";
import { msg } from "@lingui/core/macro";
import TableContent from "~/components/table-content";
import { useMemo, useState } from "react";
import { useLingui } from "@lingui/react/macro";
import DhcpLeaseTable from "./-components/dhcp-lease-table";

export const Route = createFileRoute("/(authed)/app/dhcp-leases/")({
  component: RouteComponent,
  loader: async ({ context }) => {
    await ensureGetDhcpLeasesQuery({ queryClient: context.queryClient });
    return { title: context.i18n.t(msg`DHCP Leases`) };
  },
  head: ({ loaderData }) => ({ meta: [{ title: loaderData?.title }] }),
});

function RouteComponent() {
  const { title } = Route.useLoaderData();
  const dhcpLeasesQuery = useGetDhcpLeasesSuspenseQuery();
  const [searchQuery, setSearchQuery] = useState("");
  const { t } = useLingui();

  const filteredDhcpLeases = useMemo(() => {
    const query = searchQuery.trim().toLocaleLowerCase();
    if (!query) return dhcpLeasesQuery.data;
    return dhcpLeasesQuery.data.filter((user) => {
      return (
        user.address.toLowerCase().includes(query) ||
        user.server.toLowerCase().includes(query)
      );
    });
  }, [searchQuery, dhcpLeasesQuery.data]);

  return (
    <RouterosPage title={title}>
      <TableContent
        filters={
          <Input
            className="w-sm"
            type="search"
            placeholder={t`Search DHCP leases...`}
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
            }}
          />
        }
      >
        <DhcpLeaseTable
          dhcpLeases={filteredDhcpLeases}
          searchQuery={searchQuery}
        />
      </TableContent>
    </RouterosPage>
  );
}
