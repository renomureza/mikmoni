import { Trans } from "@lingui/react/macro";
import Table from "~/components/table";

type UserLog = {
  date: string;
  time: string;
  user?: string;
  address?: string;
  macAddress?: string;
  validity?: string;
  ".id": string;
  owner: string;
};

export default function UserLogTable({
  userLogs,
  searchQuery,
}: {
  searchQuery?: string;
  userLogs: UserLog[];
}) {
  return (
    <Table>
      <Table.Thead>
        <Table.Tr>
          <Table.Th>
            <Trans>Date</Trans>
          </Table.Th>
          <Table.Th>
            <Trans>Time</Trans>
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
            <Trans>Validity</Trans>
          </Table.Th>
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>
        {userLogs.length ? (
          userLogs.map((userLog) => (
            <Table.Tr key={userLog[".id"]}>
              <Table.Td>{userLog.date}</Table.Td>
              <Table.Td>{userLog.time}</Table.Td>
              <Table.Td>{userLog.user}</Table.Td>
              <Table.Td>{userLog.address}</Table.Td>
              <Table.Td>{userLog.macAddress}</Table.Td>
              <Table.Td>{userLog.validity}</Table.Td>
            </Table.Tr>
          ))
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
