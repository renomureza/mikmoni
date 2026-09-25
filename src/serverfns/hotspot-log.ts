import {
  keepPreviousData,
  QueryClient,
  queryOptions,
  useQuery,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { createServerFn, useServerFn } from "@tanstack/react-start";
import { routerosMiddleware } from "~/middlewares/auth";

type HotspotLog = {
  ".id": string;
  time: string;
  message: string;
};

const $getHotspotLogs = createServerFn()
  .middleware([routerosMiddleware])
  .handler(async ({ context }) => {
    const logs = (await context.routerosClient.write(
      "/log/print",
      {
        ".proplist": ".id,time,message",
      },
      ["topics=hotspot,info,debug", "buffer=disk"],
    )) as HotspotLog[];

    return logs.reverse().map(({ message, ...log }) => {
      const regex = /^(?:->:\s*)?([^\s(]+\s*\([\d.]+\)):\s*(.+)$/;
      const match = message.match(regex);
      const [, userIp, cleanMessage] = match ?? [];
      return { ...log, userIp, message: cleanMessage };
    });
  });

function getHotspotLogQueryOptions({
  queryFn,
}: {
  queryFn: (
    ...args: Parameters<typeof $getHotspotLogs>
  ) => ReturnType<typeof $getHotspotLogs>;
}) {
  return queryOptions({
    queryKey: ["hotspot-log"],
    queryFn: () => queryFn(),
    placeholderData: keepPreviousData,
  });
}

export function useGetHotspotLogsQuery() {
  const query = useServerFn($getHotspotLogs);
  return useQuery(getHotspotLogQueryOptions({ queryFn: query }));
}

export function ensureGetHotspotLogsQuery({
  queryClient,
}: {
  queryClient: QueryClient;
}) {
  return queryClient.query(
    getHotspotLogQueryOptions({ queryFn: $getHotspotLogs }),
  );
}

export function useGetHotspotLogsSuspenseQuery() {
  const getter = useServerFn($getHotspotLogs);
  return useSuspenseQuery(getHotspotLogQueryOptions({ queryFn: getter }));
}
