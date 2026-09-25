import { createFileRoute } from "@tanstack/react-router";
import {
  ChevronDownIcon,
  PrinterIcon,
  UserGroupIcon,
  UserPlusIcon,
} from "lucide-react";
import { useMemo, useState } from "react";
import Button from "~/components/button";
import Dialog from "~/components/dialog";
import {
  ensureGetHotspotUserCommentsQuery,
  ensureGetHotspotUsersQuery,
  useGetHotspotUserCommentsSuspenseQuery,
  useGetHotspotUsersSuspenseQuery,
} from "~/serverfns/hotspot-users";
import GenerateHotspotUserForm from "./-components/generate-hotspot-user-form";
import Input from "~/components/input";
import { useGetHotspotUserProfilesQuery } from "~/serverfns/hotspot-user-profiles";
import ComboboxSingle from "~/components/combobox-single";
import PrintButton from "./-components/print-button";
import CreateHotspotUserForm from "./-components/create-hotspot-user-form";
import { msg } from "@lingui/core/macro";
import { Trans, useLingui } from "@lingui/react/macro";
import HotspotUserTable from "./-components/hotspot-user-table";
import RouterosPage from "~/components/routeros-page";
import TableContent from "~/components/table-content";

export const Route = createFileRoute("/(authed)/app/hotspot/users/")({
  validateSearch: (search: { profile?: string; comment?: string }) => search,
  loaderDeps: ({ search }) => search,
  component: RouteComponent,
  loader: async ({ context, deps }) => {
    await Promise.all([
      ensureGetHotspotUsersQuery({
        queryClient: context.queryClient,
        opts: deps,
      }),
      ensureGetHotspotUserCommentsQuery({
        queryClient: context.queryClient,
      }),
    ]);

    return { title: context.i18n.t(msg`Hotspot Users`) };
  },
  head: ({ loaderData }) => ({ meta: [{ title: loaderData?.title }] }),
});

function RouteComponent() {
  const { t } = useLingui();
  const loaderDeps = Route.useLoaderDeps();
  const hotspotUsersQuery = useGetHotspotUsersSuspenseQuery(loaderDeps);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  const hotpostUserProfilesQuery = useGetHotspotUserProfilesQuery();
  const hotpostUserCommentsQuery = useGetHotspotUserCommentsSuspenseQuery();
  const navigate = Route.useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredUsers = useMemo(() => {
    const query = searchQuery.trim().toLocaleLowerCase();
    if (!query) return hotspotUsersQuery.data;
    return hotspotUsersQuery.data.filter((user) => {
      return (
        user.name.toLowerCase().includes(query) ||
        (user.profile?.toLowerCase().includes(query) ?? false) ||
        (user.comment?.toLowerCase().includes(query) ?? false)
      );
    });
  }, [searchQuery, hotspotUsersQuery.data]);

  return (
    <RouterosPage
      title={<Trans>Users</Trans>}
      actions={
        <>
          <Dialog
            rootProps={{
              open: showAddModal,
              onOpenChange: setShowAddModal,
            }}
            title={t`Create User`}
            triggerProps={{
              render: (props) => (
                <Button type="button" {...props} variant="outline">
                  <UserPlusIcon className="size-4" /> <Trans>Create</Trans>
                </Button>
              ),
            }}
          >
            <CreateHotspotUserForm onCancel={() => setShowAddModal(false)} />
          </Dialog>
          <Dialog
            rootProps={{
              open: showGenerateModal,
              onOpenChange: setShowGenerateModal,
            }}
            title={t`Generate Users`}
            triggerProps={{
              render: (
                <Button type="button">
                  <UserGroupIcon className="size-4" /> <Trans>Generate</Trans>
                </Button>
              ),
            }}
          >
            <GenerateHotspotUserForm
              onCancel={() => setShowGenerateModal(false)}
            />
          </Dialog>
        </>
      }
    >
      <TableContent
        filters={
          <>
            <Input
              className="w-sm"
              type="search"
              placeholder={t`Search users...`}
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
              }}
            />
            <ComboboxSingle
              placeholder={t`Select profile...`}
              className="w-50"
              options={[
                ...(hotpostUserProfilesQuery.data?.map((profile) => ({
                  label: profile.name,
                  value: profile.name,
                })) ?? []),
              ]}
              value={loaderDeps.profile ?? null}
              onChange={(profile) => {
                void navigate({
                  search: (prev) => ({
                    ...prev,
                    profile: profile || undefined,
                  }),
                });
              }}
            />
            <ComboboxSingle
              placeholder={t`Select comment...`}
              className="w-50"
              options={
                hotpostUserCommentsQuery.data?.map((comment) => ({
                  label: comment,
                  value: comment,
                })) ?? []
              }
              value={loaderDeps.comment ?? null}
              onChange={(comment) => {
                void navigate({
                  search: (prev) => ({
                    ...prev,
                    comment: comment || undefined,
                  }),
                });
              }}
            />
            <PrintButton
              className="flex h-9 items-center gap-2 rounded-lg border border-blue-50 bg-blue-100 px-3 font-medium text-blue-600 disabled:pointer-events-none disabled:opacity-50"
              disabled={!loaderDeps.comment}
              onClickTemplate={(templateId) => {
                void navigate({
                  reloadDocument: true,
                  to: "/app/print/$templateId",
                  params: { templateId: String(templateId) },
                  search: { comment: loaderDeps.comment! },
                });
              }}
            >
              <div className="inline-flex items-center gap-2">
                <PrinterIcon className="size-4" /> <Trans>Print</Trans>
              </div>
              <ChevronDownIcon className="size-3.5" />
            </PrintButton>
          </>
        }
      >
        <HotspotUserTable
          searchQuery={searchQuery}
          users={filteredUsers}
          onClickComment={(comment) => {
            void navigate({
              search: (prev) => ({
                ...prev,
                comment: comment,
              }),
            });
          }}
        />
      </TableContent>
    </RouterosPage>
  );
}
