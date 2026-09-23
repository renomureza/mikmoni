import { createFileRoute } from "@tanstack/react-router";
import RouterosPage from "~/components/routeros-page";
import {
  ensureGetHotspotCookiesQuery,
  useGetHotspotCookiesSuspenseQuery,
} from "~/serverfns/hotspot-cookies";
import { msg } from "@lingui/core/macro";
import Input from "~/components/input";
import { useLingui } from "@lingui/react/macro";
import { useMemo, useState } from "react";
import HotspotCookiesTable from "./-components/hotspot-cookies-table";
import TableContent from "~/components/table-content";

export const Route = createFileRoute("/(authed)/app/hotspot/cookies/")({
  component: RouteComponent,
  loader: async ({ context }) => {
    await ensureGetHotspotCookiesQuery({ queryClient: context.queryClient });
    return { title: context.i18n.t(msg`Cookies`) };
  },
  head: ({ loaderData }) => ({ meta: [{ title: loaderData?.title }] }),
});

function RouteComponent() {
  const { title } = Route.useLoaderData();
  const { t } = useLingui();

  const hotspotCookiesQuery = useGetHotspotCookiesSuspenseQuery();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredCookies = useMemo(() => {
    const query = searchQuery.trim().toLocaleLowerCase();
    if (!query) return hotspotCookiesQuery.data;
    return hotspotCookiesQuery.data.filter((user) => {
      return (
        user.user.toLowerCase().includes(query) ||
        (user["mac-address"]?.toLowerCase().includes(query) ?? false)
      );
    });
  }, [searchQuery, hotspotCookiesQuery.data]);

  return (
    <RouterosPage title={title}>
      <TableContent
        filters={
          <Input
            className="w-sm"
            type="search"
            placeholder={t`Search users...`}
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
            }}
          />
        }
      >
        <HotspotCookiesTable
          searchQuery={searchQuery}
          cookies={filteredCookies}
        />
      </TableContent>
    </RouterosPage>
  );
}
