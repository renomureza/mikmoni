import {
  keepPreviousData,
  QueryClient,
  queryOptions,
  useQuery,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { createServerFn, useServerFn } from "@tanstack/react-start";
import { authAndRouterosMiddleware } from "~/middlewares/auth";

type HotspotUser = {
  ".id": string;
  server: string;
  name: string;
  profile?: string;
  uptime: string;
  "mac-address"?: string;
  "bytes-in": string;
  "bytes-out": string;
  disabled: "false" | "true";
  comment?: string;
};

const $getHotspotUsers = createServerFn()
  .middleware([authAndRouterosMiddleware])
  .handler(async ({ context }) => {
    const users = (await context.routeros.client.write(
      "/ip/hotspot/user/print",
      {
        ".proplist":
          ".id,server,name,profile,uptime,mac-address,bytes-in,bytes-out,disabled,comment",
      },
    )) as HotspotUser[];

    return users;
  });

function getHotspotUsersQueryOptions({
  queryFn,
}: {
  queryFn: (
    ...args: Parameters<typeof $getHotspotUsers>
  ) => ReturnType<typeof $getHotspotUsers>;
}) {
  return queryOptions({
    queryKey: ["routeros", "hotspot", "users"],
    queryFn: () => queryFn(),
    placeholderData: keepPreviousData,
  });
}

export function useGetHotspotUsersQuery() {
  const query = useServerFn($getHotspotUsers);
  return useQuery(getHotspotUsersQueryOptions({ queryFn: query }));
}

export function ensureGetHotspotUsersQueryData({
  queryClient,
}: {
  queryClient: QueryClient;
}) {
  return queryClient.query(
    getHotspotUsersQueryOptions({ queryFn: $getHotspotUsers }),
  );
}

export function useGetHotspotUsersSuspenseQuery() {
  const getter = useServerFn($getHotspotUsers);
  return useSuspenseQuery(getHotspotUsersQueryOptions({ queryFn: getter }));
}
