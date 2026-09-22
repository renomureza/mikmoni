import { createFileRoute } from "@tanstack/react-router";
import { Trash2Icon } from "lucide-react";
import {
  ensureGetHotspotActivesQuery,
  useDeleteHotspotActiveMutation,
  useGetHotspotActivesQuery,
} from "~/serverfns/hotspot-active";
import { formatBytes, formatUptime } from "~/utils/routeros";

export const Route = createFileRoute("/(authed)/app/hotspot/actives")({
  component: RouteComponent,
  loader: async ({ context }) => {
    await ensureGetHotspotActivesQuery({ queryClient: context.queryClient });
  },
});

function ActiveMenuItem({
  hotspotActive,
}: {
  hotspotActive: { ".id": string };
}) {
  const deleteMutation = useDeleteHotspotActiveMutation();

  return (
    <div className="flex items-center justify-end">
      <button
        disabled={deleteMutation.isPending}
        type="button"
        className="flex size-7 items-center justify-center rounded-lg text-red-600 transition-all hover:bg-red-50 hover:text-red-700 disabled:pointer-events-none disabled:opacity-50"
        onClick={() => {
          if (window.confirm("Are you sure you want to delete it?")) {
            deleteMutation.mutate({ data: { id: hotspotActive[".id"] } });
          }
        }}
      >
        <Trash2Icon className="size-4" />
      </button>
    </div>
  );
}

function RouteComponent() {
  const hotspotActivesQuery = useGetHotspotActivesQuery();

  return (
    <div className="w-full space-y-4">
      <div className="flex justify-between">
        <h1 className="text-xl font-semibold">Hotspot Active</h1>
      </div>

      <div className="overflow-hidden rounded-lg border bg-white">
        <table className="w-full text-left [&_tbody_tr:not(:last-child)]:border-b [&_td]:py-1.5 [&_th]:py-2 [&_th]:font-medium [&_th]:text-neutral-500 [&_th,&_td]:px-3 [&_thead]:border-b [&_thead]:bg-neutral-100">
          <thead>
            <tr>
              <th>Server</th>
              <th>User</th>
              <th>Address</th>
              <th>Mac Address</th>
              <th>Uptime</th>
              <th>Bytes In</th>
              <th>Bytes Out</th>
              <th>Time Left</th>
              <th>Login By</th>
              <th>Comment</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {hotspotActivesQuery.data?.length ? (
              hotspotActivesQuery.data.map((active) => (
                <tr key={active[".id"]}>
                  <td>{active.server}</td>
                  <td>{active.user}</td>
                  <td>{active.address}</td>
                  <td>{active["mac-address"]}</td>
                  <td>{formatUptime(active.uptime)}</td>
                  <td>{formatBytes(active["bytes-in"])}</td>
                  <td>{formatBytes(active["bytes-out"])}</td>
                  <td>{active["session-time-left"]}</td>
                  <td>{active["login-by"]}</td>
                  <td>{active["comment"]}</td>
                  <td>
                    <ActiveMenuItem hotspotActive={active} />
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={11}>
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
