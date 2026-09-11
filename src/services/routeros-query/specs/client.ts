import { createServerFn, useServerFn } from "@tanstack/react-start";
import { getRouterosSpecs } from "./service";
import { useQuery } from "@tanstack/react-query";

const $getRouterosSpecs = createServerFn()
  .validator((d: { routerosId: number }) => d)
  .handler(({ data }) => getRouterosSpecs(data));

export function useGetRouterosSpecsQuery(routerosId: string) {
  const query = useServerFn($getRouterosSpecs);
  return useQuery({
    queryKey: ["routeros", routerosId],
    queryFn: () => query({ data: { routerosId: Number(routerosId) } }),
  });
}
