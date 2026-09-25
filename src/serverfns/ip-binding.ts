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

type IpBinding = {
  ".id": string;
  address?: string;
  "to-address"?: string;
  "mac-address"?: string;
  server?: string;
  comment?: string;
  type?: "bypassed" | "blocked";
  disabled?: "true" | "false";
};

const $getIpBinding = createServerFn()
  .middleware([routerosMiddleware])
  .handler(async ({ context }) => {
    const ipBindings = (await context.routerosClient.write(
      "/ip/hotspot/ip-binding/print",
      {},
    )) as IpBinding[];

    return ipBindings;
  });

function getIpBindingQueryOptions({
  queryFn,
}: {
  queryFn: (
    ...args: Parameters<typeof $getIpBinding>
  ) => ReturnType<typeof $getIpBinding>;
}) {
  return queryOptions({
    queryKey: ["routeros", "hotspot", "ip-bindings"],
    queryFn: () => queryFn(),
    placeholderData: keepPreviousData,
  });
}

export function useGetIpBindingQuery() {
  const query = useServerFn($getIpBinding);
  return useQuery(getIpBindingQueryOptions({ queryFn: query }));
}

export function ensureGetIpBindingQuery({
  queryClient,
}: {
  queryClient: QueryClient;
}) {
  return queryClient.query(
    getIpBindingQueryOptions({ queryFn: $getIpBinding }),
  );
}

export function useGetIpBindingSuspenseQuery() {
  const getter = useServerFn($getIpBinding);
  return useSuspenseQuery(getIpBindingQueryOptions({ queryFn: getter }));
}

//

const deleteIpBindingInputSchema = z.object({
  id: z.string().min(1),
});

type DeleteIpBindingInputSchema = z.input<typeof deleteIpBindingInputSchema>;

const $deleteIpBinding = createServerFn({ method: "POST" })
  .middleware([routerosMiddleware])
  .validator((d: DeleteIpBindingInputSchema) => d)
  .handler(async ({ data, context }) => {
    const validation = deleteIpBindingInputSchema.safeParse(data);

    if (!validation.success) {
      return {
        success: false,
        error: "IP Binding not found",
      };
    }

    await context.routerosClient.write("/ip/hotspot/ip-binding/remove", {
      ".id": validation.data.id,
    });

    return { success: true };
  });

export function useDeleteIpBindingMutation() {
  const mutate = useServerFn($deleteIpBinding);
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

//

const disableIpBindingInputSchema = z.object({
  id: z.string().min(1),
  disabled: z.enum(["true", "false"]),
});

type DisableIpBindingInputSchema = z.input<typeof disableIpBindingInputSchema>;

const $disableIpBinding = createServerFn({ method: "POST" })
  .middleware([routerosMiddleware])
  .validator((d: DisableIpBindingInputSchema) => d)
  .handler(async ({ data, context }) => {
    const validation = disableIpBindingInputSchema.safeParse(data);

    if (!validation.success) {
      return {
        success: false,
        error: "IP Binding not found",
      };
    }

    await context.routerosClient.write("/ip/hotspot/ip-binding/set", {
      ".id": validation.data.id,
      disabled: validation.data.disabled,
    });

    return { success: true };
  });

export function useDisableIpBindingMutation() {
  const mutate = useServerFn($disableIpBinding);
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
