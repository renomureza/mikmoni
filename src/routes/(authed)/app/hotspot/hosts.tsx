import { createFileRoute } from "@tanstack/react-router";
import { Trash2Icon } from "lucide-react";
import {
  ensureGetHotspotHostsQuery,
  useDeleteHotspotHostMutation,
  useGetHotspotHostsSuspenseQuery,
} from "~/serverfns/hotspot-hosts";

export const Route = createFileRoute("/(authed)/app/hotspot/hosts")({
  component: RouteComponent,
  loader: async ({ context }) => {
    await ensureGetHotspotHostsQuery({ queryClient: context.queryClient });
  },
});

function HostMenuItem({ host }: { host: { ".id": string } }) {
  const deleteMutation = useDeleteHotspotHostMutation();

  return (
    <div className="flex items-center justify-end">
      <button
        disabled={deleteMutation.isPending}
        type="button"
        className="flex size-7 items-center justify-center rounded-lg text-red-600 transition-all hover:bg-red-50 hover:text-red-700 disabled:pointer-events-none disabled:opacity-50"
        onClick={() => {
          if (window.confirm("Are you sure you want to delete it?")) {
            deleteMutation.mutate({ data: { id: host[".id"] } });
          }
        }}
      >
        <Trash2Icon className="size-4" />
      </button>
    </div>
  );
}

function HostIndicator({
  host,
}: {
  host: {
    bypassed?: "true" | "false";
    authorized?: "true" | "false";
    DHCP?: "true" | "false";
    dynamic?: "true" | "false";
  };
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

function RouteComponent() {
  const hotspotsHostsQuery = useGetHotspotHostsSuspenseQuery();

  return (
    <div className="w-full space-y-4">
      <div className="flex justify-between">
        <h1 className="text-xl font-semibold">Hosts</h1>
      </div>

      <div className="overflow-hidden rounded-lg border bg-white">
        <table className="w-full text-left [&_tbody_tr:not(:last-child)]:border-b [&_td]:py-1.5 [&_th]:py-2 [&_th]:font-medium [&_th]:text-neutral-500 [&_th,&_td]:px-3 [&_thead]:border-b [&_thead]:bg-neutral-100">
          <thead>
            <tr>
              <th></th>
              <th>Mac Address</th>
              <th>Address</th>
              <th>To Address</th>
              <th>Server</th>
              <th>Comment</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {hotspotsHostsQuery.data?.length ? (
              hotspotsHostsQuery.data.map((host) => (
                <tr key={host[".id"]}>
                  <td>
                    <HostIndicator host={host} />
                  </td>
                  <td>{host["mac-address"]}</td>
                  <td>{host.address}</td>
                  <td>{host["to-address"]}</td>
                  <td>{host["server"]}</td>
                  <td>{host["comment"]}</td>
                  <td>
                    <HostMenuItem host={host} />
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7}>
                  <div className="flex min-h-60 items-center justify-center">
                    <div>No Results Found</div>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
