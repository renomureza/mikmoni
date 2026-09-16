import {
  keepPreviousData,
  QueryClient,
  queryOptions,
  useQuery,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { createServerFn, useServerFn } from "@tanstack/react-start";
import { authAndRouterosMiddleware } from "~/middlewares/auth";

type Resource = {
  uptime: string;
  version: string;
  model?: string;
  "free-memory": string;
  "total-memory": string;
  "cpu-load": string;
  "free-hdd-space": string;
  "total-hdd-space": string;
  "board-name": string;
};

const $getRouterosInfo = createServerFn()
  .middleware([authAndRouterosMiddleware])
  .handler(async ({ context }) => {
    const [resource, clock] = await Promise.all([
      context.routerosClient
        .write("/system/resource/print", {
          ".proplist":
            "uptime,version,free-memory,total-memory,cpu-load,total-hdd-space,free-hdd-space,board-name,model",
        })
        .then((d) => d[0] as Resource),
      context.routerosClient
        .write("/system/clock/print", {
          ".proplist": "date,time,time-zone-name",
        })
        .then(
          (d) =>
            d[0] as { date: string; time: string; "time-zone-name": string },
        ),
    ]);

    return { resource, clock };
  });

function getRouterosInfoQueryOptions({
  queryFn,
}: {
  queryFn: (
    ...args: Parameters<typeof $getRouterosInfo>
  ) => ReturnType<typeof $getRouterosInfo>;
}) {
  return queryOptions({
    queryKey: ["routeros", "info"],
    queryFn: () => queryFn(),
    placeholderData: keepPreviousData,
  });
}

export function usegetRouterosInfoQuery() {
  const query = useServerFn($getRouterosInfo);
  return useQuery(getRouterosInfoQueryOptions({ queryFn: query }));
}

export function ensureGetRouterosInfoQueryData({
  queryClient,
}: {
  queryClient: QueryClient;
}) {
  return queryClient.query(
    getRouterosInfoQueryOptions({ queryFn: $getRouterosInfo }),
  );
}

export function useGetRouterosInfoSuspenseQuery() {
  const getter = useServerFn($getRouterosInfo);
  return useSuspenseQuery(getRouterosInfoQueryOptions({ queryFn: getter }));
}
