import { Trans } from "@lingui/react/macro";
import Table from "~/components/table";

type HotspotLog = {
  userIp: string;
  message: string;
  ".id": string;
  time: string;
};

export default function HotspotLogTable({
  hotspotLogs,
  searchQuery,
}: {
  searchQuery?: string;
  hotspotLogs: HotspotLog[];
}) {
  return (
    <Table>
      <Table.Thead>
        <Table.Tr>
          <Table.Th>
            <Trans>Time</Trans>
          </Table.Th>
          <Table.Th>
            <Trans>User</Trans>
          </Table.Th>
          <Table.Th>
            <Trans>Message</Trans>
          </Table.Th>
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>
        {hotspotLogs.length ? (
          hotspotLogs.map((active) => (
            <Table.Tr key={active[".id"]}>
              <Table.Td>{active.time}</Table.Td>
              <Table.Td>{active.userIp}</Table.Td>
              <Table.Td>{active.message}</Table.Td>
            </Table.Tr>
          ))
        ) : (
          <Table.Tr>
            <Table.Td colSpan={3}>
              <Table.Empty query={searchQuery} />
            </Table.Td>
          </Table.Tr>
        )}
      </Table.Tbody>
    </Table>
  );
}
