import { createFileRoute } from "@tanstack/react-router";
import RouterosPage from "~/components/routeros-page";
import {
  ensureGetIpBindingQuery,
  useGetIpBindingSuspenseQuery,
} from "~/serverfns/ip-binding";
import { msg } from "@lingui/core/macro";
import Input from "~/components/input";
import { useMemo, useState } from "react";
import { useLingui } from "@lingui/react/macro";
import IpBindingsTable from "./-components/ip-bindings-table";

export const Route = createFileRoute("/(authed)/app/hotspot/ip-bindings/")({
  component: RouteComponent,
  loader: async ({ context }) => {
    await ensureGetIpBindingQuery({ queryClient: context.queryClient });
    return { title: context.i18n.t(msg`IP Bindings`) };
  },
  head: ({ loaderData }) => ({ meta: [{ title: loaderData?.title }] }),
});

function RouteComponent() {
  const { title } = Route.useLoaderData();
  const { t } = useLingui();
  const ipBindingsQuery = useGetIpBindingSuspenseQuery();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredIpBindings = useMemo(() => {
    const query = searchQuery.trim().toLocaleLowerCase();
    if (!query) return ipBindingsQuery.data;
    return ipBindingsQuery.data.filter((user) => {
      return (
        (user.address?.toLowerCase().includes(query) ?? false) ||
        (user["to-address"]?.toLowerCase().includes(query) ?? false) ||
        (user["mac-address"]?.toLowerCase().includes(query) ?? false)
      );
    });
  }, [searchQuery, ipBindingsQuery.data]);

  return (
    <RouterosPage title={title}>
      <div className="overflow-hidden rounded-xl border bg-white">
        <div className="flex w-full justify-between gap-2 p-4">
          <Input
            className="w-sm"
            type="search"
            placeholder={t`Search IP Bindings...`}
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
            }}
          />
        </div>

        <div className="max-h-160 w-full overflow-y-auto">
          <IpBindingsTable
            ipBindings={filteredIpBindings}
            searchQuery={searchQuery}
          />
        </div>
      </div>
    </RouterosPage>
  );
}
