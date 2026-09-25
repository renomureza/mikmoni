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
import { PppService } from "~/contants/ppp";
import { routerosMiddleware } from "~/middlewares/auth";
import { tryCatch } from "~/utils/utilities";

type PppActive = {
  ".id": string;
  name: string;
  service: PppService;
  "caller-id": string;
  address: string;
  uptime: string;
};

const $getPppActives = createServerFn()
  .middleware([routerosMiddleware])
  .handler(async ({ context }) => {
    const actives = (await context.routerosClient.write("/ppp/active/print", {
      ".proplist": ".id,name,service,caller-id,address,uptime",
    })) as PppActive[];

    return actives;
  });

function getPppActivesQueryOptions({
  queryFn,
}: {
  queryFn: (
    ...args: Parameters<typeof $getPppActives>
  ) => ReturnType<typeof $getPppActives>;
}) {
  return queryOptions({
    queryKey: ["routeros", "ppp-actives"],
    queryFn: () => queryFn({}),
    placeholderData: keepPreviousData,
  });
}

export function useGetPppActivesQuery() {
  const query = useServerFn($getPppActives);
  return useQuery(getPppActivesQueryOptions({ queryFn: query }));
}

export function ensureGetPppActivesQuery({
  queryClient,
}: {
  queryClient: QueryClient;
}) {
  return queryClient.query(
    getPppActivesQueryOptions({ queryFn: $getPppActives }),
  );
}

export function useGetPppActivesSuspenseQuery() {
  const getter = useServerFn($getPppActives);
  return useSuspenseQuery(getPppActivesQueryOptions({ queryFn: getter }));
}

//

const deleteActiveProfileInputSchema = z.object({
  id: z.string().min(1),
});

type DeletePppActiveInputSchema = z.input<
  typeof deleteActiveProfileInputSchema
>;

const $deleteActiveProfile = createServerFn({ method: "POST" })
  .middleware([routerosMiddleware])
  .validator((d: DeletePppActiveInputSchema) => d)
  .handler(async ({ data, context }) => {
    const validation = deleteActiveProfileInputSchema.safeParse(data);

    if (!validation.success) {
      return {
        success: false,
        error: "PPP Active not found",
      };
    }

    const res = await tryCatch(
      context.routerosClient.write("/ppp/active/remove", {
        ".id": validation.data.id,
      }),
    );

    if (!res.ok) {
      return { success: false, error: res.error };
    }

    return { success: true };
  });

export function useDeletePppActiveMutation() {
  const mutate = useServerFn($deleteActiveProfile);
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
