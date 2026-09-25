import { Trans } from "@lingui/react/macro";
import Table from "~/components/table";

type DhcpLease = {
  ".id": string;
  address: string;
  "mac-address": string;
  status:
    | "waiting"
    | "testing"
    | "declined"
    | "offered"
    | "bound"
    | "authorizing"
    | "conflict";
  server: string;
  "active-mac-address"?: string | undefined;
  "active-address"?: string | undefined;
  "host-name"?: string | undefined;
  dynamic: "true" | "false";
};

function DhcpLeaseIndicator({ dynamic }: { dynamic: "true" | "false" }) {
  if (dynamic === "true") {
    return <div title={`D - dynamic`}>D</div>;
  }

  return <div title={`S - static`}>S</div>;
}

export default function DhcpLeaseTable({
  dhcpLeases,
  searchQuery,
}: {
  dhcpLeases: DhcpLease[];
  searchQuery?: string;
}) {
  return (
    <Table>
      <Table.Thead>
        <Table.Tr>
          <Table.Th>
            <Trans>Address</Trans>
          </Table.Th>
          <Table.Th>
            <Trans>Mac Address</Trans>
          </Table.Th>
          <Table.Th>
            <Trans>Server</Trans>
          </Table.Th>
          <Table.Th>
            <Trans>Active Mac Address</Trans>
          </Table.Th>
          <Table.Th>
            <Trans>Host Name</Trans>
          </Table.Th>
          <Table.Th>
            <Trans>Status</Trans>
          </Table.Th>
          <Table.Th></Table.Th>
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>
        {dhcpLeases.length ? (
          dhcpLeases.map((dhcpLease) => (
            <Table.Tr key={dhcpLease[".id"]}>
              <Table.Td>
                <DhcpLeaseIndicator dynamic={dhcpLease.dynamic} />
              </Table.Td>
              <Table.Td>{dhcpLease.address}</Table.Td>
              <Table.Td>{dhcpLease["mac-address"]}</Table.Td>
              <Table.Td>{dhcpLease.server}</Table.Td>
              <Table.Td>{dhcpLease["active-address"]}</Table.Td>
              <Table.Td>{dhcpLease["active-mac-address"]}</Table.Td>
              <Table.Td>{dhcpLease["host-name"]}</Table.Td>
              <Table.Td>{dhcpLease.status}</Table.Td>
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
