import {
  keepPreviousData,
  QueryClient,
  queryOptions,
  useQuery,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { createServerFn, useServerFn } from "@tanstack/react-start";
import * as z from "zod/v4";
import { routerosMiddleware } from "~/middlewares/auth";
import { getRouterosMonthList, isISORouterOSDate } from "~/utils/routeros";

type Report = {
  ".id": string;
  owner: string;
  name: string;
};

const getReportsInputSchema = z.object({
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

type GetReportsInputSchema = z.input<typeof getReportsInputSchema>;

const $getReports = createServerFn()
  .middleware([routerosMiddleware])
  .validator(getReportsInputSchema)
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
    } else {
      query.push("=comment=mikhmon");
    }

    const logs = (await context.routerosClient.write(
      "/system/script/print",
      { ".proplist": ".id,name" },
      query,
    )) as Report[];

    return logs.map(({ name, ...log }) => {
      const [date, time, user, price, , , , profile, comment] =
        name.split("-|-");
      return {
        ...log,
        price,
        date,
        time,
        user,
        profile,
        comment,
      };
    });
  });

function getReportsQueryOptions({
  queryFn,
  opts,
}: {
  queryFn: (
    ...args: Parameters<typeof $getReports>
  ) => ReturnType<typeof $getReports>;
  opts: GetReportsInputSchema;
}) {
  return queryOptions({
    queryKey: ["reports", opts],
    queryFn: () => queryFn({ data: opts }),
    placeholderData: keepPreviousData,
  });
}

export function useGetReportsQuery(opts: GetReportsInputSchema) {
  const query = useServerFn($getReports);
  return useQuery(getReportsQueryOptions({ queryFn: query, opts }));
}

export function ensureGetReportsQuery({
  queryClient,
  opts,
}: {
  queryClient: QueryClient;
  opts: GetReportsInputSchema;
}) {
  return queryClient.query(
    getReportsQueryOptions({ queryFn: $getReports, opts }),
  );
}

export function useGetReportsSuspenseQuery(opts: GetReportsInputSchema) {
  const getter = useServerFn($getReports);
  return useSuspenseQuery(getReportsQueryOptions({ queryFn: getter, opts }));
}
