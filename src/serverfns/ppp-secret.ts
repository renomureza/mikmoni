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
import { dataLimitUnitValues } from "~/contants/hotspot-user";
import { PppService, pppServices } from "~/contants/ppp";
import { routerosMiddleware } from "~/middlewares/auth";
import { toBytes } from "~/utils/routeros";
import { tryCatch } from "~/utils/utilities";

type PppSecret = {
  ".id": string;
  name: string;
  service: PppService;
  "caller-id"?: string;
  password?: string;
  profile: string;
  "limit-bytes-in": string;
  "limit-bytes-out": string;
  "last-logged-out": string;
  "local-address"?: string;
  "remote-address"?: string;
  disabled?: "false" | "true";
  comment?: string;
};

const getPppSecretsInputSchema = z
  .object({
    profile: z.string().optional(),
  })
  .optional();

type GetPppSecretsInputSchema = z.input<typeof getPppSecretsInputSchema>;

const $getPppSecrets = createServerFn()
  .middleware([routerosMiddleware])
  .validator((d: GetPppSecretsInputSchema) => d)
  .handler(async ({ context, data }) => {
    const [secrets, activeNames] = await Promise.all([
      context.routerosClient.write("/ppp/secret/print", {}, [
        ...(data?.profile ? [`profile=${data.profile}`] : []),
      ]) as Promise<PppSecret[]>,
      context.routerosClient
        .write("/ppp/active/print", { ".proplist": "name" })
        .then((actives) => actives.flatMap((active) => active.name)) as Promise<
        string[]
      >,
    ]);

    const active = new Set(activeNames);

    return secrets.map((secret) => ({
      ...secret,
      isOnline: active.has(secret.name),
    }));
  });

function getPppSecretsQueryOptions({
  queryFn,
  opts,
}: {
  queryFn: (
    ...args: Parameters<typeof $getPppSecrets>
  ) => ReturnType<typeof $getPppSecrets>;
  opts: GetPppSecretsInputSchema;
}) {
  return queryOptions({
    queryKey: ["routeros", "ppp-secrets", opts],
    queryFn: () => queryFn({ data: opts }),
    placeholderData: keepPreviousData,
  });
}

export function useGetPppSecretsQuery(opts: GetPppSecretsInputSchema) {
  const query = useServerFn($getPppSecrets);
  return useQuery(getPppSecretsQueryOptions({ queryFn: query, opts }));
}

export function ensureGetPppSecretsQuery({
  queryClient,
  opts,
}: {
  queryClient: QueryClient;
  opts: GetPppSecretsInputSchema;
}) {
  return queryClient.query(
    getPppSecretsQueryOptions({ queryFn: $getPppSecrets, opts }),
  );
}

export function useGetPppSecretsSuspenseQuery(opts: GetPppSecretsInputSchema) {
  const getter = useServerFn($getPppSecrets);
  return useSuspenseQuery(getPppSecretsQueryOptions({ queryFn: getter, opts }));
}

//

const createPppSecretInputSchema = z.object({
  name: z.string().min(1),
  password: z.string().optional(),
  profile: z.string(),
  service: z.enum(pppServices),
  localAddress: z.union([z.literal(""), z.ipv4()]),
  remoteAddress: z.union([z.literal(""), z.ipv4()]),
  limitBytesIn: z.coerce.number().optional(),
  limitBytesInUnit: z.enum(dataLimitUnitValues),
  limitBytesOut: z.coerce.number().optional(),
  limitBytesOutUnit: z.enum(dataLimitUnitValues),
  comment: z.string(),
});

type CreatePppSecretInputSchema = z.input<typeof createPppSecretInputSchema>;

