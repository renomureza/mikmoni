import {
  infiniteQueryOptions,
  keepPreviousData,
  QueryClient,
  useMutation,
  useQueryClient,
  useSuspenseInfiniteQuery,
} from "@tanstack/react-query";
import { createServerFn, useServerFn } from "@tanstack/react-start";
import { redirect } from "@tanstack/react-router";
import { eq } from "drizzle-orm";
import { toast } from "sonner";
import * as z from "zod/v4-mini";
import { db, schema } from "~/lib/db";
import { getSession } from "~/lib/session";
import { authMiddleware } from "~/middlewares/auth";
import {
  findManyCursor,
  getFindManyCursorInputSchema,
} from "~/utils/find-many-cursor";
import { RouterOSClient } from "~/lib/routeros-client";

const useRouterosInputSchema = z.object({
  id: z.coerce.number().check(z.int()),
});

type UseRouterosInputSchema = z.input<typeof useRouterosInputSchema>;

const $useRouteros = createServerFn()
  .middleware([authMiddleware])
  .validator((d: UseRouterosInputSchema) => d)
  .handler(async ({ data }) => {
    const validation = useRouterosInputSchema.safeParse(data);

    if (!validation.success) {
      return { success: false, error: z.prettifyError(validation.error) };
    }

    const routeros = await db.query.routeros.findFirst({
      where: { id: validation.data.id },
    });

    if (!routeros) {
      return { success: false, error: "Routeros not found" };
    }

    const routerosClient = new RouterOSClient({
      host: routeros.host,
      port: routeros.port,
      user: routeros.user,
      password: routeros.password,
      timeout: 6_000,
      tls: routeros.tls,
    });

    try {
      await routerosClient.connect();
      const session = await getSession();
      await session.update({ routerosId: routeros.id });
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Something went wrong",
      };
    } finally {
      await routerosClient.close();
    }

    throw redirect({ to: "/app" });
  });

export function useUseRouterosMutation() {
  const mutate = useServerFn($useRouteros);
  return useMutation({
    mutationFn: mutate,
    onSuccess: async (data) => {
      if (data?.error) {
        toast.error(data.error);
      }
    },
  });
}

//

const createRouterosInputSchema = z.object({
  name: z.string().check(z.minLength(1), z.trim()),
  host: z.string().check(z.minLength(1), z.trim()),
  port: z.coerce.number().check(z.int(), z.minimum(0), z.maximum(65_535)),
  user: z.string().check(z.minLength(1)),
  password: z.string().check(z.minLength(1)),
  tls: z.boolean(),
});
type CreateRouterosInput = z.input<typeof createRouterosInputSchema>;
const $createRouteros = createServerFn({ method: "POST" })
  .validator((d: CreateRouterosInput) => d)
  .handler(async ({ data }) => {
    const validation = createRouterosInputSchema.safeParse(data);

    if (!validation.success) {
      return {
        success: false,
        error: z.flattenError(validation.error).fieldErrors,
      };
    }

    const routeros = await db.insert(schema.routeros).values({
      name: validation.data.name,
      host: validation.data.host,
      port: validation.data.port,
      user: validation.data.user,
      password: validation.data.password,
      tls: validation.data.tls,
    });

    return { success: true, data: routeros };
  });

