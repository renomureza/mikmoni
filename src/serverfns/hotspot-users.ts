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
import { authAndRouterosMiddleware } from "~/middlewares/auth";
import * as z from "zod/v4";
import { toast } from "sonner";
import { randomInt } from "node:crypto";
import { generateHotspotUserCredential, toBytes } from "~/utils/routeros";
import { tryCatch } from "~/utils/utilities";
import { hotspotUserGeneratorSchema } from "~/schema/hotspot-user";

type HotspotUser = {
  ".id": string;
  server?: string;
  name: string;
  password?: string;
  profile?: string;
  uptime: string;
  "limit-uptime"?: string;
  "limit-bytes-total"?: string;
  "mac-address"?: string;
  "bytes-in": string;
  "bytes-out": string;
  disabled: "false" | "true";
  comment?: string;
};

const getHotspotUsersInputSchema = z
  .object({
    profile: z.string().optional(),
    comment: z.string().optional(),
  })
  .optional();

type GetHotspotUsersInputSchema = z.input<typeof getHotspotUsersInputSchema>;

const $getHotspotUsers = createServerFn()
  .middleware([authAndRouterosMiddleware])
  .validator((d: GetHotspotUsersInputSchema) => d)
  .handler(async ({ context, data }) => {
    const users = (await context.routerosClient.write(
      "/ip/hotspot/user/print",
      {
        ".proplist":
          ".id,server,name,password,profile,uptime,limit-uptime,limit-bytes-total,mac-address,bytes-in,bytes-out,disabled,comment",
      },
      [
        ...(data?.profile ? [`?profile=${data.profile}`] : []),
        ...(data?.comment ? [`?comment=${data.comment}`] : []),
        ".id=*0",
        "#!",
      ],
    )) as HotspotUser[];

    return users;
  });

function getHotspotUsersQueryOptions({
  queryFn,
  opts,
}: {
  queryFn: (
    ...args: Parameters<typeof $getHotspotUsers>
  ) => ReturnType<typeof $getHotspotUsers>;
  opts: GetHotspotUsersInputSchema;
}) {
  return queryOptions({
    queryKey: ["routeros", "hotspot", "users", opts],
    queryFn: () => queryFn({ data: opts }),
    placeholderData: keepPreviousData,
  });
}

export function useGetHotspotUsersQuery(opts: GetHotspotUsersInputSchema) {
  const query = useServerFn($getHotspotUsers);
  return useQuery(getHotspotUsersQueryOptions({ queryFn: query, opts }));
}

export function ensureGetHotspotUsersQuery({
  queryClient,
  opts,
}: {
  queryClient: QueryClient;
  opts: GetHotspotUsersInputSchema;
}) {
  return queryClient.query(
    getHotspotUsersQueryOptions({ queryFn: $getHotspotUsers, opts }),
  );
}

export function useGetHotspotUsersSuspenseQuery(
  opts: GetHotspotUsersInputSchema,
) {
  const getter = useServerFn($getHotspotUsers);
  return useSuspenseQuery(
    getHotspotUsersQueryOptions({ queryFn: getter, opts }),
  );
}

//

const $getHotspotUserComments = createServerFn()
  .middleware([authAndRouterosMiddleware])
  .handler(async ({ context }) => {
    const comments = (await context.routerosClient.write(
      "/ip/hotspot/user/print",
      { ".proplist": "comment" },
      [">comment=up-", ">comment=vc-", "#|", ".id=*0", "#!", "#&"],
    )) as { comment: string }[];

    return Array.from(new Set(comments.map(({ comment }) => comment)));
  });

function getHotspotUserCommentsQueryOptions({
  queryFn,
}: {
  queryFn: (
    ...args: Parameters<typeof $getHotspotUserComments>
  ) => ReturnType<typeof $getHotspotUserComments>;
}) {
  return queryOptions({
    queryKey: ["routeros", "hotspot", "user-comments"],
    queryFn: () => queryFn(),
    placeholderData: keepPreviousData,
  });
}

export function useGetHotspotUserCommentsQuery() {
  const query = useServerFn($getHotspotUserComments);
  return useQuery(getHotspotUserCommentsQueryOptions({ queryFn: query }));
}

export function ensureGetHotspotUserCommentsQuery({
  queryClient,
}: {
  queryClient: QueryClient;
}) {
  return queryClient.query(
    getHotspotUserCommentsQueryOptions({ queryFn: $getHotspotUserComments }),
  );
}

export function useGetHotspotUserCommentsSuspenseQuery() {
  const getter = useServerFn($getHotspotUserComments);
  return useSuspenseQuery(
    getHotspotUserCommentsQueryOptions({ queryFn: getter }),
  );
}

//

const generateHotspotUserInputSchema = hotspotUserGeneratorSchema.extend({
  quantity: z.coerce.number().int().min(1),
});

type GenerateHotspotUserInputSchema = z.input<
  typeof generateHotspotUserInputSchema
>;

