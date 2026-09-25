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
import { onlyOneOptions } from "~/contants/ppp";
import { routerosMiddleware } from "~/middlewares/auth";
import { tryCatch } from "~/utils/utilities";

type PppProfiles = {
  ".id": string;
  name: string;
  "rate-limit"?: string;
  "local-address"?: string;
  "remote-address"?: string;
  "only-one": "yes" | "no" | "default";
  comment?: string;
};

const getPppProfilesInputSchema = z.object({
  excludeDefault: z.boolean().optional(),
});

type GetPppProfilesInputSchema = z.input<typeof getPppProfilesInputSchema>;

const $getPppProfiles = createServerFn()
  .middleware([routerosMiddleware])
  .validator(getPppProfilesInputSchema)
  .handler(async ({ context, data }) => {
    const profiles = (await context.routerosClient.write(
      "/ppp/profile/print",
      {
        ".proplist":
          ".id,name,rate-limit,local-address,remote-address,only-one,comment",
      },
      [...(data?.excludeDefault ? ["=default=false"] : [])],
    )) as PppProfiles[];

    return profiles;
  });

function getPppProfilesQueryOptions({
  queryFn,
  opts,
}: {
  queryFn: (
    ...args: Parameters<typeof $getPppProfiles>
  ) => ReturnType<typeof $getPppProfiles>;
  opts: GetPppProfilesInputSchema;
}) {
  return queryOptions({
    queryKey: ["routeros", "ppp-profiles", opts],
    queryFn: () => queryFn({ data: opts }),
    placeholderData: keepPreviousData,
  });
}

export function useGetPppProfilesQuery(opts: GetPppProfilesInputSchema) {
  const query = useServerFn($getPppProfiles);
  return useQuery(getPppProfilesQueryOptions({ queryFn: query, opts }));
}

export function ensureGetPppProfilesQuery({
  queryClient,
  opts,
}: {
  queryClient: QueryClient;
  opts: GetPppProfilesInputSchema;
}) {
  return queryClient.query(
    getPppProfilesQueryOptions({ queryFn: $getPppProfiles, opts }),
  );
}

export function useGetPppProfilesSuspenseQuery(
  opts: GetPppProfilesInputSchema,
) {
  const getter = useServerFn($getPppProfiles);
  return useSuspenseQuery(
    getPppProfilesQueryOptions({ queryFn: getter, opts }),
  );
}

//

const createPppProfileInputSchema = z.object({
  name: z.string().min(1),
  localAddress: z.union([z.literal(""), z.ipv4()]),
  remoteAddress: z.union([z.literal(""), z.ipv4()]),
  rateLimit: z.string(),
  onlyOne: z.enum(onlyOneOptions),
  comment: z.string(),
});

type CreatePppProfileInputSchema = z.input<typeof createPppProfileInputSchema>;

const $createPppProfile = createServerFn({ method: "POST" })
  .middleware([routerosMiddleware])
  .validator((d: CreatePppProfileInputSchema) => d)
  .handler(async ({ data, context }) => {
    const validation = createPppProfileInputSchema.safeParse(data);

    if (!validation.success) {
      return {
        success: false,
        errors: z.flattenError(validation.error).fieldErrors,
      };
    }

    const res = await tryCatch(
      context.routerosClient.write("/ppp/profile/add", {
        name: validation.data.name,
        "rate-limit": validation.data.rateLimit,
        "only-one": validation.data.onlyOne,
        comment: validation.data.comment,
        ...(validation.data.localAddress
          ? {
              "local-address": validation.data.localAddress,
            }
          : {}),
        ...(validation.data.remoteAddress
          ? {
              "remote-address": validation.data.remoteAddress,
            }
          : {}),
      }),
    );

    if (!res.ok) {
      return { success: false, error: res.error };
    }

    return { success: true };
  });

export function useCreatePppProfileMutation() {
  const mutate = useServerFn($createPppProfile);
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

const updatePppProfileInputSchema = createPppProfileInputSchema.extend({
  id: z.string().min(1),
});

type UpdatePppProfileInputSchema = z.input<typeof updatePppProfileInputSchema>;

const $updatePppProfile = createServerFn({ method: "POST" })
  .middleware([routerosMiddleware])
  .validator((d: UpdatePppProfileInputSchema) => d)
  .handler(async ({ data, context }) => {
    const validation = updatePppProfileInputSchema.safeParse(data);

    if (!validation.success) {
      return {
        success: false,
        errors: z.flattenError(validation.error).fieldErrors,
      };
    }

    const res = await tryCatch(
      context.routerosClient.write("/ppp/profile/set", {
        ".id": validation.data.id,
        name: validation.data.name,
        "rate-limit": validation.data.rateLimit,
        "only-one": validation.data.onlyOne,
        comment: validation.data.comment,
        ...(validation.data.localAddress
          ? {
              "local-address": validation.data.localAddress,
            }
          : {
              "!local-address": "",
            }),
        ...(validation.data.remoteAddress
          ? {
              "remote-address": validation.data.remoteAddress,
            }
          : {
              "!remote-address": "",
            }),
      }),
    );

    if (!res.ok) {
      return { success: false, error: res.error };
    }

    return { success: true };
  });

export function useUpdatePppProfileMutation() {
  const mutate = useServerFn($updatePppProfile);
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

const deletePppProfileInputSchema = z.object({
  id: z.string().min(1),
});

type DeletePppProfileInputSchema = z.input<typeof deletePppProfileInputSchema>;

const $deletePppProfile = createServerFn({ method: "POST" })
  .middleware([routerosMiddleware])
  .validator((d: DeletePppProfileInputSchema) => d)
  .handler(async ({ data, context }) => {
    const validation = deletePppProfileInputSchema.safeParse(data);

    if (!validation.success) {
      return {
        success: false,
        error: "PPP Profile not found",
      };
    }

    const res = await tryCatch(
      context.routerosClient.write("/ppp/profile/remove", {
        ".id": validation.data.id,
      }),
    );

    if (!res.ok) {
      return { success: false, error: res.error };
    }

    return { success: true };
  });

export function useDeletePppProfileMutation() {
  const mutate = useServerFn($deletePppProfile);
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
