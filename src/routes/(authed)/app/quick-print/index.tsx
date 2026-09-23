import { createFileRoute } from "@tanstack/react-router";
import { PlusIcon } from "lucide-react";
import { useMemo, useState } from "react";
import Button from "~/components/button";
import Dialog from "~/components/dialog";
import {
  ensureGetQuickPrintsQuery,
  useGetQuickPrintsSuspenseQuery,
} from "~/serverfns/quick-print";
import { Trans, useLingui } from "@lingui/react/macro";
import RouterosPage from "~/components/routeros-page";
import { msg } from "@lingui/core/macro";
import Input from "~/components/input";
import CreateQuickPrintForm from "./-components/create-quick-print-form";
import QuickPrintTable from "./-components/quick-print-table";
import TableContent from "~/components/table-content";

export const Route = createFileRoute("/(authed)/app/quick-print/")({
  component: RouteComponent,
  loader: async ({ context }) => {
    await ensureGetQuickPrintsQuery({
      queryClient: context.queryClient,
    });
    return { title: context.i18n.t(msg`Quick Print`) };
  },
  head: ({ loaderData }) => ({ meta: [{ title: loaderData?.title }] }),
});

function RouteComponent() {
  const { title } = Route.useLoaderData();
  const [showAddModal, setShowAddModal] = useState(false);
  const quickPrintsQuery = useGetQuickPrintsSuspenseQuery();

  const { t } = useLingui();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredQuickPrints = useMemo(() => {
    const query = searchQuery.trim().toLocaleLowerCase();
    if (!query) return quickPrintsQuery.data;
    return quickPrintsQuery.data.filter((user) => {
      return (
        user.name.toLowerCase().includes(query) ||
        (user.profile?.toLowerCase().includes(query) ?? false)
      );
    });
  }, [searchQuery, quickPrintsQuery.data]);

  return (
    <RouterosPage
      title={title}
      actions={
        <Dialog
          rootProps={{
            open: showAddModal,
            onOpenChange: setShowAddModal,
          }}
          title={<Trans>Create Quick Print</Trans>}
          triggerProps={{
            render: (props) => (
              <Button type="button" {...props}>
                <PlusIcon className="size-4" /> <Trans>Create</Trans>
              </Button>
            ),
          }}
        >
          <CreateQuickPrintForm onCancel={() => setShowAddModal(false)} />
        </Dialog>
      }
    >
      <TableContent
        filters={
          <Input
            className="w-sm"
            type="search"
            placeholder={t`Search quick print...`}
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
            }}
          />
        }
      >
        <QuickPrintTable
          searchQuery={searchQuery}
          quickPrints={filteredQuickPrints}
        />
      </TableContent>
    </RouterosPage>
  );
}
