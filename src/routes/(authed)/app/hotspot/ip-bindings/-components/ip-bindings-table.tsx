import { Trans } from "@lingui/react/macro";
import { cn } from "cn";
import { LockIcon, LockOpenIcon, Trash2Icon } from "lucide-react";
import Table from "~/components/table";
import {
  useDeleteIpBindingMutation,
  useDisableIpBindingMutation,
} from "~/serverfns/ip-binding";

type IpBinding = {
  ".id": string;
  address?: string;
  "to-address"?: string;
  "mac-address"?: string;
  server?: string;
  comment?: string;
  type?: "bypassed" | "blocked";
  disabled?: "true" | "false";
};

function IpBindingIndicator({ type }: { type?: "bypassed" | "blocked" }) {
  switch (type) {
    case "bypassed":
      return <div title="P - bypassed">P</div>;
    case "blocked":
      return <div title="B - blocked">B</div>;
    default:
      return null;
  }
}

function IpBindingMenuItem({
  ipBinding,
}: {
  ipBinding: { ".id": string; disabled?: "true" | "false" };
}) {
  const deleteMutation = useDeleteIpBindingMutation();
  const disableMutation = useDisableIpBindingMutation();

  return (
    <div className="flex items-center justify-end gap-0.5">
      <button
        title={ipBinding.disabled === "true" ? "Enable" : "Disable"}
        disabled={deleteMutation.isPending}
        type="button"
        className={cn(
          "flex size-7 items-center justify-center rounded-lg transition-all disabled:pointer-events-none disabled:opacity-50",
          ipBinding.disabled !== "true"
            ? "text-neutral-600 hover:bg-neutral-50 hover:text-neutral-700"
            : "text-yellow-600 hover:bg-yellow-50 hover:text-yellow-700",
        )}
        onClick={() => {
          disableMutation.mutate({
            data: {
              id: ipBinding[".id"],
              disabled: ipBinding.disabled === "true" ? "false" : "true",
            },
          });
        }}
      >
        {ipBinding.disabled === "true" ? (
          <LockIcon className="size-4" />
        ) : (
          <LockOpenIcon className="size-4" />
        )}
      </button>
      <button
        disabled={deleteMutation.isPending}
        type="button"
        className="flex size-7 items-center justify-center rounded-lg text-red-600 transition-all hover:bg-red-50 hover:text-red-700 disabled:pointer-events-none disabled:opacity-50"
        onClick={() => {
          if (window.confirm("Are you sure you want to delete it?")) {
            deleteMutation.mutate({ data: { id: ipBinding[".id"] } });
          }
        }}
      >
        <Trash2Icon className="size-4" />
      </button>
    </div>
  );
}

export default function IpBindingsTable({
  ipBindings,
  searchQuery,
}: {
  ipBindings: IpBinding[];
  searchQuery?: string;
}) {
  return (
    <Table>
      <Table.Thead>
        <Table.Tr>
          <Table.Th></Table.Th>
          <Table.Th>
            <Trans>Mac Address</Trans>
          </Table.Th>
          <Table.Th>
            <Trans>Address</Trans>
          </Table.Th>
          <Table.Th>
            <Trans>To Address</Trans>
          </Table.Th>
          <Table.Th>
            <Trans>Server</Trans>
          </Table.Th>
          <Table.Th>
            <Trans>Comment</Trans>
          </Table.Th>
          <Table.Th></Table.Th>
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>
        {ipBindings.length ? (
          ipBindings.map((ipBinding) => (
            <Table.Tr key={ipBinding[".id"]}>
              <Table.Td>
                <IpBindingIndicator type={ipBinding.type} />
              </Table.Td>
              <Table.Td>{ipBinding["mac-address"]}</Table.Td>
              <Table.Td>{ipBinding.address}</Table.Td>
              <Table.Td>{ipBinding["to-address"]}</Table.Td>
              <Table.Td>{ipBinding["server"]}</Table.Td>
              <Table.Td>{ipBinding["comment"]}</Table.Td>
              <Table.Td>
                <IpBindingMenuItem ipBinding={ipBinding} />
              </Table.Td>
            </Table.Tr>
          ))
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
