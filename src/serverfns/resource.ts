import {
  keepPreviousData,
  QueryClient,
  queryOptions,
  useQuery,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { createServerFn, useServerFn } from "@tanstack/react-start";
import * as z from "zod/v4";
import { db } from "~/lib/db";
import { RouterOSClient } from "~/lib/routeros-client";
import { authMiddleware } from "~/middlewares/auth";
import { tryCatch } from "~/utils/utilities";

type Resource = {
  version: string;
  "board-name": string;
  model?: string;
};

const getRouterosResourceInputSchema = z.object({
  id: z.coerce.number(),
});

type GetRouterosResourceInputSchema = z.input<
  typeof getRouterosResourceInputSchema
>;

const $getRouterosResource = createServerFn()
  .middleware([authMiddleware])
  .validator((d: GetRouterosResourceInputSchema) => d)
  .handler(async ({ data }) => {
    const validation = getRouterosResourceInputSchema.safeParse(data);

    if (!validation.success) {
      return { success: false, error: "Routeros not found" };
    }

    const routeros = await db.query.routeros.findFirst({
      where: {
        id: validation.data.id,
      },
      columns: {
        host: true,
        port: true,
        tls: true,
        username: true,
        password: true,
      },
    });

    if (!routeros) {
      return { success: false, error: "Routeros not found" };
    }

    const client = new RouterOSClient({
      host: routeros.host,
      port: routeros.port,
      user: routeros.username,
      password: routeros.password,
      tls: routeros.tls,
      timeout: 5_000,
    });

    const connectRes = await tryCatch(client.connect());

    if (!connectRes.ok) {
      return { success: false, error: connectRes.error };
    }

    const writeRes = await tryCatch(
      client
        .write("/system/resource/print", {
          ".proplist": "version,board-name,model",
        })
        .then((d) => d[0]) as Promise<Resource>,
    );

    await client.close();

    if (!writeRes.ok) {
      return { success: false, error: writeRes.error };
    }

    return { success: true, data: writeRes.data };
  });

function getRouterosResourceQueryOptions({
  queryFn,
  opts,
}: {
  queryFn: (
    ...args: Parameters<typeof $getRouterosResource>
  ) => ReturnType<typeof $getRouterosResource>;
  opts: GetRouterosResourceInputSchema;
}) {
  return queryOptions({
    queryKey: ["routeros", "resource", opts],
    queryFn: () => queryFn({ data: opts }),
    placeholderData: keepPreviousData,
  });
}

export function usegetRouterosResourceQuery(
  opts: GetRouterosResourceInputSchema,
) {
  const query = useServerFn($getRouterosResource);
  return useQuery(getRouterosResourceQueryOptions({ queryFn: query, opts }));
}

export function ensureGetRouterosResourceQueryData({
  queryClient,
  opts,
}: {
  queryClient: QueryClient;
  opts: GetRouterosResourceInputSchema;
}) {
  return queryClient.query(
    getRouterosResourceQueryOptions({ queryFn: $getRouterosResource, opts }),
  );
}

export function useGetRouterosResourceSuspenseQuery(
  opts: GetRouterosResourceInputSchema,
) {
  const getter = useServerFn($getRouterosResource);
  return useSuspenseQuery(
    getRouterosResourceQueryOptions({ queryFn: getter, opts }),
  );
}
