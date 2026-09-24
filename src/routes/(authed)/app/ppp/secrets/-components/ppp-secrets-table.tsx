import { Trans, useLingui } from "@lingui/react/macro";
import { EditIcon, LockIcon, LockOpenIcon, Trash2Icon } from "lucide-react";
import { useState } from "react";
import Table from "~/components/table";
import Dialog from "~/components/dialog";
import { cn } from "cn";
import { PppService } from "~/contants/ppp";
import UpdatePppSecretForm from "./update-ppp-secret-form";
import {
  useDeletePppSecretMutation,
  useDisablePppSecretMutation,
} from "~/serverfns/ppp-secret";

type Secret = {
  ".id": string;
  name: string;
  service: PppService;
  "caller-id"?: string;
  password?: string;
  profile: string;
  "limit-bytes-in": string;
  "limit-bytes-out": string;
  "last-logged-out": string;
  "local-address"?: string;
  "remote-address"?: string;
  disabled?: "false" | "true";
  comment?: string;
};

function SecretMenu({ secret }: { secret: Secret }) {
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const deletePppSecretMutation = useDeletePppSecretMutation();
  const disablePppSecretMutation = useDisablePppSecretMutation();
  const { t } = useLingui();

  return (
    <div className="flex items-center justify-end gap-0.5">
      <button
        className={cn(
          "flex size-7 items-center justify-center rounded-lg transition-all disabled:pointer-events-none disabled:opacity-50",
          secret.disabled === "false"
            ? "text-neutral-600 hover:bg-neutral-50 hover:text-neutral-700"
            : "text-orange-600 hover:bg-orange-50 hover:text-orange-700",
        )}
        disabled={disablePppSecretMutation.isPending}
        onClick={() => {
          disablePppSecretMutation.mutate({
            data: {
              id: secret[".id"],
              disabled: secret.disabled === "true" ? "false" : "true",
            },
          });
        }}
        title={secret.disabled === "false" ? t`Disable PPP` : t`Enable PPP`}
      >
        {secret.disabled === "false" ? (
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
        <UpdatePppSecretForm
          secret={secret}
          onClose={() => setShowUpdateModal(false)}
        />
      </Dialog>

      <button
        disabled={deletePppSecretMutation.isPending}
        type="button"
        className="flex size-7 items-center justify-center rounded-lg text-red-600 transition-all hover:bg-red-50 hover:text-red-700 disabled:pointer-events-none disabled:opacity-50"
        onClick={() => {
          if (window.confirm(t`Are you sure you want to delete it?`)) {
            deletePppSecretMutation.mutate({
              data: { id: secret[".id"] },
            });
          }
        }}
      >
        <Trash2Icon className="size-4" />
      </button>
    </div>
  );
}

export default function PppSecretsTable({
  secrets,
  searchQuery,
}: {
  secrets: Secret[];
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
            <Trans>Profile</Trans>
          </Table.Th>
          <Table.Th>
            <Trans>Service</Trans>
          </Table.Th>
          <Table.Th>
            <Trans>Caller ID</Trans>
          </Table.Th>
          <Table.Th>
            <Trans>Local Address</Trans>
          </Table.Th>
          <Table.Th>
            <Trans>Remote Address</Trans>
          </Table.Th>
          <Table.Th>
            <Trans>Last Loged Out</Trans>
          </Table.Th>
          <Table.Th>
            <Trans>Comment</Trans>
          </Table.Th>
          <Table.Th></Table.Th>
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>
        {secrets.length ? (
          secrets.map((secret) => {
            return (
              <Table.Tr key={secret[".id"]}>
                <Table.Td className="font-semibold text-foreground">
                  {secret.name}
                </Table.Td>
                <Table.Td>{secret["profile"]}</Table.Td>
                <Table.Td>{secret.service}</Table.Td>
                <Table.Td>{secret["caller-id"]}</Table.Td>
                <Table.Td>{secret["local-address"]}</Table.Td>
                <Table.Td>{secret["remote-address"]}</Table.Td>
                <Table.Td>{secret["last-logged-out"]}</Table.Td>
                <Table.Td>{secret["comment"]}</Table.Td>
                <Table.Td>
                  <SecretMenu secret={secret} />
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
