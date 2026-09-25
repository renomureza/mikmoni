import { createFileRoute } from "@tanstack/react-router";
import {
  ensureGetPppProfilesQuery,
  useGetPppProfilesSuspenseQuery,
} from "~/serverfns/ppp-profile";
import { msg } from "@lingui/core/macro";
import { useMemo, useState } from "react";
import { Trans, useLingui } from "@lingui/react/macro";
import RouterosPage from "~/components/routeros-page";
import Dialog from "~/components/dialog";
import Button from "~/components/button";
import { PlusIcon } from "lucide-react";
import TableContent from "~/components/table-content";
import Input from "~/components/input";
import PppProfilesTable from "./-components/ppp-profiles-table";
import CreatePppProfileForm from "./-components/create-ppp-profile-form";

export const Route = createFileRoute("/(authed)/app/ppp/profiles/")({
  component: RouteComponent,
  loader: async ({ context }) => {
    await ensureGetPppProfilesQuery({
      queryClient: context.queryClient,
      opts: { excludeDefault: true },
    });

    return { title: context.i18n.t(msg`PPP Profiles`) };
  },
  head: ({ loaderData }) => ({ meta: [{ title: loaderData?.title }] }),
});

function RouteComponent() {
  const { title } = Route.useLoaderData();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const pppSecretsQuery = useGetPppProfilesSuspenseQuery({
    excludeDefault: true,
  });
  const { t } = useLingui();

  const [searchQuery, setSearchQuery] = useState("");

  const filteredSecrets = useMemo(() => {
    const query = searchQuery.trim().toLocaleLowerCase();
    if (!query) return pppSecretsQuery.data;
    return pppSecretsQuery.data.filter((user) => {
      return user.name.toLowerCase().includes(query);
    });
  }, [searchQuery, pppSecretsQuery.data]);

  return (
    <RouterosPage
      title={title}
      actions={
        <Dialog
          rootProps={{
            open: showCreateModal,
            onOpenChange: setShowCreateModal,
          }}
          title={<Trans>Create PPP Profile</Trans>}
          triggerProps={{
            render: (props) => (
              <Button type="button" {...props}>
                <PlusIcon className="size-4" /> <Trans>Create</Trans>
              </Button>
            ),
          }}
        >
          <CreatePppProfileForm onClose={() => setShowCreateModal(false)} />
        </Dialog>
      }
    >
      <TableContent
        filters={
          <Input
            className="w-sm"
            type="search"
            placeholder={t`Search profiles...`}
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
            }}
          />
        }
      >
        <PppProfilesTable
          profiles={filteredSecrets}
          searchQuery={searchQuery}
        />
      </TableContent>
    </RouterosPage>
  );
}
