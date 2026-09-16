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
import {
  dataLimitUnitValues,
  userModeValues,
  usernameCharacterValues,
} from "~/contants/hotspot-user";
import { generateHotspotUserCredential } from "~/utils/routeros.server";
import { randomInt } from "node:crypto";

type HotspotUser = {
  ".id": string;
  server?: string;
  name: string;
  profile?: string;
  uptime: string;
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
    const users = (await context.routeros.client.write(
      "/ip/hotspot/user/print",
      {
        ".proplist":
          ".id,server,name,profile,uptime,mac-address,bytes-in,bytes-out,disabled,comment",
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
      [">comment=", ".id=*0", "#!"],
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

const generateHotspotUserInputSchema = z.object({
  quantity: z.coerce.number().int().min(1),
  server: z.string().min(1),
  profile: z.string().min(1),
  userMode: z.enum(userModeValues),
  nameLength: z.coerce.number().int().min(3),
  prefix: z.string(),
  character: z.enum(usernameCharacterValues),
  timeLimit: z.union([
    z.literal(""),
    z
      .string()
      .regex(
        /^(?=.)(\d+w)?(\d+d)?(\d+h)?(\d+m)?(\d+s)?$/,
        "Invalid duration format. Use a combination of w/d/h/m/s in order, e.g. 3w6d15h29m11s, 1d, or 30m.",
      ),
  ]),
  dataLimit: z.union([z.literal(""), z.coerce.number().int().min(1)]),
  dataLimitUnit: z.enum(dataLimitUnitValues),
  comment: z.string(),
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
                "limit-bytes-total":
                  dataLimit * (dataLimitUnit === "mb" ? 1048576 : 1073741824),
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
