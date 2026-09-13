import { createFileRoute } from "@tanstack/react-router";
import {
  ensureGetRouterosInfoQueryData,
  useGetRouterosInfoSuspenseQuery,
} from "~/serverfns/resource";

export const Route = createFileRoute("/(authed)/app/")({
  component: RouteComponent,
  loader: async ({ context }) => {
    await ensureGetRouterosInfoQueryData({
      queryClient: context.queryClient,
    });
  },
});

function RouteComponent() {
  const routerosInfoQuery = useGetRouterosInfoSuspenseQuery();

  return (
    <div className="max-w-6xl mx-auto w-full py-6">
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white space-y-1 px-6 py-5 rounded-xl">
          <div className="font-medium">System Date & Time</div>
          <div className="">
            <div>Uptime: {routerosInfoQuery.data.resource.version}</div>
            <div>Uptime: {routerosInfoQuery.data.resource.version}</div>
          </div>
        </div>
        <div className="bg-white space-y-1 px-6 py-5 rounded-xl">
          <div className="font-medium">System Date & Time</div>
          <div className="">
            <div>Uptime: {routerosInfoQuery.data.resource.version}</div>
            <div>Uptime: {routerosInfoQuery.data.resource.version}</div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl">
          <div>{routerosInfoQuery.data.resource.version}</div>
        </div>
      </div>
    </div>
  );
}
