import {
  infiniteQueryOptions,
  keepPreviousData,
  QueryClient,
  useInfiniteQuery,
  useMutation,
  useQueryClient,
  useSuspenseInfiniteQuery,
} from "@tanstack/react-query";
import { createServerFn, useServerFn } from "@tanstack/react-start";
import { eq } from "drizzle-orm";
import { toast } from "sonner";
import * as z from "zod/v4";
import { db, schema } from "~/lib/db";
import {
  compileVoucherTemplate,
  getSampleVoucherTemplateContext,
} from "~/lib/handlebars";
import { authMiddleware } from "~/middlewares/auth";
import {
  findManyCursor,
  getFindManyCursorInputSchema,
} from "~/utils/find-many-cursor";

const createVoucherTemplateInputSchema = z.object({
  name: z.string().min(1).trim(),
  source: z
    .string()
    .trim()
    .transform((source, ctx) => {
      try {
        compileVoucherTemplate({
          source,
          context: getSampleVoucherTemplateContext({
            mode: "up",
            currency: "USD",
            locale: "id",
            usersLength: 10,
          }),
        });
        return source;
      } catch (e) {
        ctx.addIssue({
          code: "custom",
          path: ["source"],
          message: e instanceof Error ? e.message : "Source is invalid",
        });

        return z.NEVER;
      }
    }),
});

type CreateVoucherTemplateInputSchema = z.input<
  typeof createVoucherTemplateInputSchema
>;

const $createVoucherTemplate = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((d: CreateVoucherTemplateInputSchema) => d)
  .handler(async ({ data }) => {
    const validation = createVoucherTemplateInputSchema.safeParse(data);

    if (!validation.success) {
      return {
        success: false,
        error: z.prettifyError(validation.error),
      };
    }

    await db
      .insert(schema.voucherTemplates)
      .values({ name: validation.data.name, source: validation.data.source });

    return { success: true };
  });

export function useCreateVoucherTemplateMutation() {
  const mutate = useServerFn($createVoucherTemplate);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: mutate,
    onSuccess: async (data) => {
      if (data.success) {
        await queryClient.invalidateQueries({
          queryKey: ["voucher-templates"],
        });
        toast.success("Voucher template successfully created.");
      }
    },
  });
}

//

const updateVoucherTemplateInputSchema =
  createVoucherTemplateInputSchema.extend({
    id: z.coerce.number().min(1).int(),
  });

type UpdateVoucherTemplateInputSchema = z.input<
  typeof updateVoucherTemplateInputSchema
>;

const $updateVoucherTemplate = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((d: UpdateVoucherTemplateInputSchema) => d)
  .handler(async ({ data }) => {
    const validation = updateVoucherTemplateInputSchema.safeParse(data);

    if (!validation.success) {
      return {
        success: false,
        error: z.prettifyError(validation.error),
      };
    }

    await db
      .update(schema.voucherTemplates)
      .set({ name: validation.data.name, source: validation.data.source })
      .where(eq(schema.voucherTemplates.id, validation.data.id));

    return { success: true };
  });

export function useUpdateVoucherTemplateMutation() {
  const mutate = useServerFn($updateVoucherTemplate);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: mutate,
    onSuccess: async (data) => {
      if (data?.success) {
        await queryClient.invalidateQueries({
          queryKey: ["voucher-templates"],
        });
        toast.success("Voucher template successfully updated.");
      } else if (data?.error) {
        toast.error(data.error);
      }
    },
  });
}

//

const deleteVoucherTemplateInputSchema = z.object({
  id: z.coerce.number().min(1).int(),
});

type DeleteVoucherTemplateInputSchema = z.input<
  typeof deleteVoucherTemplateInputSchema
>;

const $deleteVoucherTemplate = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((d: DeleteVoucherTemplateInputSchema) => d)
  .handler(async ({ data }) => {
    const validation = deleteVoucherTemplateInputSchema.safeParse(data);

    if (!validation.success) {
      return {
        success: false,
        error: "Voucher template not found",
      };
    }

    await db
      .delete(schema.voucherTemplates)
      .where(eq(schema.voucherTemplates.id, validation.data.id));

    return { success: true };
  });

