import {
  keepPreviousData,
  QueryClient,
  queryOptions,
  useQuery,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { createServerFn, useServerFn } from "@tanstack/react-start";
import { routerosMiddleware } from "~/middlewares/auth";

type DhcpLease = {
  ".id": string;
  address: string;
  "mac-address": string;
  status:
    | "waiting"
    | "testing"
    | "declined"
    | "offered"
    | "bound"
    | "authorizing"
    | "conflict";
  server: string;
  "active-mac-address"?: string;
  "active-address"?: string;
  "host-name"?: string;
  dynamic: "true" | "false";
};

const $getDhcpLeases = createServerFn()
  .middleware([routerosMiddleware])
  .handler(async ({ context }) => {
    const dhcpLeases = (await context.routerosClient.write(
      "/ip/dhcp-server/lease/print",
      {
        ".proplist":
          ".id,address,mac-address,status,server,dynamic,active-mac-address,active-address,host-name",
      },
    )) as DhcpLease[];

    return dhcpLeases;
  });

function getDhcpLeasesQueryOptions({
  queryFn,
}: {
  queryFn: (
    ...args: Parameters<typeof $getDhcpLeases>
  ) => ReturnType<typeof $getDhcpLeases>;
}) {
  return queryOptions({
    queryKey: ["dhcp-leases"],
    queryFn: () => queryFn(),
    placeholderData: keepPreviousData,
  });
}

export function useGetDhcpLeasesQuery() {
  const query = useServerFn($getDhcpLeases);
  return useQuery(getDhcpLeasesQueryOptions({ queryFn: query }));
}

export function ensureGetDhcpLeasesQuery({
  queryClient,
}: {
  queryClient: QueryClient;
}) {
  return queryClient.query(
    getDhcpLeasesQueryOptions({ queryFn: $getDhcpLeases }),
  );
}

export function useGetDhcpLeasesSuspenseQuery() {
  const getter = useServerFn($getDhcpLeases);
  return useSuspenseQuery(getDhcpLeasesQueryOptions({ queryFn: getter }));
}
