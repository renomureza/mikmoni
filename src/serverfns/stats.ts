import {
  keepPreviousData,
  QueryClient,
  queryOptions,
  useQuery,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { createServerFn, useServerFn } from "@tanstack/react-start";
import { authAndRouterosMiddleware } from "~/middlewares/auth";
import {
  constructRouterosDate,
  formatDuration,
  getRouterosMonthList,
  parseDuration,
  parseScriptName,
} from "~/utils/routeros";

type Resource = {
  "free-memory": string;
  "total-memory": string;
  "cpu-load": string;
  "free-hdd-space": string;
  "total-hdd-space": string;
};

const $getStatsOverview = createServerFn()
  .middleware([authAndRouterosMiddleware])
  .handler(async ({ context }) => {
    const today = new Date();

    const sampleDate = await context.routerosClient
      .write("/system/clock/print", {
        ".proplist": "date",
      })
      .then((d) => d[0].date);

    const months = getRouterosMonthList(sampleDate);

    const [resource, actives, users, scripts, ppp] = await Promise.all([
      context.routerosClient
        .write("/system/resource/print", {
          ".proplist":
            "free-memory,total-memory,cpu-load,total-hdd-space,free-hdd-space",
        })
        .then((d) => d[0] as Resource),
      context.routerosClient.write("/ip/hotspot/active/print", {
        ".proplist": "uptime",
      }) as Promise<{ uptime: string }[]>,
      context.routerosClient.write(
        "/ip/hotspot/user/print",
        {
          ".proplist": "uptime,comment",
        },
        [".id=*0", "#!"],
      ) as Promise<{ comment: string; uptime: string }[]>,
      context.routerosClient.write(
        "/system/script/print",
        {
          ".proplist": "name",
        },
        [
          "comment=mikhmon",
          `owner=${months[today.getMonth()]}${today.getFullYear()}`,
          "#&",
        ],
      ) as Promise<{ name: string }[]>,
      context.routerosClient.write("/ppp/active/print", {
        ".proplist": "uptime",
      }) as Promise<{ uptime: string }[]>,
    ]);

    const avgUptimeSeconds = actives.length
      ? actives.reduce((acc, curr) => parseDuration(curr.uptime) + acc, 0) /
        actives.length
      : 0;

    const voucher = users.reduce(
      (acc, curr) => {
        const isUnused =
          (curr.comment.startsWith("vc-") || curr.comment.startsWith("up-")) &&
          curr.uptime === "0s";

        if (isUnused) {
          return { ...acc, unused: acc.unused + 1 };
        }

        return { ...acc, used: acc.used + 1 };
      },
      { used: 0, unused: 0 },
    );

    const todayDateRouteros = constructRouterosDate(sampleDate, today);

    const revenue = scripts.reduce(
      (acc, curr) => {
        const { price, date } = parseScriptName(curr.name);
        const isToday = date === todayDateRouteros;

        return {
          ...acc,
          today: !isToday ? acc.today : acc.today + price,
          todayVoucher: !isToday ? acc.todayVoucher : acc.todayVoucher + 1,
          thisMonth: acc.thisMonth + price,
          thisMonthVoucher: acc.thisMonthVoucher + 1,
        };
      },
      { today: 0, todayVoucher: 0, thisMonth: 0, thisMonthVoucher: 0 },
    );

    const pppAvgUptime = ppp.length
      ? ppp.reduce((acc, curr) => parseDuration(curr.uptime) + acc, 0) /
        ppp.length
      : 0;

    return {
      resource,
      actives: {
        count: actives.length,
        avgUptimeSeconds: formatDuration(avgUptimeSeconds),
      },
      voucher,
      revenue,
      ppp: {
        count: ppp.length,
        pppAvgUptime: formatDuration(pppAvgUptime),
      },
    };
  });

function getStatsOverviewQueryOptions({
  queryFn,
}: {
  queryFn: (
    ...args: Parameters<typeof $getStatsOverview>
  ) => ReturnType<typeof $getStatsOverview>;
}) {
  return queryOptions({
    queryKey: ["stats-overview"],
    queryFn: () => queryFn(),
    placeholderData: keepPreviousData,
  });
}

export function useGetStatsOverviewQuery() {
  const query = useServerFn($getStatsOverview);
  return useQuery(getStatsOverviewQueryOptions({ queryFn: query }));
}

export function ensureGetStatsOverviewQueryData({
  queryClient,
}: {
  queryClient: QueryClient;
}) {
  return queryClient.query(
    getStatsOverviewQueryOptions({ queryFn: $getStatsOverview }),
  );
}

export function useGetStatsOverviewSuspenseQuery() {
  const getter = useServerFn($getStatsOverview);
  return useSuspenseQuery(getStatsOverviewQueryOptions({ queryFn: getter }));
}
