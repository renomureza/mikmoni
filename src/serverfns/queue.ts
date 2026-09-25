import {
  keepPreviousData,
  QueryClient,
  queryOptions,
  useQuery,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { createServerFn, useServerFn } from "@tanstack/react-start";
import { routerosMiddleware } from "~/middlewares/auth";

type IpPool = {
  ".id": string;
  name: string;
};

const $getSimpleQueues = createServerFn()
  .middleware([routerosMiddleware])
  .handler(async ({ context }) => {
    const simpleQueues = (await context.routerosClient.write(
      "/queue/simple/print",
      { ".proplist": ".id,name" },
    )) as IpPool[];

    return simpleQueues;
  });

function getSimpleQueuesQueryOptions({
  queryFn,
}: {
  queryFn: (
    ...args: Parameters<typeof $getSimpleQueues>
  ) => ReturnType<typeof $getSimpleQueues>;
}) {
  return queryOptions({
    queryKey: ["routeros", "simple-queue"],
    queryFn: () => queryFn(),
    placeholderData: keepPreviousData,
  });
}

export function useGetSimpleQueuesQuery() {
  const query = useServerFn($getSimpleQueues);
  return useQuery(getSimpleQueuesQueryOptions({ queryFn: query }));
}

export function ensureGetSimpleQueuesQueryData({
  queryClient,
}: {
  queryClient: QueryClient;
}) {
  return queryClient.query(
    getSimpleQueuesQueryOptions({ queryFn: $getSimpleQueues }),
  );
}

export function useGetSimpleQueuesSuspenseQuery() {
  const getter = useServerFn($getSimpleQueues);
  return useSuspenseQuery(getSimpleQueuesQueryOptions({ queryFn: getter }));
}
