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
import * as z from "zod/v4";
import { authAndRouterosMiddleware } from "~/middlewares/auth";

type HotspotActive = {
  ".id": string;
  server?: string;
  user: string;
  address?: string;
  "mac-address"?: string;
  uptime: string;
  "bytes-in": string;
  "bytes-out": string;
  "session-time-left"?: string;
  "login-by": string;
  comment?: string;
};

const $getHotspotActives = createServerFn()
  .middleware([authAndRouterosMiddleware])
  .handler(async ({ context }) => {
    const actives = (await context.routerosClient.write(
      "/ip/hotspot/active/print",
      {},
    )) as HotspotActive[];

    return actives;
  });

function getHotspotActivesQueryOptions({
  queryFn,
}: {
  queryFn: (
    ...args: Parameters<typeof $getHotspotActives>
  ) => ReturnType<typeof $getHotspotActives>;
}) {
  return queryOptions({
    queryKey: ["routeros", "hotspot", "actives"],
    queryFn: () => queryFn(),
    placeholderData: keepPreviousData,
  });
}

export function useGetHotspotActivesQuery() {
  const query = useServerFn($getHotspotActives);
  return useQuery(getHotspotActivesQueryOptions({ queryFn: query }));
}

export function ensureGetHotspotActivesQuery({
  queryClient,
}: {
  queryClient: QueryClient;
}) {
  return queryClient.query(
    getHotspotActivesQueryOptions({ queryFn: $getHotspotActives }),
  );
}

export function useGetHotspotActivesSuspenseQuery() {
  const getter = useServerFn($getHotspotActives);
  return useSuspenseQuery(getHotspotActivesQueryOptions({ queryFn: getter }));
}

//

const deleteHotspotActiveInputSchema = z.object({
  id: z.string().min(1),
});

type DeleteHotpotActiveInputSchema = z.input<
  typeof deleteHotspotActiveInputSchema
>;

const $deleteHotspotActive = createServerFn({ method: "POST" })
  .middleware([authAndRouterosMiddleware])
  .validator((d: DeleteHotpotActiveInputSchema) => d)
  .handler(async ({ data, context }) => {
    const validation = deleteHotspotActiveInputSchema.safeParse(data);

    if (!validation.success) {
      return {
        success: false,
        error: z.prettifyError(validation.error),
      };
    }

    await context.routerosClient.write("/ip/hotspot/active/remove", {
      ".id": validation.data.id,
    });

    return { success: true };
  });

export function useDeleteHotspotActiveMutation() {
  const mutate = useServerFn($deleteHotspotActive);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: mutate,
    onSuccess: async (data) => {
      if (data.success) {
        await queryClient.invalidateQueries({ queryKey: ["routeros"] });
      }
    },
  });
}
