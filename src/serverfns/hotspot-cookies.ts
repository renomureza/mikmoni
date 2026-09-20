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
import { authAndRouterosMiddleware } from "~/middlewares/auth";

type HotspotCookie = {
  ".id": string;
  user: string;
  "mac-address"?: string;
  domain?: string;
  "mac-cookie"?: "true" | "false";
  "expires-in": "string";
};

const $getHotspotCookies = createServerFn()
  .middleware([authAndRouterosMiddleware])
  .handler(async ({ context }) => {
    const cookies = (await context.routerosClient.write(
      "/ip/hotspot/cookie/print",
      {},
    )) as HotspotCookie[];

    return cookies;
  });

function getHotspotCookiesQueryOptions({
  queryFn,
}: {
  queryFn: (
    ...args: Parameters<typeof $getHotspotCookies>
  ) => ReturnType<typeof $getHotspotCookies>;
}) {
  return queryOptions({
    queryKey: ["routeros", "hotspot", "cookies"],
    queryFn: () => queryFn(),
    placeholderData: keepPreviousData,
  });
}

export function useGetHotspotCookiesQuery() {
  const query = useServerFn($getHotspotCookies);
  return useQuery(getHotspotCookiesQueryOptions({ queryFn: query }));
}

export function ensureGetHotspotCookiesQuery({
  queryClient,
}: {
  queryClient: QueryClient;
}) {
  return queryClient.query(
    getHotspotCookiesQueryOptions({ queryFn: $getHotspotCookies }),
  );
}

export function useGetHotspotCookiesSuspenseQuery() {
  const getter = useServerFn($getHotspotCookies);
  return useSuspenseQuery(getHotspotCookiesQueryOptions({ queryFn: getter }));
}

//

const deleteHotspotCookieInputSchema = z.object({
  id: z.string().min(1),
});

type DeleteHotspotCookieInputSchema = z.input<
  typeof deleteHotspotCookieInputSchema
>;

const $deleteHotspotCookie = createServerFn({ method: "POST" })
  .middleware([authAndRouterosMiddleware])
  .validator((d: DeleteHotspotCookieInputSchema) => d)
  .handler(async ({ data, context }) => {
    const validation = deleteHotspotCookieInputSchema.safeParse(data);

    if (!validation.success) {
      return {
        success: false,
        error: "Cookie not found",
      };
    }

    await context.routerosClient.write("/ip/hotspot/cookie/remove", {
      ".id": validation.data.id,
    });

    return { success: true };
  });

export function useDeleteHotspotCookieMutation() {
  const mutate = useServerFn($deleteHotspotCookie);
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