const $generateHotspotUsers = createServerFn({ method: "POST" })
  .middleware([authAndRouterosMiddleware])
  .validator((d: GenerateHotspotUserInputSchema) => d)
  .handler(async ({ context, data }) => {
    const validation = generateHotspotUserInputSchema.safeParse(data);

    if (!validation.success) {
      return {
        success: false,
        errors: z.flattenError(validation.error).fieldErrors,
      };
    }

    const {
      nameLength,
      prefix,
      profile,
      character,
      comment: commentInput,
      dataLimit,
      dataLimitUnit,
      quantity,
      server,
      timeLimit,
      userMode,
    } = validation.data;

    const date = new Date();
    const dateComment = `${String(date.getMonth() + 1).padStart(2, "0")}.${String(date.getDate()).padStart(2, "0")}.${String(date.getFullYear()).slice(-2)}`;
    const comment = `${userMode}-${randomInt(100, 1000)}-${dateComment}-${commentInput}`;

    await Promise.all(
      Array.from({ length: quantity }, async () => {
        const { password, username } = generateHotspotUserCredential({
          prefix,
          character,
          length: nameLength,
          mode: userMode,
        });

        await context.routerosClient.write("/ip/hotspot/user/add", {
          server: server,
          name: username,
          password,
          profile: profile,
          comment: comment,
          ...(timeLimit
            ? {
                "limit-uptime": timeLimit,
              }
            : {}),
          ...(dataLimit
            ? {
                "limit-bytes-total": toBytes(dataLimit, dataLimitUnit),
              }
            : {}),
        });
      }),
    );

    return { success: true };
  });

export function useGenerateHotspotUsersMutation() {
  const mutate = useServerFn($generateHotspotUsers);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: mutate,
    onSuccess: async (data) => {
      if (data.success) {
        await queryClient.invalidateQueries({ queryKey: ["routeros"] });
        toast.success("Users successfully created.");
      }
    },
  });
}

//

const createHotspotUserInputSchema = generateHotspotUserInputSchema
  .pick({
    comment: true,
    dataLimit: true,
    dataLimitUnit: true,
    server: true,
    profile: true,
    timeLimit: true,
  })
  .extend({
    name: z.string().min(1),
    password: z.string().min(1),
  });

type CreateHotspotUserInputSchema = z.input<
  typeof createHotspotUserInputSchema
>;

const $createHotspotUsers = createServerFn({ method: "POST" })
  .middleware([authAndRouterosMiddleware])
  .validator((d: CreateHotspotUserInputSchema) => d)
  .handler(async ({ data, context }) => {
    const validation = createHotspotUserInputSchema.safeParse(data);

    if (!validation.success) {
      return {
        success: false,
        errors: z.flattenError(validation.error).fieldErrors,
      };
    }

    const {
      name,
      password,
      profile,
      server,
      comment,
      dataLimit,
      dataLimitUnit,
      timeLimit,
    } = validation.data;

    const res = await tryCatch(
      context.routerosClient.write("/ip/hotspot/user/add", {
        name: name,
        password: password,
        profile: profile,
        server: server,
        comment: comment,
        ...(timeLimit
          ? {
              "limit-uptime": timeLimit,
            }
          : {}),
        ...(dataLimit
          ? {
              "limit-bytes-total":
                dataLimit * (dataLimitUnit === "mb" ? 1048576 : 1073741824),
            }
          : {}),
      }),
    );

    if (!res.ok) {
      return { success: false, error: res.error };
    }

    return { success: true };
  });

export function useCreateHotspotUserMutation() {
  const mutate = useServerFn($createHotspotUsers);
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

const updateHotspotUserInputSchema = createHotspotUserInputSchema.extend({
  id: z.string().min(1),
});

type UpdateHotspotUserInputSchema = z.input<
  typeof updateHotspotUserInputSchema
>;

const $updateHotspotUsers = createServerFn({ method: "POST" })
  .middleware([authAndRouterosMiddleware])
  .validator((d: UpdateHotspotUserInputSchema) => d)
  .handler(async ({ data, context }) => {
    const validation = updateHotspotUserInputSchema.safeParse(data);

    if (!validation.success) {
      return {
        success: false,
        errors: z.flattenError(validation.error).fieldErrors,
      };
    }

    const {
      name,
      password,
      profile,
      server,
      comment,
      dataLimit,
      dataLimitUnit,
      timeLimit,
      id,
    } = validation.data;

    const res = await tryCatch(
      context.routerosClient.write("/ip/hotspot/user/set", {
        ".id": id,
        name: name,
        password: password,
        profile: profile,
        server: server,
        comment: comment,
        "limit-uptime": timeLimit || 0,
        "limit-bytes-total": toBytes(dataLimit || 0, dataLimitUnit),
      }),
    );

    if (!res.ok) {
      return { success: false, error: res.error };
    }

    return { success: true };
  });

export function useUpdateHotspotUserMutation() {
  const mutate = useServerFn($updateHotspotUsers);
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

const disableHotspotUserInputSchema = z.object({
  id: z.string().min(1),
  disabled: z.enum(["true", "false"]),
});

type DisableHotspotUserInputSchema = z.input<
  typeof disableHotspotUserInputSchema
>;

const $disableHotspotUsers = createServerFn({ method: "POST" })
  .middleware([authAndRouterosMiddleware])
  .validator((d: DisableHotspotUserInputSchema) => d)
  .handler(async ({ data, context }) => {
    const validation = disableHotspotUserInputSchema.safeParse(data);

    if (!validation.success) {
      return {
        success: false,
        error: z.prettifyError(validation.error),
      };
    }

    await context.routerosClient.write("/ip/hotspot/user/set", {
      ".id": validation.data.id,
      disabled: validation.data.disabled,
    });

    return { success: true };
  });

export function useDisableHotspotUserMutation() {
  const mutate = useServerFn($disableHotspotUsers);
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
