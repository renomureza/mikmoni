import {
  keepPreviousData,
  QueryClient,
  queryOptions,
  useQuery,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { createServerFn, useServerFn } from "@tanstack/react-start";
import * as z from "zod/v4";
import { authAndRouterosMiddleware } from "~/middlewares/auth";

type PppProfiles = {
  ".id": string;
  name: string;
  password?: string;
  "address-list"?: string;
  "only-one": "yes" | "no" | "default";
  comment?: string;
};

const getPppProfilesInputSchema = z.object({
  excludeDefault: z.boolean().optional(),
});

type GetPppProfilesInputSchema = z.input<typeof getPppProfilesInputSchema>;

const $getPppProfiles = createServerFn()
  .middleware([authAndRouterosMiddleware])
  .validator(getPppProfilesInputSchema)
  .handler(async ({ context, data }) => {
    const profiles = (await context.routerosClient.write(
      "/ppp/profile/print",
      { ".proplist": ".id,name,address-list,only-one,comment" },
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
