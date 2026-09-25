import { Trans, useLingui } from "@lingui/react/macro";
import { Trash2Icon } from "lucide-react";
import Table from "~/components/table";
import { PppService } from "~/contants/ppp";
import { prettifyDuration } from "~/utils/routeros";
import { useDeletePppActiveMutation } from "~/serverfns/ppp-active";

type Active = {
  ".id": string;
  name: string;
  service: PppService;
  "caller-id": string;
  address: string;
  uptime: string;
};

function ActiveMenu({ active }: { active: Active }) {
  const deletePppActiveMutation = useDeletePppActiveMutation();
  const { t } = useLingui();

  return (
    <div className="flex items-center justify-end gap-0.5">
      <button
        disabled={deletePppActiveMutation.isPending}
        type="button"
        className="flex size-7 items-center justify-center rounded-lg text-red-600 transition-all hover:bg-red-50 hover:text-red-700 disabled:pointer-events-none disabled:opacity-50"
        onClick={() => {
          if (window.confirm(t`Are you sure you want to delete it?`)) {
            deletePppActiveMutation.mutate({
              data: { id: active[".id"] },
            });
          }
        }}
      >
        <Trash2Icon className="size-4" />
      </button>
    </div>
  );
}

export default function PppActivesTable({
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
            <Trans>Name</Trans>
          </Table.Th>
          <Table.Th>
            <Trans>Caller ID</Trans>
          </Table.Th>
          <Table.Th>
            <Trans>Address</Trans>
          </Table.Th>
          <Table.Th>
            <Trans>Uptime</Trans>
          </Table.Th>
          <Table.Th>
            <Trans>Service</Trans>
          </Table.Th>
          <Table.Th></Table.Th>
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>
        {actives.length ? (
          actives.map((active) => {
            return (
              <Table.Tr key={active[".id"]}>
                <Table.Td className="font-semibold text-foreground">
                  {active.name}
                </Table.Td>
                <Table.Td>{active["caller-id"]}</Table.Td>
                <Table.Td>{active.address}</Table.Td>
                <Table.Td>{prettifyDuration(active["uptime"])}</Table.Td>
                <Table.Td>{active["service"]}</Table.Td>
                <Table.Td>
                  <ActiveMenu active={active} />
                </Table.Td>
              </Table.Tr>
            );
          })
        ) : (
          <Table.Tr>
            <Table.Td colSpan={6}>
              <Table.Empty query={searchQuery} />
            </Table.Td>
          </Table.Tr>
        )}
      </Table.Tbody>
    </Table>
  );
}
