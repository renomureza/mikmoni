import { Trans } from "@lingui/react/macro";
import { Trash2Icon } from "lucide-react";
import Table from "~/components/table";
import { useDeleteHotspotCookieMutation } from "~/serverfns/hotspot-cookies";
import { prettifyDuration } from "~/utils/routeros";

type Cookie = {
  ".id": string;
  user: string;
  "mac-address"?: string | undefined;
  domain?: string | undefined;
  "mac-cookie"?: "true" | "false" | undefined;
  "expires-in": "string";
};

function CookieMenuItem({ cookie }: { cookie: Cookie }) {
  const deleteMutation = useDeleteHotspotCookieMutation();

  return (
    <div className="flex items-center justify-end">
      <button
        disabled={deleteMutation.isPending}
        type="button"
        className="flex size-7 items-center justify-center rounded-lg text-red-600 transition-all hover:bg-red-50 hover:text-red-700 disabled:pointer-events-none disabled:opacity-50"
        onClick={() => {
          if (window.confirm("Are you sure you want to delete it?")) {
            deleteMutation.mutate({ data: { id: cookie[".id"] } });
          }
        }}
      >
        <Trash2Icon className="size-4" />
      </button>
    </div>
  );
}

export default function HotspotCookiesTable({
  cookies,
  searchQuery,
}: {
  cookies: Cookie[];
  searchQuery?: string;
}) {
  return (
    <Table>
      <Table.Thead>
        <Table.Tr>
          <Table.Th>
            <Trans>User</Trans>
          </Table.Th>
          <Table.Th>
            <Trans>Mac Address</Trans>
          </Table.Th>
          <Table.Th>
            <Trans>Domain</Trans>
          </Table.Th>
          <Table.Th>
            <Trans>Expires In</Trans>
          </Table.Th>
          <Table.Th></Table.Th>
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>
        {cookies.length ? (
          cookies.map((cookie) => (
            <Table.Tr key={cookie[".id"]}>
              <Table.Td>{cookie.user}</Table.Td>
              <Table.Td>{cookie["mac-address"]}</Table.Td>
              <Table.Td>{cookie.domain}</Table.Td>
              <Table.Td>
                {prettifyDuration(cookie["expires-in"] || "0s")}
              </Table.Td>
              <Table.Td>
                <CookieMenuItem cookie={cookie} />
              </Table.Td>
            </Table.Tr>
          ))
        ) : (
          <Table.Tr>
            <Table.Td colSpan={5}>
              <Table.Empty query={searchQuery} />
            </Table.Td>
          </Table.Tr>
        )}
      </Table.Tbody>
    </Table>
  );
}
