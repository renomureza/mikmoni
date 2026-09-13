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
  "build-time": string;
  "factory-software": string;
  "free-memory": string;
  "total-memory": string;
  cpu: string;
  "cpu-count": string;
  "cpu-frequency": string;
  "cpu-load": string;
  "free-hdd-space": string;
  "total-hdd-space": string;
  "write-sect-since-reboot": string;
  "write-sect-total": string;
  "architecture-name": string;
  "board-name": string;
  platform: string;
};

const $getRouterosInfo = createServerFn()
  .middleware([authAndRouterosMiddleware])
  .handler(async ({ context }) => {
    const resource = await context.routeros.client
      .write("/system/resource/print")
      .then((d) => d[0] as Resource);

    console.log(resource);

    return { resource };
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
