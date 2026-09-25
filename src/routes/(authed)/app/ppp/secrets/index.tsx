import { createFileRoute } from "@tanstack/react-router";
import RouterosPage from "~/components/routeros-page";
import { msg } from "@lingui/core/macro";
import TableContent from "~/components/table-content";
import { useMemo, useState } from "react";
import Dialog from "~/components/dialog";
import { Trans, useLingui } from "@lingui/react/macro";
import Button from "~/components/button";
import { PlusIcon } from "lucide-react";
import {
  ensureGetPppSecretsQuery,
  useGetPppSecretsSuspenseQuery,
} from "~/serverfns/ppp-secret";
import CreatePppSecretForm from "./-components/create-ppp-secret-form";
import PppSecretsTable from "./-components/ppp-secrets-table";
import Input from "~/components/input";
import PppProfileCombobox from "~/components/ppp-profile-combobox";

export const Route = createFileRoute("/(authed)/app/ppp/secrets/")({
  validateSearch: (search: { profile?: string }) => search,
  loaderDeps: (search) => search,
  component: RouteComponent,
  loader: async ({ context, deps }) => {
    await ensureGetPppSecretsQuery({
      queryClient: context.queryClient,
      opts: deps.search,
    });

    return { title: context.i18n.t(msg`PPP Secrets`) };
  },
  head: ({ loaderData }) => ({ meta: [{ title: loaderData?.title }] }),
});

function RouteComponent() {
  const { title } = Route.useLoaderData();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const deps = Route.useLoaderDeps({ select: (s) => s.search });
  const pppSecretsQuery = useGetPppSecretsSuspenseQuery(deps);
  const { t } = useLingui();

  const navigate = Route.useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredSecrets = useMemo(() => {
    const query = searchQuery.trim().toLocaleLowerCase();
    if (!query) return pppSecretsQuery.data;
    return pppSecretsQuery.data.filter((user) => {
      return (
        user.name.toLowerCase().includes(query) ||
        (user.profile?.toLowerCase().includes(query) ?? false) ||
        (user.comment?.toLowerCase().includes(query) ?? false)
      );
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
          title={<Trans>Create PPP Secret</Trans>}
          triggerProps={{
            render: (props) => (
              <Button type="button" {...props}>
                <PlusIcon className="size-4" /> <Trans>Create</Trans>
              </Button>
            ),
          }}
        >
          <CreatePppSecretForm onClose={() => setShowCreateModal(false)} />
        </Dialog>
      }
    >
      <TableContent
        filters={
          <>
            <Input
              className="w-sm"
              type="search"
              placeholder={t`Search secrets...`}
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
              }}
            />
            <PppProfileCombobox
              className="w-40"
              value={deps.profile ?? null}
              onChange={(value) => {
                void navigate({
                  search: (prev) => ({ ...prev, profile: value || undefined }),
                });
              }}
            />
          </>
        }
      >
        <PppSecretsTable secrets={filteredSecrets} searchQuery={searchQuery} />
      </TableContent>
    </RouterosPage>
  );
}
