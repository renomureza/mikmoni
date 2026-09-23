import { createFileRoute } from "@tanstack/react-router";
import { PlusIcon } from "lucide-react";
import Button from "~/components/button";
import Dialog from "~/components/dialog";
import {
  ensureGetHotspotUserProfilesQueryData,
  useGetHotspotUserProfilesSuspenseQuery,
} from "~/serverfns/hotspot-user-profiles";
import CreateHotspotUserProfileForm from "./-components/create-hotspot-user-profile-form";
import { useMemo, useState } from "react";
import RouterosPage from "~/components/routeros-page";
import { Trans, useLingui } from "@lingui/react/macro";
import { msg } from "@lingui/core/macro";
import Input from "~/components/input";
import HotspotProfileTables from "./-components/hotspot-profiles-table";
import TableContent from "~/components/table-content";

export const Route = createFileRoute("/(authed)/app/hotspot/profiles/")({
  component: RouteComponent,
  loader: async ({ context }) => {
    await ensureGetHotspotUserProfilesQueryData({
      queryClient: context.queryClient,
    });
    return { title: context.i18n.t(msg`User Profiles`) };
  },
  head: ({ loaderData }) => ({ meta: [{ title: loaderData?.title }] }),
});

function RouteComponent() {
  const { title } = Route.useLoaderData();
  const hotspotUserProfilesQuery = useGetHotspotUserProfilesSuspenseQuery();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { t } = useLingui();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredUsers = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return hotspotUserProfilesQuery.data;
    return hotspotUserProfilesQuery.data.filter((profile) =>
      profile.name.toLowerCase().includes(query),
    );
  }, [searchQuery, hotspotUserProfilesQuery.data]);

  return (
    <RouterosPage
      title={title}
      actions={
        <Dialog
          rootProps={{
            open: showCreateModal,
            onOpenChange: setShowCreateModal,
          }}
          title={<Trans>Create Profile</Trans>}
          triggerProps={{
            render: (props) => (
              <Button type="button" {...props}>
                <PlusIcon className="size-4" /> <Trans>Profile</Trans>
              </Button>
            ),
          }}
        >
          <CreateHotspotUserProfileForm
            onClose={() => setShowCreateModal(false)}
          />
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
        <HotspotProfileTables
          profiles={filteredUsers}
          searchQuery={searchQuery}
        />
      </TableContent>
    </RouterosPage>
  );
}
