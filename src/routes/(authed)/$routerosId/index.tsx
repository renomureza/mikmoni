import { createFileRoute } from "@tanstack/react-router";
import { usegetRouterosInfoQuery } from "~/serverfns/routeros";
import { useGetRouterosSpecsQuery } from "~/services/routeros-query/specs/client";

export const Route = createFileRoute("/(authed)/$routerosId/")({
  component: RouteComponent,
});

function RouteComponent() {
  const routerosId = Route.useParams({ select: (s) => s.routerosId });
  const specsQuery = usegetRouterosInfoQuery(Number(routerosId));

  return (
    <div>
      <div>Dashboard</div>
      <div></div>
    </div>
  );
}
