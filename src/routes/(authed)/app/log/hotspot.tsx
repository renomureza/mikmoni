import { createFileRoute } from "@tanstack/react-router";
import {
  ensureGetHotspotLogsQuery,
  useGetHotspotLogsSuspenseQuery,
} from "~/serverfns/hotspot-log";

export const Route = createFileRoute("/(authed)/app/log/hotspot")({
  component: RouteComponent,
  loader: async ({ context }) => {
    await ensureGetHotspotLogsQuery({ queryClient: context.queryClient });
  },
});

function RouteComponent() {
  const hotspotLogsQuery = useGetHotspotLogsSuspenseQuery();

  return (
    <div className="w-full space-y-4">
      <div className="flex justify-between">
        <h1 className="text-xl font-semibold">Hotspot Log</h1>
      </div>

      <div className="overflow-hidden rounded-lg border bg-white">
        <table className="w-full text-left [&_tbody_tr:not(:last-child)]:border-b [&_td]:py-1.5 [&_th]:py-2 [&_th]:font-medium [&_th]:text-neutral-500 [&_th,&_td]:px-3 [&_thead]:border-b [&_thead]:bg-neutral-100">
          <thead>
            <tr>
              <th>Time</th>
              <th>User (IP)</th>
              <th>Message</th>
            </tr>
          </thead>
          <tbody>
            {hotspotLogsQuery.data?.length ? (
              hotspotLogsQuery.data.map((active) => (
                <tr key={active[".id"]}>
                  <td>{active.time}</td>
                  <td>{active.userIp}</td>
                  <td>{active.message}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={3}>
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
