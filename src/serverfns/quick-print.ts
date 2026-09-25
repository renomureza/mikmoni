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
import { UserModeValue, UsernameCharacterValue } from "~/contants/hotspot-user";
import { routerosMiddleware } from "~/middlewares/auth";
import { hotspotUserGeneratorSchema } from "~/schema/hotspot-user";
import { randomInt } from "~/utils/number";
import {
  extractOnLoginScriptPutFields,
  generateHotspotUserCredential,
  toBytes,
} from "~/utils/routeros";

const $getQuickPrints = createServerFn()
  .middleware([routerosMiddleware])
  .handler(async ({ context }) => {
    const scripts = (await context.routerosClient.write(
      "/system/script/print",
      { ".proplist": ".id,source" },
      ["comment=QuickPrintMikhmon"],
    )) as { ".id": string; name: string; source: string; comment: string }[];

    return scripts.map(({ source, ".id": id }) => {
      const [
        ,
        name,
        server,
        userMode,
        nameLength,
        prefix,
        character,
        profile,
        timeLimit,
        dataLimit,
        comment,
        validity,
        priceAndSellingPrice,
        lockUser,
      ] = source.split("#");
      const [price, sellingPrice] = priceAndSellingPrice.split("_");

      return {
        ".id": id,
        name,
        server,
        userMode: userMode as UserModeValue,
        nameLength: Number(nameLength),
        character: character as UsernameCharacterValue,
        prefix,
        profile,
        timeLimit,
        dataLimit,
        validity,
        price,
        sellingPrice,
        comment,
        lockUser: lockUser as "Enable" | "Disable",
      };
    });
  });

function getQuickPrintsQueryOptions({
  queryFn,
}: {
  queryFn: (
    ...args: Parameters<typeof $getQuickPrints>
  ) => ReturnType<typeof $getQuickPrints>;
}) {
  return queryOptions({
    queryKey: ["quick-prints"],
    queryFn: () => queryFn(),
    placeholderData: keepPreviousData,
  });
}

export function useGetQuickPrintsQuery() {
  const query = useServerFn($getQuickPrints);
  return useQuery(getQuickPrintsQueryOptions({ queryFn: query }));
}

export function ensureGetQuickPrintsQuery({
  queryClient,
}: {
  queryClient: QueryClient;
}) {
  return queryClient.query(
    getQuickPrintsQueryOptions({ queryFn: $getQuickPrints }),
  );
}

export function useGetQuickPrintsSuspenseQuery() {
  const getter = useServerFn($getQuickPrints);
  return useSuspenseQuery(getQuickPrintsQueryOptions({ queryFn: getter }));
}

//

const createQuickPrintInputSchema = hotspotUserGeneratorSchema.extend({
  name: z.string().min(1).trim(),
});

type CreateQuickPrintInputSchema = z.input<typeof createQuickPrintInputSchema>;

const $createQuickPrint = createServerFn({ method: "POST" })
  .middleware([routerosMiddleware])
  .validator((d: CreateQuickPrintInputSchema) => d)
  .handler(async ({ context, data }) => {
    const validation = createQuickPrintInputSchema.safeParse(data);

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
      comment,
      dataLimit,
      dataLimitUnit,
      server,
      timeLimit,
      userMode,
      name,
    } = validation.data;

    const [profileDetail] = (await context.routerosClient.write(
      "/ip/hotspot/user/profile/print",
      { ".proplist": "on-login" },
      [`name=${profile}`],
    )) as { "on-login"?: string }[];

    const { price, sellingPrice, validity, lockUser } =
      extractOnLoginScriptPutFields(profileDetail?.["on-login"] || "");

    const source = `#${name}#${server}#${userMode}#${nameLength}#${prefix}#${character}#${profile}#${timeLimit || 0}#${toBytes(dataLimit || 0, dataLimitUnit)}#${comment}#${validity}#${price}_${sellingPrice}#${lockUser}`;

    await context.routerosClient.write("/system/script/add", {
      name: `Quick_Print_${name.replace(/\s+/g, "-")}`,
      source,
      comment: "QuickPrintMikhmon",
    });

    return { success: true };
  });

export function useCreateQuickPrintMutation() {
  const mutate = useServerFn($createQuickPrint);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: mutate,
    onSuccess: async (data) => {
      if (data.success) {
        await queryClient.invalidateQueries({ queryKey: ["quick-prints"] });
      }
    },
  });
}

