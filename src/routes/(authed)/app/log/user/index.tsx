import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import Input from "~/components/input";
import RouterosPage from "~/components/routeros-page";
import {
  ensureGetUserLogsQuery,
  useGetUserLogsSuspenseQuery,
} from "~/serverfns/user-log";
import { msg } from "@lingui/core/macro";
import TableContent from "~/components/table-content";
import UserLogTable from "./-components/user-log-table";
import { useLingui } from "@lingui/react/macro";
import DateFilter from "./-components/date-filter";

export const Route = createFileRoute("/(authed)/app/log/user/")({
  validateSearch: (search: { day?: number; month?: number; year?: number }) =>
    search,
  loaderDeps: (d) => d.search,
  component: RouteComponent,
  loader: async ({ context, deps }) => {
    await ensureGetUserLogsQuery({
      queryClient: context.queryClient,
      opts: deps,
    });

    return { title: context.i18n.t(msg`User Log`) };
  },
  head: ({ loaderData }) => ({ meta: [{ title: loaderData?.title }] }),
});

function RouteComponent() {
  const deps = Route.useLoaderDeps();
  const userLogsQuery = useGetUserLogsSuspenseQuery(deps);
  const navigate = Route.useNavigate();
  const { title } = Route.useLoaderData();
  const { t } = useLingui();

  const [searchQuery, setSearchQuery] = useState("");

  const filteredLogs = useMemo(() => {
    const query = searchQuery.trim().toLocaleLowerCase();
    if (!query) return userLogsQuery.data;
    return userLogsQuery.data.filter((log) => {
      return (
        (log.user?.toLowerCase().includes(query) ?? false) ||
        (log.address?.toLowerCase().includes(query) ?? false) ||
        (log.date.toLowerCase().includes(query) ?? false)
      );
    });
  }, [searchQuery, userLogsQuery.data]);

  return (
    <RouterosPage title={title}>
      <TableContent
        filters={
          <>
            <Input
              className="w-sm"
              type="search"
              placeholder={t`Search user logs...`}
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
              }}
            />
            <div className="mx-1 h-8 w-px bg-neutral-200"></div>
            <DateFilter
              value={deps}
              onSubmit={(search) => {
                void navigate({
                  search: search,
                });
              }}
            />
          </>
        }
      >
        <UserLogTable userLogs={filteredLogs} searchQuery={searchQuery} />
      </TableContent>
    </RouterosPage>
  );
}