export function useDeleteVoucherTemplateMutation() {
  const mutate = useServerFn($deleteVoucherTemplate);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: mutate,
    onSuccess: async (data) => {
      if (data.success) {
        await queryClient.invalidateQueries({
          queryKey: ["voucher-templates"],
        });
        toast.success("Voucher template successfully deleted.");
      }
    },
  });
}

//

const getVoucherTemplatesInputSchema = z.object({
  query: z.string().optional(),
  ...getFindManyCursorInputSchema(20).shape,
});

type GetVoucherTemplatesInputSchema = z.input<
  typeof getVoucherTemplatesInputSchema
>;

const $getVoucherTemplates = createServerFn()
  .middleware([authMiddleware])
  .validator(getVoucherTemplatesInputSchema)
  .handler(async ({ data }) => {
    return await findManyCursor<Omit<schema.VoucherTemplate, "source">, ["id"]>(
      {
        query: data,
        cursorFields: ["id"],
        findMany: ({ limit, cursor }) => {
          return db.query.voucherTemplates.findMany({
            limit,
            orderBy: {
              id: "desc",
            },
            columns: {
              source: false,
            },
            where: {
              name: data.query
                ? {
                    like: `%${data.query}%`,
                  }
                : undefined,
              id: {
                lt: cursor?.id,
              },
            },
          });
        },
      },
    );
  });

function getVoucherTemplatesQueryOptions({
  queryFn,
  opts,
}: {
  queryFn: (
    ...args: Parameters<typeof $getVoucherTemplates>
  ) => ReturnType<typeof $getVoucherTemplates>;
  opts: GetVoucherTemplatesInputSchema;
}) {
  return infiniteQueryOptions({
    initialPageParam: undefined as string | undefined,
    queryKey: ["voucher-templates", opts],
    queryFn: (args) => queryFn({ data: { ...opts, cursor: args.pageParam } }),
    getNextPageParam: (lastPage) => lastPage.pageInfo.nextCursor,
    select: ({ pages }) => pages.flatMap((page) => page.items),
    placeholderData: keepPreviousData,
  });
}

export function ensureGetVoucherTemplatesInfiniteQueryData({
  queryClient,
  opts,
}: {
  queryClient: QueryClient;
  opts: GetVoucherTemplatesInputSchema;
}) {
  return queryClient.infiniteQuery(
    getVoucherTemplatesQueryOptions({ opts, queryFn: $getVoucherTemplates }),
  );
}

export function useGetVoucherTemplatesSuspenseInfiniteQuery(
  opts: GetVoucherTemplatesInputSchema,
) {
  const getter = useServerFn($getVoucherTemplates);
  return useSuspenseInfiniteQuery(
    getVoucherTemplatesQueryOptions({ opts, queryFn: getter }),
  );
}

export function useGetVoucherTemplatesInfiniteQuery(
  opts: GetVoucherTemplatesInputSchema,
) {
  const getter = useServerFn($getVoucherTemplates);
  return useInfiniteQuery(
    getVoucherTemplatesQueryOptions({ opts, queryFn: getter }),
  );
}

//

const getVoucherTemplateInputSchema = z.object({
  id: z.coerce.number().min(1).int(),
});

type GetVoucherTemplateInputSchema = z.input<
  typeof getVoucherTemplateInputSchema
>;

export const $getVoucherTemplate = createServerFn()
  .middleware([authMiddleware])
  .validator((d: GetVoucherTemplateInputSchema) => d)
  .handler(async ({ data }) => {
    const validation = getVoucherTemplateInputSchema.safeParse(data);
    if (!validation.success) return null;
    const voucherTemplate = await db.query.voucherTemplates.findFirst({
      where: {
        id: validation.data.id,
      },
    });
    return voucherTemplate || null;
  });
