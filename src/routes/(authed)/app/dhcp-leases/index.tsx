import { createFileRoute } from "@tanstack/react-router";
import Input from "~/components/input";
import {
  ensureGetDhcpLeasesQuery,
  useGetDhcpLeasesSuspenseQuery,
} from "~/serverfns/dhcp-leases";

export const Route = createFileRoute("/(authed)/app/dhcp-leases/")({
  component: RouteComponent,
  loader: async ({ context }) => {
    await ensureGetDhcpLeasesQuery({ queryClient: context.queryClient });
  },
});

function DhcpLeaseIndicator({ dynamic }: { dynamic: "true" | "false" }) {
  if (dynamic === "true") {
    return <div title={`D - dynamic`}>D</div>;
  }

  return <div title={`S - static`}>S</div>;
}

function RouteComponent() {
  const dhcpLeasesQuery = useGetDhcpLeasesSuspenseQuery();

  return (
    <div className="w-full space-y-4">
      <div className="flex justify-between">
        <h1 className="text-xl font-semibold">User Log</h1>
      </div>

      <div className="space-y-2">
        <div className="flex gap-2">
          <Input placeholder="Search..." className="max-w-70 w-full" />
        </div>
        <div className="bg-white border rounded-lg overflow-hidden">
          <table className="w-full text-left [&_thead]:bg-neutral-100 [&_th]:text-neutral-500 [&_tbody_tr:not(:last-child)]:border-b [&_thead]:border-b [&_th]:font-medium [&_th,&_td]:px-3 [&_th]:py-2 [&_td]:py-1.5">
            <thead>
              <tr>
                <th></th>
                <th>Address</th>
                <th>Mac Address</th>
                <th>Server</th>
                <th>Active Address</th>
                <th>Active Mac Address</th>
                <th>Host Name</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {dhcpLeasesQuery.data?.length ? (
                dhcpLeasesQuery.data.map((dhcpLease) => (
                  <tr key={dhcpLease[".id"]}>
                    <td>
                      <DhcpLeaseIndicator dynamic={dhcpLease.dynamic} />
                    </td>
                    <td>{dhcpLease.address}</td>
                    <td>{dhcpLease["mac-address"]}</td>
                    <td>{dhcpLease.server}</td>
                    <td>{dhcpLease["active-address"]}</td>
                    <td>{dhcpLease["active-mac-address"]}</td>
                    <td>{dhcpLease["host-name"]}</td>
                    <td>{dhcpLease.status}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6}>
                    <div className="flex justify-center items-center min-h-60">
                      <div>No Results Found</div>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