const $createPppSecret = createServerFn({ method: "POST" })
  .middleware([routerosMiddleware])
  .validator((d: CreatePppSecretInputSchema) => d)
  .handler(async ({ data, context }) => {
    const validation = createPppSecretInputSchema.safeParse(data);

    if (!validation.success) {
      return {
        success: false,
        errors: z.flattenError(validation.error).fieldErrors,
      };
    }

    const res = await tryCatch(
      context.routerosClient.write("/ppp/secret/add", {
        name: validation.data.name,
        password: validation.data.password || "",
        profile: validation.data.profile,
        service: validation.data.service,
        comment: validation.data.comment,
        ...(validation.data.limitBytesIn
          ? {
              "limit-bytes-in": toBytes(
                validation.data.limitBytesIn,
                validation.data.limitBytesInUnit,
              ),
            }
          : {}),
        ...(validation.data.limitBytesOut
          ? {
              "limit-bytes-in": toBytes(
                validation.data.limitBytesOut,
                validation.data.limitBytesOutUnit,
              ),
            }
          : {}),
      }),
    );

    if (!res.ok) {
      return { success: false, error: res.error };
    }

    return { success: true };
  });

export function useCreatePppSecretMutation() {
  const mutate = useServerFn($createPppSecret);
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

const updatePppSecretInputSchema = createPppSecretInputSchema.extend({
  id: z.string().min(1),
});

type UpdatePppSecretInputSchema = z.input<typeof updatePppSecretInputSchema>;

const $updatePppSecret = createServerFn({ method: "POST" })
  .middleware([routerosMiddleware])
  .validator((d: UpdatePppSecretInputSchema) => d)
  .handler(async ({ data, context }) => {
    const validation = updatePppSecretInputSchema.safeParse(data);

    if (!validation.success) {
      return {
        success: false,
        errors: z.flattenError(validation.error).fieldErrors,
      };
    }

    const res = await tryCatch(
      context.routerosClient.write("/ppp/secret/set", {
        ".id": validation.data.id,
        name: validation.data.name,
        password: validation.data.password || "",
        profile: validation.data.profile,
        service: validation.data.service,
        comment: validation.data.comment,
        ...(validation.data.limitBytesIn
          ? {
              "limit-bytes-in": toBytes(
                validation.data.limitBytesIn,
                validation.data.limitBytesInUnit,
              ),
            }
          : {}),
        ...(validation.data.limitBytesOut
          ? {
              "limit-bytes-in": toBytes(
                validation.data.limitBytesOut,
                validation.data.limitBytesOutUnit,
              ),
            }
          : {}),
      }),
    );

    if (!res.ok) {
      return { success: false, error: res.error };
    }

    return { success: true };
  });

export function useUpdatePppSecretMutation() {
  const mutate = useServerFn($updatePppSecret);
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

const disablePppSecretInputSchema = z.object({
  id: z.string().min(1),
  disabled: z.enum(["true", "false"]),
});

type DisablePppSecretInputSchema = z.input<typeof disablePppSecretInputSchema>;

const $disablePppSecret = createServerFn({ method: "POST" })
  .middleware([routerosMiddleware])
  .validator((d: DisablePppSecretInputSchema) => d)
  .handler(async ({ data, context }) => {
    const validation = disablePppSecretInputSchema.safeParse(data);

    if (!validation.success) {
      return {
        success: false,
        errors: z.flattenError(validation.error).fieldErrors,
      };
    }

    const res = await tryCatch(
      context.routerosClient.write("/ppp/secret/set", {
        ".id": validation.data.id,
        disabled: validation.data.disabled,
      }),
    );

    if (!res.ok) {
      return { success: false, error: res.error };
    }

    return { success: true };
  });

export function useDisablePppSecretMutation() {
  const mutate = useServerFn($disablePppSecret);
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

const deletePppSecretInputSchema = z.object({
  id: z.string().min(1),
});

type DeletePppSecretInputSchema = z.input<typeof deletePppSecretInputSchema>;

const $deletePppSecret = createServerFn({ method: "POST" })
  .middleware([routerosMiddleware])
  .validator((d: DeletePppSecretInputSchema) => d)
  .handler(async ({ data, context }) => {
    const validation = deletePppSecretInputSchema.safeParse(data);

    if (!validation.success) {
      return {
        success: false,
        error: "PPP Secret not found",
      };
    }

    const res = await tryCatch(
      context.routerosClient.write("/ppp/secret/remove", {
        ".id": validation.data.id,
      }),
    );

    if (!res.ok) {
      return { success: false, error: res.error };
    }

    return { success: true };
  });

export function useDeletePppSecretMutation() {
  const mutate = useServerFn($deletePppSecret);
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