export function useCreateRouterosMutation() {
  const mutate = useServerFn($createRouteros);
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

const updateRouterosInputSchema = z.extend(createRouterosInputSchema, {
  id: z.coerce.number().check(z.int(), z.minimum(1)),
});

type UpdateRouterosInputSchema = z.input<typeof updateRouterosInputSchema>;

const $updateRouteros = createServerFn({ method: "POST" })
  .validator((d: UpdateRouterosInputSchema) => d)
  .handler(async ({ data }) => {
    const validation = updateRouterosInputSchema.safeParse(data);

    if (!validation.success) {
      return {
        success: false,
        errors: z.flattenError(validation.error).fieldErrors,
      };
    }

    const routeros = await db.query.routeros.findFirst({
      where: {
        id: validation.data.id,
      },
      columns: {
        id: true,
      },
    });

    if (!routeros) {
      return { success: false, error: "RouterOS not found" };
    }

    const updatedRouteros = await db
      .update(schema.routeros)
      .set({
        name: validation.data.name,
        host: validation.data.host,
        port: validation.data.port,
        user: validation.data.user,
        password: validation.data.password,
        tls: validation.data.tls,
      })
      .where(eq(schema.routeros.id, routeros.id));

    return { success: true, data: updatedRouteros };
  });

export function useUpdateRouterosMutation() {
  const mutate = useServerFn($updateRouteros);
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

const deleteRouterosInputSchema = z.object({
  id: z.coerce.number(),
});

type DeleteRouterosInputSchema = z.input<typeof deleteRouterosInputSchema>;

const $deleteRouteros = createServerFn({ method: "POST" })
  .validator((d: DeleteRouterosInputSchema) => d)
  .handler(async ({ data }) => {
    const validation = deleteRouterosInputSchema.safeParse(data);

    if (!validation.success) {
      return {
        success: false,
        error: "Routeros not found",
      };
    }

    const routeros = await db.query.routeros.findFirst({
      where: {
        id: validation.data.id,
      },
      columns: {
        id: true,
      },
    });

    if (!routeros) {
      return { success: false, error: "RouterOS not found" };
    }

    await db.delete(schema.routeros).where(eq(schema.routeros.id, routeros.id));

    return { success: true };
  });

export function useDeleteRouterosMutation() {
  const mutate = useServerFn($deleteRouteros);
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

const getAllRouterosInputSchema = z.object({
  ...getFindManyCursorInputSchema(20).shape,
});

type GetAllRouterosInputSchema = z.input<typeof getAllRouterosInputSchema>;

const $getAllRouteros = createServerFn()
  .validator(getAllRouterosInputSchema)
  .handler(async ({ data }) => {
    return await findManyCursor<schema.Routeros, ["id"]>({
      query: data,
      cursorFields: ["id"],
      findMany: ({ limit, cursor }) => {
        return db.query.routeros.findMany({
          limit,
          orderBy: {
            id: "desc",
          },
          where: {
            id: {
              lt: cursor?.id,
            },
          },
        });
      },
    });
  });

function getAllRouterosQueryOptions({
  queryFn,
  opts,
}: {
  queryFn: (
    ...args: Parameters<typeof $getAllRouteros>
  ) => ReturnType<typeof $getAllRouteros>;
  opts: GetAllRouterosInputSchema;
}) {
  return infiniteQueryOptions({
    initialPageParam: undefined as string | undefined,
    queryKey: ["routeros", opts],
    queryFn: (args) => queryFn({ data: { ...opts, cursor: args.pageParam } }),
    getNextPageParam: (lastPage) => lastPage.pageInfo.nextCursor,
    select: ({ pages }) => pages.flatMap((page) => page.items),
    placeholderData: keepPreviousData,
  });
}

export function ensureGetAllRouterosInfiniteQueryData({
  queryClient,
  opts,
}: {
  queryClient: QueryClient;
  opts: GetAllRouterosInputSchema;
}) {
  return queryClient.infiniteQuery(
    getAllRouterosQueryOptions({ opts, queryFn: $getAllRouteros }),
  );
}

export function useGetAllRouterosSuspenseInfiniteQuery(
  opts: GetAllRouterosInputSchema,
) {
  const getter = useServerFn($getAllRouteros);
  return useSuspenseInfiniteQuery(
    getAllRouterosQueryOptions({ opts, queryFn: getter }),
  );
}

//

const getRouterosInputSchema = z.object({
  id: z.coerce.number().check(z.int(), z.minimum(1)),
});

type GetRouterosInputSchema = z.input<typeof getRouterosInputSchema>;

export const $getRouteros = createServerFn()
  .validator((d: GetRouterosInputSchema) => d)
  .handler(async ({ data }) => {
    const validation = getRouterosInputSchema.safeParse(data);
    if (!validation.success) return null;
    const routeros = await db.query.routeros.findFirst({
      where: { id: validation.data.id },
    });
    return routeros || null;
  });

//

export const $getActiveRouteros = createServerFn().handler(async () => {
  const session = await getSession();
  if (!session || !session.data.routerosId) return null;
  const routeros = await db.query.routeros.findFirst({
    where: { id: session.data.routerosId },
  });
  return routeros || null;
});
