import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import Input from "~/components/input";
import RouterosPage from "~/components/routeros-page";
import {
  ensureGetReportsQuery,
  useGetReportsSuspenseQuery,
} from "~/serverfns/report";
import { msg } from "@lingui/core/macro";
import TableContent from "~/components/table-content";
import SellingReportTable from "./-components/selling-report-table";
import { useLingui } from "@lingui/react/macro";
import DateFilter from "~/components/date-filter";

export const Route = createFileRoute("/(authed)/app/report/")({
  validateSearch: (search: { day?: number; month?: number; year?: number }) =>
    search,
  loaderDeps: (d) => d.search,
  component: RouteComponent,
  loader: async ({ context, deps }) => {
    await ensureGetReportsQuery({
      queryClient: context.queryClient,
      opts: deps,
    });

    return { title: context.i18n.t(msg`Seling Report`) };
  },
  head: ({ loaderData }) => ({ meta: [{ title: loaderData?.title }] }),
});

function RouteComponent() {
  const deps = Route.useLoaderDeps();
  const reportsQuery = useGetReportsSuspenseQuery(deps);
  const navigate = Route.useNavigate();

  const { title } = Route.useLoaderData();
  const [searchQuery, setSearchQuery] = useState("");
  const { t } = useLingui();

  const filteredReports = useMemo(() => {
    const query = searchQuery.trim().toLocaleLowerCase();
    if (!query) return reportsQuery.data;
    return reportsQuery.data.filter((user) => {
      return (
        user.date.toLowerCase().includes(query) ||
        user.user.toLowerCase().includes(query)
      );
    });
  }, [searchQuery, reportsQuery.data]);

  return (
    <RouterosPage title={title}>
      <TableContent
        filters={
          <>
            <Input
              className="w-sm"
              type="search"
              placeholder={t`Search reports...`}
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
        <SellingReportTable
          reports={filteredReports}
          searchQuery={searchQuery}
        />
      </TableContent>
    </RouterosPage>
  );
}
