import { useState } from "react";
import Dialog from "~/components/dialog";
import {
  ExpiredModeValue,
  getExpiredModeLabel,
} from "~/contants/hotspot-profile";
import { useDeleteHotspotUserProfile } from "~/serverfns/hotspot-user-profiles";
import UpdateHotspotUserProfileForm from "./update-hotspot-user-profile-form";
import { EditIcon, LockIcon, LockOpenIcon, Trash2Icon } from "lucide-react";
import Table from "~/components/table";
import { Trans, useLingui } from "@lingui/react/macro";

type Profile = {
  expiredMode: ExpiredModeValue;
  price: string;
  sellingPrice: string;
  validity: string;
  lockUsers: boolean;
  ".id": string;
  name: string;
  "shared-users": string;
  "rate-limit"?: string;
  "parent-queue"?: string;
  "address-pool"?: string;
};

function UserProfileMenu({ profile }: { profile: Profile }) {
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const deleteProfileMutation = useDeleteHotspotUserProfile();
  const { t } = useLingui();

  return (
    <div className="flex items-center justify-end gap-0.5">
      <Dialog
        rootProps={{
          open: showUpdateModal,
          onOpenChange: setShowUpdateModal,
        }}
        title={t`Update Profile`}
        triggerProps={{
          className:
            "text-neutral-600 rounded-lg transition-all hover:text-neutral-700 hover:bg-neutral-50 size-7 flex justify-center items-center",
          children: <EditIcon className="size-4" />,
        }}
      >
        <UpdateHotspotUserProfileForm
          onClose={() => setShowUpdateModal(false)}
          profile={profile}
        />
      </Dialog>
      <button
        disabled={deleteProfileMutation.isPending}
        type="button"
        className="flex size-7 items-center justify-center rounded-lg text-red-600 transition-all hover:bg-red-50 hover:text-red-700 disabled:pointer-events-none disabled:opacity-50"
        onClick={() => {
          if (window.confirm(t`Are you sure you want to delete it?`)) {
            deleteProfileMutation.mutate({ data: { ".id": profile[".id"] } });
          }
        }}
      >
        <Trash2Icon className="size-4" />
      </button>
    </div>
  );
}

export default function HotspotProfileTables({
  profiles,
  searchQuery,
}: {
  profiles: Profile[];
  searchQuery?: string;
}) {
  return (
    <Table>
      <Table.Thead>
        <Table.Tr>
          <Table.Th>
            <Trans>Name</Trans>
          </Table.Th>
          <Table.Th>
            <Trans>Shared Users</Trans>
          </Table.Th>
          <Table.Th>
            <Trans>Rate Limit</Trans>
          </Table.Th>
          <Table.Th>
            <Trans>Expired Mode</Trans>
          </Table.Th>
          <Table.Th>
            <Trans>Validity</Trans>
          </Table.Th>
          <Table.Th>
            <Trans>Price</Trans>
          </Table.Th>
          <Table.Th>
            <Trans>Selling Price</Trans>
          </Table.Th>
          <Table.Th>
            <Trans>Lock User</Trans>
          </Table.Th>
          <Table.Th></Table.Th>
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>
        {profiles.length ? (
          profiles.map((profile) => {
            return (
              <Table.Tr key={profile[".id"]}>
                <Table.Td className="font-semibold text-foreground">
                  {profile.name}
                </Table.Td>
                <Table.Td>{profile["shared-users"]}</Table.Td>
                <Table.Td>{profile["rate-limit"]}</Table.Td>
                <Table.Td>{getExpiredModeLabel(profile.expiredMode)}</Table.Td>
                <Table.Td>{profile["validity"]}</Table.Td>
                <Table.Td>{profile["price"]}</Table.Td>
                <Table.Td>{profile["sellingPrice"]}</Table.Td>
                <Table.Td>
                  {profile.lockUsers ? (
                    <LockIcon className="size-4 text-green-600" />
                  ) : (
                    <LockOpenIcon className="size-4 text-neutral-500" />
                  )}
                </Table.Td>
                <Table.Td>
                  <UserProfileMenu profile={profile} />
                </Table.Td>
              </Table.Tr>
            );
          })
        ) : (
          <Table.Tr>
            <Table.Td colSpan={9}>
              <Table.Empty query={searchQuery} />
            </Table.Td>
          </Table.Tr>
        )}
      </Table.Tbody>
    </Table>
  );
}
