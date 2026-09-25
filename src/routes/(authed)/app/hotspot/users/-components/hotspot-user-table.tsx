import { Trans, useLingui } from "@lingui/react/macro";
import {
  EditIcon,
  LockIcon,
  LockOpenIcon,
  PrinterIcon,
  SearchIcon,
  Trash2Icon,
} from "lucide-react";
import { useState } from "react";
import Table from "~/components/table";
import { useDeleteHotspotUser } from "~/serverfns/hotspot-server";
import { useDisableHotspotUserMutation } from "~/serverfns/hotspot-users";
import { formatBytes, prettifyDuration } from "~/utils/routeros";
import PrintButton from "./print-button";
import Dialog from "~/components/dialog";
import UpdateHotspotUserForm from "./update-hotspot-user-form";
import { cn } from "cn";

type User = {
  ".id": string;
  server?: string;
  name: string;
  profile?: string;
  "mac-address"?: string;
  "bytes-in": string;
  "bytes-out": string;
  comment?: string;
  uptime: string;
  disabled?: "true" | "false";
};

function UserMenu({ user }: { user: User }) {
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const deleteHotspotUserMutation = useDeleteHotspotUser();
  const disableHotspotUserMutation = useDisableHotspotUserMutation();
  const { t } = useLingui();

  return (
    <div className="flex items-center justify-end gap-0.5">
      <PrintButton
        onClickTemplate={(templateId) => {
          window.open(
            `/app/print/${templateId}?id=${user[".id"]}`,
            "_blank",
            "width=420,height=420",
          );
        }}
        className="flex size-7 items-center justify-center rounded-lg text-neutral-600 transition-all hover:bg-neutral-50 hover:text-neutral-700 data-popup-open:bg-neutral-50 data-popup-open:text-neutral-700"
      >
        <PrinterIcon className="size-4" />
      </PrintButton>
      <button
        className={cn(
          "flex size-7 items-center justify-center rounded-lg transition-all disabled:pointer-events-none disabled:opacity-50",
          user.disabled === "false"
            ? "text-neutral-600 hover:bg-neutral-50 hover:text-neutral-700"
            : "text-orange-600 hover:bg-orange-50 hover:text-orange-700",
        )}
        disabled={disableHotspotUserMutation.isPending}
        onClick={() => {
          disableHotspotUserMutation.mutate({
            data: {
              id: user[".id"],
              disabled: user.disabled === "true" ? "false" : "true",
            },
          });
        }}
        title={user.disabled === "false" ? t`Disable user` : t`Enable user`}
      >
        {user.disabled === "false" ? (
          <LockOpenIcon className="size-4" />
        ) : (
          <LockIcon className="size-4" />
        )}
      </button>
      <Dialog
        rootProps={{
          open: showUpdateModal,
          onOpenChange: setShowUpdateModal,
        }}
        title={t`Update User`}
        triggerProps={{
          className:
            "text-neutral-600 rounded-lg transition-all hover:text-neutral-700 hover:bg-neutral-50 size-7 flex justify-center items-center",
          children: <EditIcon className="size-4" />,
        }}
      >
        <UpdateHotspotUserForm
          user={user}
          onCancel={() => setShowUpdateModal(false)}
        />
      </Dialog>

      <button
        disabled={deleteHotspotUserMutation.isPending}
        type="button"
        className="flex size-7 items-center justify-center rounded-lg text-red-600 transition-all hover:bg-red-50 hover:text-red-700 disabled:pointer-events-none disabled:opacity-50"
        onClick={() => {
          if (window.confirm(t`Are you sure you want to delete it?`)) {
            deleteHotspotUserMutation.mutate({ data: { ".id": user[".id"] } });
          }
        }}
      >
        <Trash2Icon className="size-4" />
      </button>
    </div>
  );
}

export default function HotspotUserTable({
  users,
  onClickComment,
  searchQuery,
}: {
  users: User[];
  onClickComment: (comment: string) => void;
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
            <Trans>Server</Trans>
          </Table.Th>
          <Table.Th>
            <Trans>Profile</Trans>
          </Table.Th>
          <Table.Th>
            <Trans>Mac Address</Trans>
          </Table.Th>
          <Table.Th>
            <Trans>Uptime</Trans>
          </Table.Th>
          <Table.Th>
            <Trans>Bytes In</Trans>
          </Table.Th>
          <Table.Th>
            <Trans>Bytes Out</Trans>
          </Table.Th>
          <Table.Th>
            <Trans>Comment</Trans>
          </Table.Th>
          <Table.Th></Table.Th>
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>
        {users.length ? (
          users.map((user) => {
            const isNotUsed = user.comment && /^(vc-|up-)/.test(user.comment);
            return (
              <Table.Tr key={user[".id"]}>
                <Table.Td className="font-semibold text-foreground">
                  {user.name}
                </Table.Td>
                <Table.Td>{user.server}</Table.Td>
                <Table.Td>{user.profile}</Table.Td>
                <Table.Td>{user["mac-address"]}</Table.Td>
                <Table.Td>{prettifyDuration(user.uptime)}</Table.Td>
                <Table.Td>{formatBytes(user["bytes-in"])}</Table.Td>
                <Table.Td>{formatBytes(user["bytes-out"])}</Table.Td>
                <Table.Td
                  className={
                    isNotUsed ? "font-medium text-foreground" : undefined
                  }
                >
                  {isNotUsed ? (
                    <button
                      type="button"
                      className="inline-flex items-center gap-2"
                      onClick={() => onClickComment(user.comment!)}
                    >
                      <SearchIcon className="size-4" /> {user.comment}
                    </button>
                  ) : (
                    user.comment
                  )}
                </Table.Td>
                <Table.Td>
                  <UserMenu user={user} />
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
