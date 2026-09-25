import { Trans } from "@lingui/react/macro";
import Table from "~/components/table";

type Report = {
  price: string;
  date: string;
  time: string;
  user: string;
  profile: string;
  comment: string;
  ".id": string;
  owner: string;
};
export default function SellingReportTable({
  reports,
  searchQuery,
}: {
  reports: Report[];
  searchQuery?: string;
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
            <Trans>Profile</Trans>
          </Table.Th>
          <Table.Th>
            <Trans>Comment</Trans>
          </Table.Th>
          <Table.Th>
            <Trans>Price</Trans>
          </Table.Th>
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>
        {reports.length ? (
          reports.map((report) => (
            <Table.Tr key={report[".id"]}>
              <Table.Td>{report.date}</Table.Td>
              <Table.Td>{report.time}</Table.Td>
              <Table.Td>{report.user}</Table.Td>
              <Table.Td>{report.profile}</Table.Td>
              <Table.Td>{report.comment}</Table.Td>
              <Table.Td>{report.price}</Table.Td>
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
