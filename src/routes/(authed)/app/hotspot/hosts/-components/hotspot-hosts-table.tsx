import { Trans, useLingui } from "@lingui/react/macro";
import { Trash2Icon } from "lucide-react";
import Table from "~/components/table";
import { useDeleteHotspotHostMutation } from "~/serverfns/hotspot-hosts";

type Host = {
  ".id": string;
  address?: string | undefined;
  "mac-address"?: string | undefined;
  "to-address"?: string | undefined;
  server?: string | undefined;
  comment?: string | undefined;
  DHCP?: "true" | "false" | undefined;
  authorized?: "true" | "false" | undefined;
  bypassed?: "true" | "false" | undefined;
  dynamic?: "true" | "false" | undefined;
};

function HostIndicator({
  host,
}: {
  host: Pick<Host, "authorized" | "DHCP" | "dynamic" | "bypassed">;
}) {
  if (host.authorized === "true" && host.DHCP === "true") {
    return <div title="A - authorized, H - DHCP">A H</div>;
  }

  if (host.authorized === "true" && host.dynamic === "true") {
    return <div title="A - authorized, D - dynamic">A D</div>;
  }

  if (host.authorized === "true") {
    return <div title="A - authorized">A</div>;
  }

  if (host.DHCP === "true") {
    return <div title="H - DHCP">H</div>;
  }

  if (host.dynamic === "true") {
    return <div title="D - dynamic">D</div>;
  }

  if (host.bypassed === "true") {
    return <div title="P - bypassed">P</div>;
  }

  return null;
}

function HostMenuItem({ host }: { host: { ".id": string } }) {
  const deleteMutation = useDeleteHotspotHostMutation();
  const { t } = useLingui();

  return (
    <div className="flex items-center justify-end">
      <button
        disabled={deleteMutation.isPending}
        type="button"
        className="flex size-7 items-center justify-center rounded-lg text-red-600 transition-all hover:bg-red-50 hover:text-red-700 disabled:pointer-events-none disabled:opacity-50"
        onClick={() => {
          if (window.confirm(t`Are you sure you want to delete it?`)) {
            deleteMutation.mutate({ data: { id: host[".id"] } });
          }
        }}
      >
        <Trash2Icon className="size-4" />
      </button>
    </div>
  );
}

export default function HotspotHostsTable({
  hosts,
  searchQuery,
}: {
  hosts: Host[];
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
        {hosts.length ? (
          hosts.map((host) => (
            <Table.Tr key={host[".id"]}>
              <Table.Td>
                <HostIndicator host={host} />
              </Table.Td>
              <Table.Td>{host["mac-address"]}</Table.Td>
              <Table.Td>{host.address}</Table.Td>
              <Table.Td>{host["to-address"]}</Table.Td>
              <Table.Td>{host["server"]}</Table.Td>
              <Table.Td>{host["comment"]}</Table.Td>
              <Table.Td>
                <HostMenuItem host={host} />
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