//

const updateQuickPrintInputSchema = createQuickPrintInputSchema.extend({
  id: z.string().min(1),
});

type UpdateQuickPrintInputSchema = z.input<typeof updateQuickPrintInputSchema>;

const $updateQuickPrint = createServerFn({ method: "POST" })
  .middleware([routerosMiddleware])
  .validator((d: UpdateQuickPrintInputSchema) => d)
  .handler(async ({ context, data }) => {
    const validation = updateQuickPrintInputSchema.safeParse(data);

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
      comment,
      dataLimit,
      dataLimitUnit,
      server,
      timeLimit,
      userMode,
      name,
      id,
    } = validation.data;

    const [profileDetail] = (await context.routerosClient.write(
      "/ip/hotspot/user/profile/print",
      { ".proplist": "on-login" },
      [`name=${profile}`],
    )) as { "on-login"?: string }[];

    const { price, sellingPrice, validity, lockUser } =
      extractOnLoginScriptPutFields(profileDetail?.["on-login"] || "");

    const source = `#${name}#${server}#${userMode}#${nameLength}#${prefix}#${character}#${profile}#${timeLimit || 0}#${toBytes(dataLimit || 0, dataLimitUnit)}#${comment}#${validity}#${price}_${sellingPrice}#${lockUser}`;

    await context.routerosClient.write("/system/script/set", {
      ".id": id,
      name: `Quick_Print_${name.replace(/\s+/g, "-")}`,
      source,
      comment: "QuickPrintMikhmon",
    });

    return { success: true };
  });

export function useUpdateQuickPrintMutation() {
  const mutate = useServerFn($updateQuickPrint);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: mutate,
    onSuccess: async (data) => {
      if (data.success) {
        await queryClient.invalidateQueries({ queryKey: ["quick-prints"] });
      }
    },
  });
}

//

const quickPrintGenerateInputSchema = hotspotUserGeneratorSchema
  .omit({
    dataLimit: true,
    dataLimitUnit: true,
  })
  .extend({
    dataLimitBytes: z.coerce.number().int().min(0),
  });

type GenerateHotspotUserInputSchema = z.input<
  typeof quickPrintGenerateInputSchema
>;

const $quickPrintGenerate = createServerFn({ method: "POST" })
  .middleware([routerosMiddleware])
  .validator((d: GenerateHotspotUserInputSchema) => d)
  .handler(async ({ context, data }) => {
    const validation = quickPrintGenerateInputSchema.safeParse(data);

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
      dataLimitBytes,
      server,
      timeLimit,
      userMode,
    } = validation.data;

    const date = new Date();
    const dateComment = `${String(date.getMonth() + 1).padStart(2, "0")}.${String(date.getDate()).padStart(2, "0")}.${String(date.getFullYear()).slice(-2)}`;
    const comment = `${userMode}-${randomInt(100, 1000)}-${dateComment}-${commentInput}`;

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
      ...(dataLimitBytes
        ? {
            "limit-bytes-total": dataLimitBytes,
          }
        : {}),
    });
    const [user] = await context.routerosClient.write(
      "/ip/hotspot/user/print",
      { ".proplist": ".id" },
      [`name=${username}`],
    );

    return { success: true, data: { id: user[".id"] } };
  });

export function useQuickPrintGenerateMutation() {
  const mutate = useServerFn($quickPrintGenerate);
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
//

const deleteQuickPrintInputSchema = z.object({
  id: z.string().min(1),
});

type DeleteQuickPrintInputSchema = z.input<typeof deleteQuickPrintInputSchema>;

const $deleteQuickPrint = createServerFn({ method: "POST" })
  .middleware([routerosMiddleware])
  .validator((d: DeleteQuickPrintInputSchema) => d)
  .handler(async ({ context, data }) => {
    const validation = deleteQuickPrintInputSchema.safeParse(data);

    if (!validation.success) {
      return {
        success: false,
        error: "Quick print not found",
      };
    }

    await context.routerosClient.write("/system/script/remove", {
      ".id": validation.data.id,
    });

    return { success: true };
  });

export function useDeleteQuickPrintMutation() {
  const mutate = useServerFn($deleteQuickPrint);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: mutate,
    onSuccess: async (data) => {
      if (data.success) {
        await queryClient.invalidateQueries({ queryKey: ["quick-prints"] });
      }
    },
  });
}
