import {
  keepPreviousData,
  QueryClient,
  queryOptions,
  useQuery,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { createServerFn, useServerFn } from "@tanstack/react-start";
import { authAndRouterosMiddleware } from "~/middlewares/auth";

type Interface = {
  ".id": string;
  name: string;
  type: string;
  uptime: string;
  "mac-address"?: string;
  "bytes-in": string;
  "bytes-out": string;
  disabled: "false" | "true";
  comment?: string;
};

const $getInterfaces = createServerFn()
  .middleware([authAndRouterosMiddleware])
  .handler(async ({ context }) => {
    const users = (await context.routerosClient.write(
      "/interface/print",
    )) as Interface[];

    return users;
  });

function getInterfacesQueryOptions({
  queryFn,
}: {
  queryFn: (
    ...args: Parameters<typeof $getInterfaces>
  ) => ReturnType<typeof $getInterfaces>;
}) {
  return queryOptions({
    queryKey: ["routeros", "interfaces"],
    queryFn: () => queryFn(),
    placeholderData: keepPreviousData,
  });
}

export function useGetInterfacesQuery() {
  const query = useServerFn($getInterfaces);
  return useQuery(getInterfacesQueryOptions({ queryFn: query }));
}

export function ensureGetInterfacesQueryData({
  queryClient,
}: {
  queryClient: QueryClient;
}) {
  return queryClient.query(
    getInterfacesQueryOptions({ queryFn: $getInterfaces }),
  );
}

export function useGetInterfacesSuspenseQuery() {
  const getter = useServerFn($getInterfaces);
  return useSuspenseQuery(getInterfacesQueryOptions({ queryFn: getter }));
}

//

export const $getInterfaceTraffic = createServerFn()
  .middleware([authAndRouterosMiddleware])
  .handler(async ({ context }) => {
    const traffic = await context.routerosClient
      .write("/interface/monitor-traffic", {
        ".proplist": "rx-bits-per-second,tx-bits-per-second",
        interface: "ether1",
        once: "",
      })
      .then(
        (d) =>
          d[0] as {
            "rx-bits-per-second": string;
            "tx-bits-per-second": string;
          },
      );

    return traffic;
  });

function getInterfaceTrafficQueryOptions({
  queryFn,
}: {
  queryFn: (
    ...args: Parameters<typeof $getInterfaceTraffic>
  ) => ReturnType<typeof $getInterfaceTraffic>;
}) {
  return queryOptions({
    queryKey: ["routeros", "interfaces", "traffic"],
    queryFn: () => queryFn(),
    placeholderData: keepPreviousData,
    // select: (d) => ({
    //   "rx-bits-per-second": Number(d["rx-bits-per-second"]),
    //   "tx-bits-per-second": Number(d["tx-bits-per-second"]),
    // }),
  });
}

export function useGetInterfaceTrafficQuery() {
  const query = useServerFn($getInterfaceTraffic);
  return useQuery(getInterfaceTrafficQueryOptions({ queryFn: query }));
}

// export function ensureGetInterfaceTrafficQueryData({
//   queryClient,
// }: {
//   queryClient: QueryClient;
// }) {
//   return queryClient.query(
//     getInterfaceTrafficQueryOptions({ queryFn: $getInterfaceTraffic }),
//   );
// }

// export function useGetInterfaceTrafficSuspenseQuery() {
//   const getter = useServerFn($getInterfaceTraffic);
//   return useSuspenseQuery(getInterfaceTrafficQueryOptions({ queryFn: getter }));
// }
