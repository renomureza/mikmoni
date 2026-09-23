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
import { getRouterosMonthList, isISORouterOSDate } from "~/utils/routeros";

type UserLog = {
  ".id": string;
  owner: string;
  name: string;
};

const getUserLogsInputSchema = z.object({
  day: z.coerce.number().int().min(1).max(31).optional().catch(undefined),
  month: z.coerce.number().int().min(1).max(12).optional().catch(undefined),
  year: z.coerce
    .number()
    .int()
    .min(2_000)
    .max(2_999)
    .optional()
    .catch(undefined),
});

type GetUserLogsInputSchema = z.input<typeof getUserLogsInputSchema>;

const $getUserLogs = createServerFn()
  .middleware([authAndRouterosMiddleware])
  .validator(getUserLogsInputSchema)
  .handler(async ({ context, data }) => {
    const sampleDateFormat = await context.routerosClient
      .write("/system/clock/print", { ".proplist": "date" })
      .then((d) => d[0].date);

    const months = getRouterosMonthList(sampleDateFormat);

    const query = [];

    if (data.month && data.year) {
      const month = months[data.month - 1];

      if (data.day) {
        const day = String(data.day).padStart(2, "0");

        if (isISORouterOSDate(sampleDateFormat)) {
          query.push(`=source=${data.year}-${month}-${day}`);
        } else {
          query.push(`=source=${month}/${day}/${data.year}`);
        }
      } else {
        query.push(`=owner=${month}${data.year}`);
      }
    }

    const logs = (await context.routerosClient.write(
      "/system/script/print",
      { ".proplist": ".id,name,owner" },
      query,
    )) as UserLog[];

    return logs.map(({ name, ...log }) => {
      const [date, time, user, , address, macAddress, validity] =
        name.split("-|-");

      return {
        ...log,
        date,
        time,
        user: user as string | undefined,
        address: address as string | undefined,
        macAddress: macAddress as string | undefined,
        validity: validity as string | undefined,
      };
    });
  });

function getUserLogsQueryOptions({
  queryFn,
  opts,
}: {
  queryFn: (
    ...args: Parameters<typeof $getUserLogs>
  ) => ReturnType<typeof $getUserLogs>;
  opts: GetUserLogsInputSchema;
}) {
  return queryOptions({
    queryKey: ["user-log", opts],
    queryFn: () => queryFn({ data: opts }),
    placeholderData: keepPreviousData,
  });
}

export function useGetUserLogsQuery(opts: GetUserLogsInputSchema) {
  const query = useServerFn($getUserLogs);
  return useQuery(getUserLogsQueryOptions({ queryFn: query, opts }));
}

export function ensureGetUserLogsQuery({
  queryClient,
  opts,
}: {
  queryClient: QueryClient;
  opts: GetUserLogsInputSchema;
}) {
  return queryClient.query(
    getUserLogsQueryOptions({ queryFn: $getUserLogs, opts }),
  );
}

export function useGetUserLogsSuspenseQuery(opts: GetUserLogsInputSchema) {
  const getter = useServerFn($getUserLogs);
  return useSuspenseQuery(getUserLogsQueryOptions({ queryFn: getter, opts }));
}
