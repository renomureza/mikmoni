import { Trans, useLingui } from "@lingui/react/macro";
import { EditIcon, Trash2Icon } from "lucide-react";
import { useState } from "react";
import Table from "~/components/table";
import Dialog from "~/components/dialog";
import UpdatePppProfileForm from "./update-ppp-profile-form";
import { useDeletePppProfileMutation } from "~/serverfns/ppp-profile";

type Profile = {
  ".id": string;
  name: string;
  "rate-limit"?: string;
  "local-address"?: string;
  "remote-address"?: string;
  "only-one": "yes" | "no" | "default";
  comment?: string;
};

function ProfileMenu({ profile }: { profile: Profile }) {
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const deletePppProfileMutation = useDeletePppProfileMutation();
  const { t } = useLingui();

  return (
    <div className="flex items-center justify-end gap-0.5">
      <Dialog
        rootProps={{
          open: showUpdateModal,
          onOpenChange: setShowUpdateModal,
        }}
        title={t`Update PPP Profile`}
        triggerProps={{
          className:
            "text-neutral-600 rounded-lg transition-all hover:text-neutral-700 hover:bg-neutral-50 size-7 flex justify-center items-center",
          children: <EditIcon className="size-4" />,
        }}
      >
        <UpdatePppProfileForm
          profile={profile}
          onClose={() => setShowUpdateModal(false)}
        />
      </Dialog>

      <button
        disabled={deletePppProfileMutation.isPending}
        type="button"
        className="flex size-7 items-center justify-center rounded-lg text-red-600 transition-all hover:bg-red-50 hover:text-red-700 disabled:pointer-events-none disabled:opacity-50"
        onClick={() => {
          if (window.confirm(t`Are you sure you want to delete it?`)) {
            deletePppProfileMutation.mutate({
              data: { id: profile[".id"] },
            });
          }
        }}
      >
        <Trash2Icon className="size-4" />
      </button>
    </div>
  );
}

export default function PppProfilesTable({
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
            <Trans>Rate Limit</Trans>
          </Table.Th>
          <Table.Th>
            <Trans>Local Address</Trans>
          </Table.Th>
          <Table.Th>
            <Trans>Remote Address</Trans>
          </Table.Th>
          <Table.Th>
            <Trans>Only One</Trans>
          </Table.Th>
          <Table.Th>
            <Trans>Comment</Trans>
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
                <Table.Td>{profile["rate-limit"]}</Table.Td>
                <Table.Td>{profile["local-address"]}</Table.Td>
                <Table.Td>{profile["remote-address"]}</Table.Td>
                <Table.Td>{profile["only-one"]}</Table.Td>
                <Table.Td>{profile["comment"]}</Table.Td>
                <Table.Td>
                  <ProfileMenu profile={profile} />
                </Table.Td>
              </Table.Tr>
            );
          })
        ) : (
          <Table.Tr>
            <Table.Td colSpan={7}>
              <Table.Empty query={searchQuery} />
            </Table.Td>
          </Table.Tr>
        )}
      </Table.Tbody>
    </Table>
  );
}
