import {
  keepPreviousData,
  QueryClient,
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { createServerFn, useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import * as z from "zod/v4";
import { routerosMiddleware } from "~/middlewares/auth";

type HotspotHosts = {
  ".id": string;
  address?: string;
  "mac-address"?: string;
  "to-address"?: string;
  server?: string;
  comment?: string;
  DHCP?: "true" | "false";
  authorized?: "true" | "false";
  bypassed?: "true" | "false";
  dynamic?: "true" | "false";
};

const $getHotspotHosts = createServerFn()
  .middleware([routerosMiddleware])
  .handler(async ({ context }) => {
    const hosts = (await context.routerosClient.write(
      "/ip/hotspot/host/print",
      {},
    )) as HotspotHosts[];

    return hosts;
  });

function getHotspotHostsQueryOptions({
  queryFn,
}: {
  queryFn: (
    ...args: Parameters<typeof $getHotspotHosts>
  ) => ReturnType<typeof $getHotspotHosts>;
}) {
  return queryOptions({
    queryKey: ["routeros", "hotspot", "hosts"],
    queryFn: () => queryFn(),
    placeholderData: keepPreviousData,
  });
}

export function useGetHotspotHostsQuery() {
  const query = useServerFn($getHotspotHosts);
  return useQuery(getHotspotHostsQueryOptions({ queryFn: query }));
}

export function ensureGetHotspotHostsQuery({
  queryClient,
}: {
  queryClient: QueryClient;
}) {
  return queryClient.query(
    getHotspotHostsQueryOptions({ queryFn: $getHotspotHosts }),
  );
}

export function useGetHotspotHostsSuspenseQuery() {
  const getter = useServerFn($getHotspotHosts);
  return useSuspenseQuery(getHotspotHostsQueryOptions({ queryFn: getter }));
}

//

const deleteHotspotHostInputSchema = z.object({
  id: z.string().min(1),
});

type DeleteHotpotHostInputSchema = z.input<typeof deleteHotspotHostInputSchema>;

const $deleteHotspotHost = createServerFn({ method: "POST" })
  .middleware([routerosMiddleware])
  .validator((d: DeleteHotpotHostInputSchema) => d)
  .handler(async ({ data, context }) => {
    const validation = deleteHotspotHostInputSchema.safeParse(data);

    if (!validation.success) {
      return {
        success: false,
        error: "Host not found",
      };
    }

    await context.routerosClient.write("/ip/hotspot/host/remove", {
      ".id": validation.data.id,
    });

    return { success: true };
  });

export function useDeleteHotspotHostMutation() {
  const mutate = useServerFn($deleteHotspotHost);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: mutate,
    onSuccess: async (data) => {
      if (data.success) {
        await queryClient.invalidateQueries({ queryKey: ["routeros"] });
      } else if (data.error) {
        toast.error(data.error);
      }
    },
  });
}
