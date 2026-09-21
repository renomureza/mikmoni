import {
  keepPreviousData,
  QueryClient,
  queryOptions,
  useQuery,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { createServerFn, useServerFn } from "@tanstack/react-start";
import { authAndRouterosMiddleware } from "~/middlewares/auth";

type IpPool = {
  ".id": string;
  name: string;
  ranges: string;
  total: string;
  used: string;
  available: string;
};

const $getIpPools = createServerFn()
  .middleware([authAndRouterosMiddleware])
  .handler(async ({ context }) => {
    const ipPools = (await context.routerosClient.write(
      "/ip/pool/print",
    )) as IpPool[];

    return ipPools;
  });

function getIpPoolsQueryOptions({
  queryFn,
}: {
  queryFn: (
    ...args: Parameters<typeof $getIpPools>
  ) => ReturnType<typeof $getIpPools>;
}) {
  return queryOptions({
    queryKey: ["routeros", "ip-pools"],
    queryFn: () => queryFn(),
    placeholderData: keepPreviousData,
  });
}

export function useGetIpPoolsQuery() {
  const query = useServerFn($getIpPools);
  return useQuery(getIpPoolsQueryOptions({ queryFn: query }));
}

export function ensureGetIpPoolsQueryData({
  queryClient,
}: {
  queryClient: QueryClient;
}) {
  return queryClient.query(getIpPoolsQueryOptions({ queryFn: $getIpPools }));
}

export function useGetIpPoolsSuspenseQuery() {
  const getter = useServerFn($getIpPools);
  return useSuspenseQuery(getIpPoolsQueryOptions({ queryFn: getter }));
}
