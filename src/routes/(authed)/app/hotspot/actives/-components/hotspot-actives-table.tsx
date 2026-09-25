import { Trans, useLingui } from "@lingui/react/macro";
import { Trash2Icon } from "lucide-react";
import Table from "~/components/table";
import { useDeleteHotspotActiveMutation } from "~/serverfns/hotspot-active";
import { formatBytes, prettifyDuration } from "~/utils/routeros";

type Active = {
  ".id": string;
  server?: string | undefined;
  user: string;
  address?: string | undefined;
  "mac-address"?: string | undefined;
  uptime: string;
  "bytes-in": string;
  "bytes-out": string;
  "session-time-left"?: string | undefined;
  "login-by": string;
  comment?: string | undefined;
};

function ActiveMenuItem({
  hotspotActive,
}: {
  hotspotActive: { ".id": string };
}) {
  const { t } = useLingui();
  const deleteMutation = useDeleteHotspotActiveMutation();

  return (
    <div className="flex items-center justify-end">
      <button
        disabled={deleteMutation.isPending}
        type="button"
        className="flex size-7 items-center justify-center rounded-lg text-red-600 transition-all hover:bg-red-50 hover:text-red-700 disabled:pointer-events-none disabled:opacity-50"
        onClick={() => {
          if (window.confirm(t`Are you sure you want to delete it?`)) {
            deleteMutation.mutate({ data: { id: hotspotActive[".id"] } });
          }
        }}
      >
        <Trash2Icon className="size-4" />
      </button>
    </div>
  );
}

export default function HotspotActivesTable({
  actives,
  searchQuery,
}: {
  actives: Active[];
  searchQuery?: string;
}) {
  return (
    <Table>
      <Table.Thead>
        <Table.Tr>
          <Table.Th>
            <Trans>Server</Trans>
          </Table.Th>
          <Table.Th>
            <Trans>User</Trans>
          </Table.Th>
          <Table.Th>
            <Trans>Address</Trans>
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
            <Trans>Time Left</Trans>
          </Table.Th>
          <Table.Th>
            <Trans>Login By</Trans>
          </Table.Th>
          <Table.Th>
            <Trans>Comment</Trans>
          </Table.Th>
          <Table.Th></Table.Th>
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>
        {actives.length ? (
          actives.map((active) => (
            <Table.Tr key={active[".id"]}>
              <Table.Td>{active.server}</Table.Td>
              <Table.Td>{active.user}</Table.Td>
              <Table.Td>{active.address}</Table.Td>
              <Table.Td>{active["mac-address"]}</Table.Td>
              <Table.Td>{prettifyDuration(active.uptime)}</Table.Td>
              <Table.Td>{formatBytes(active["bytes-in"])}</Table.Td>
              <Table.Td>{formatBytes(active["bytes-out"])}</Table.Td>
              <Table.Td>{active["session-time-left"]}</Table.Td>
              <Table.Td>{active["login-by"]}</Table.Td>
              <Table.Td>{active["comment"]}</Table.Td>
              <Table.Td>
                <ActiveMenuItem hotspotActive={active} />
              </Table.Td>
            </Table.Tr>
          ))
        ) : (
          <Table.Tr>
            <Table.Td colSpan={11}>
              <Table.Empty query={searchQuery} />
            </Table.Td>
          </Table.Tr>
        )}
      </Table.Tbody>
    </Table>
  );
}
