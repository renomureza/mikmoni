import {
  keepPreviousData,
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { createServerFn, useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import * as z from "zod/v4";
import { authAndRouterosMiddleware } from "~/middlewares/auth";
import { tryCatch } from "~/utils/utilities";

export const $getHotspotServers = createServerFn()
  .middleware([authAndRouterosMiddleware])
  .handler(async ({ context }) => {
    const traffic = await context.routerosClient
      .write("/ip/hotspot/print", {
        ".proplist": ".id,name,interface",
      })
      .then(
        (d) =>
          d as {
            ".id": string;
            name: string;
            interface: string;
          }[],
      );

    return traffic;
  });

function getHotspotServersQueryOptions({
  queryFn,
}: {
  queryFn: (
    ...args: Parameters<typeof $getHotspotServers>
  ) => ReturnType<typeof $getHotspotServers>;
}) {
  return queryOptions({
    queryKey: ["routeros", "hotspot", "servers"],
    queryFn: () => queryFn(),
    placeholderData: keepPreviousData,
  });
}

export function useGetHotspotServersQuery() {
  const query = useServerFn($getHotspotServers);
  return useQuery(getHotspotServersQueryOptions({ queryFn: query }));
}

//

const deleteHotspotUserInputSchema = z.object({
  ".id": z.string(),
});

type DeleteHotspotUserInputSchema = z.input<
  typeof deleteHotspotUserInputSchema
>;

const $deleteHotspotUser = createServerFn({ method: "POST" })
  .middleware([authAndRouterosMiddleware])
  .validator((d: DeleteHotspotUserInputSchema) => d)
  .handler(async ({ context, data }) => {
    const validation = deleteHotspotUserInputSchema.safeParse(data);

    if (!validation.success) {
      return {
        success: false,
        error: "User not found",
      };
    }

    const res = await tryCatch(
      context.routerosClient.write("/ip/hotspot/user/remove", {
        ".id": validation.data[".id"],
      }),
    );

    if (!res.ok) {
      return { success: false, error: res.error };
    }

    return { success: true };
  });

export function useDeleteHotspotUser() {
  const mutate = useServerFn($deleteHotspotUser);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: mutate,
    onSuccess: async (data) => {
      if (data.success) {
        await queryClient.invalidateQueries({ queryKey: ["routeros"] });
        toast.success("User successfully deleted.");
      } else if (data?.error) {
        toast.error(data.error);
      }
    },
  });
}
