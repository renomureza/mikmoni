import { createFileRoute } from "@tanstack/react-router";
import {
  BadgeDollarSignIcon,
  HouseWifiIcon,
  LucideIcon,
  TicketIcon,
  UserPlusIcon,
  UserRoundArrowLeftIcon,
} from "lucide-react";
import { formatBytes, prettifyDuration } from "~/utils/routeros";
import {
  Area,
  AreaChart,
  CartesianGrid,
  createHorizontalChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { CSSProperties, useEffect, useState } from "react";
import { cn } from "cn";
import { $getInterfaceTraffic } from "~/serverfns/interface";
import Button from "~/components/button";
import Gauge from "~/components/gauge";
import { formatCurrency, formatNumber } from "~/utils/number";
import { Trans, useLingui } from "@lingui/react/macro";
import {
  ensureGetHotspotLogsQuery,
  useGetHotspotLogsSuspenseQuery,
} from "~/serverfns/hotspot-log";
import {
  ensureGetHotspotActivesQuery,
  useGetHotspotActivesSuspenseQuery,
} from "~/serverfns/hotspot-active";
import { msg } from "@lingui/core/macro";
import RouterosPage from "~/components/routeros-page";
import {
  ensureGetStatsOverviewQueryData,
  useGetStatsOverviewSuspenseQuery,
} from "~/serverfns/stats";

export const Route = createFileRoute("/(authed)/app/")({
  component: RouteComponent,
  loader: async ({ context }) => {
    await Promise.all([
      ensureGetStatsOverviewQueryData({
        queryClient: context.queryClient,
      }),
      ensureGetHotspotLogsQuery({
        queryClient: context.queryClient,
      }),
      ensureGetHotspotActivesQuery({
        queryClient: context.queryClient,
      }),
    ]);

    return { title: context.i18n.t(msg`Dashboard`) };
  },
  head: ({ loaderData }) => ({ meta: [{ title: loaderData?.title }] }),
});

const Typed = createHorizontalChart<
  { time: string; rx: string; tx: string },
  string,
  number
>()({ Area, AreaChart, XAxis, YAxis, Tooltip });

function TrafficChart({ className }: { className?: string }) {
  const [data, setData] = useState<{ time: number; rx: number; tx: number }[]>(
    [],
  );
  const isAnimationActive = true;

  useEffect(() => {
    const controller = new AbortController();
    void $getInterfaceTraffic({ signal: controller.signal }).then((data) => {
      setData((prev) => [
        ...(prev.length > 10 ? prev.slice(1) : prev).concat({
          rx: Number(data["rx-bits-per-second"]),
          tx: Number(data["tx-bits-per-second"]),
          time: Date.now(),
        }),
      ]);
    });

    const interval = setInterval(() => {
      void $getInterfaceTraffic({ signal: controller.signal }).then((data) => {
        setData((prev) => [
          ...(prev.length > 10 ? prev.slice(1) : prev).concat({
            rx: Number(data["rx-bits-per-second"]),
            tx: Number(data["tx-bits-per-second"]),
            time: Date.now(),
          }),
        ]);
      });
    }, 5_000);

    return () => {
      controller.abort();
      clearInterval(interval);
    };
  }, []);

  return (
    <Typed.AreaChart
      className={cn("**:outline-none", className)}
      style={{
        width: "100%",
        aspectRatio: 1.618,
      }}
      responsive
      data={data}
      margin={{ top: 10, right: 0, left: 0, bottom: 0 }}
    >
      <defs>
        <linearGradient id="colorTx" x1="0" y1="0" x2="0" y2="1">
          <stop
            offset="5%"
            stopColor="var(--color-green-600)"
            stopOpacity={0.18}
          />
          <stop
            offset="95%"
            stopColor="var(--color-green-600)"
            stopOpacity={0}
          />
        </linearGradient>
        <linearGradient id="colorRx" x1="0" y1="0" x2="0" y2="1">
          <stop
            offset="5%"
            stopColor="var(--color-purple-600)"
            stopOpacity={0.18}
          />
          <stop
            offset="95%"
            stopColor="var(--color-purple-600)"
            stopOpacity={0}
          />
        </linearGradient>
      </defs>
      <CartesianGrid
        strokeDasharray="3 3"
        strokeWidth={0.5}
        stroke="var(--color-neutral-400)"
      />
      <Typed.XAxis
        dataKey="time"
        stroke="var(--color-neutral-400)"
        strokeWidth={0.5}
        minTickGap={5}
        dy={6}
        fontSize={11}
        tickLine={false}
        axisLine={false}
        tickFormatter={(d) => {
          return new Intl.DateTimeFormat("en", {
            timeStyle: "medium",
          }).format(d);
        }}
      />
      <Typed.YAxis
        width="auto"
        niceTicks="none"
        fontSize={11}
        stroke="var(--color-neutral-400)"
        strokeWidth={0.5}
        tickFormatter={(d: number) => formatBytes(d, { decimals: 0 })}
        tickLine={false}
        axisLine={false}
      />
      <Typed.Tooltip
        cursor={{
          stroke: "var(--color-neutral-300)",
          strokeDasharray: "3 3",
          strokeWidth: 1,
        }}
        content={({ active, payload, label }) => {
          const firstPayload = payload?.[0];
          const isVisible = active && firstPayload;
          if (!isVisible) return;

          return (
            <div
              className={cn(
                "rounded-lg border bg-white px-3 py-2 text-xs shadow-lg transition-all",
              )}
            >
              <div className="flex flex-col gap-2">
                <div className="text-neutral-600">
                  {new Intl.DateTimeFormat("en", {
                    timeStyle: "medium",
                  }).format(Number(label))}
                </div>
                <div className="space-y-0.5">
                  <div>RX: {formatBytes(firstPayload.payload.rx)}</div>
                  <div>TX: {formatBytes(firstPayload.payload.tx)}</div>
                </div>
              </div>
            </div>
          );
        }}
      />
      <Typed.Area
        dot={false}
        // @ts-ignore
        dataKey="tx"
        stroke="var(--color-green-600)"
        strokeWidth={1.75}
        fill="url(#colorTx)"
        fillOpacity={0.6}
        isAnimationActive={isAnimationActive}
      />
      <Typed.Area
        dot={false}
        // @ts-ignore
        dataKey="rx"
        stroke="var(--color-purple-600)"
        strokeWidth={1.75}
        fill="url(#colorRx)"
        fillOpacity={0.6}
        isAnimationActive={isAnimationActive}
      />
    </Typed.AreaChart>
  );
}

function StatsCard({
  title,
  icon: Icon,
  value,
  subTitle,
  subValue,
}: {
  title: React.ReactNode;
  icon: LucideIcon;
  value: React.ReactNode;
  subValue?: React.ReactNode;
  subTitle: React.ReactNode;
}) {
  return (
    <div className="space-y-3 rounded-xl border border-neutral-200 bg-white px-6 py-5">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold">{title}</h2>
        <Icon className="size-5 text-brand" />
      </div>
      <div>
        <div className="inline-flex items-center gap-2">
          <span className="text-2xl font-semibold">{value}</span>
          <span className="text-neutral-500">{subValue}</span>
        </div>
        <div className="text-neutral-500">{subTitle}</div>
      </div>
    </div>
  );
}

function ProgressBar({
  label,
  percentage,
}: {
  label: React.ReactNode;
  percentage: number;
}) {
  const percent = new Intl.NumberFormat("en", { style: "percent" }).format(
    percentage,
  );

  return (
    <div className="flex items-center gap-2">
      <div className="w-20 text-neutral-500">{label}</div>
      <div className="flex grow items-center gap-2">
        <div className="h-1 grow overflow-hidden rounded-full bg-neutral-200">
          <div
            style={{ "--width": percent } as CSSProperties}
            className={cn(
              "h-full w-(--width) transition-[width]",
              percentage < 0.9 ? "bg-brand" : "bg-red-600",
            )}
          />
        </div>
        <div className="w-10 text-right font-semibold tabular-nums">
          {percent}
        </div>
      </div>
    </div>
  );
}

function RouteComponent() {
  const { currency, language } = Route.useRouteContext({
    select: (state) => state.localization,
  });
  const { title } = Route.useLoaderData();
  const { t } = useLingui();

  const statsOverviewQuery = useGetStatsOverviewSuspenseQuery();
  const hotspotLogsQuery = useGetHotspotLogsSuspenseQuery();
  const hotspotActivesQuery = useGetHotspotActivesSuspenseQuery();

  const formatNum = (value: number) =>
    formatNumber(value, { locale: language });

  return (
    <RouterosPage
      className="@container"
      title={title}
      actions={
        <Button>
          <UserPlusIcon className="size-4" />
          <Trans>Generate Users</Trans>
        </Button>
      }
    >
      <div className="grid grid-cols-1 gap-4 @xl:grid-cols-2 @5xl:grid-cols-4">
        <StatsCard
          title={<Trans>Hotspot User</Trans>}
          icon={UserRoundArrowLeftIcon}
          subTitle={
            <Trans>{`${statsOverviewQuery.data.actives.avgUptimeSeconds} avg uptime`}</Trans>
          }
          value={formatNum(statsOverviewQuery.data.actives.count)}
        />
        <StatsCard
          title={<Trans>Unused Voucher</Trans>}
          icon={TicketIcon}
          subTitle={
            <Trans>{`${statsOverviewQuery.data.voucher.used} used`}</Trans>
          }
          value={formatNum(statsOverviewQuery.data.voucher.unused)}
        />
        <StatsCard
          title={<Trans>Active PPP</Trans>}
          icon={HouseWifiIcon}
          subTitle={
            <Trans>{`${statsOverviewQuery.data.ppp.pppAvgUptime} avg uptime`}</Trans>
          }
          value={formatNum(statsOverviewQuery.data.ppp.count)}
        />
        <StatsCard
          title={<Trans>Today's Revenue</Trans>}
          icon={BadgeDollarSignIcon}
          subTitle={`${formatCurrency(statsOverviewQuery.data.revenue.thisMonth, { currency, locale: language })} this month (${statsOverviewQuery.data.revenue.thisMonthVoucher} vcr)`}
          value={formatCurrency(statsOverviewQuery.data.revenue.today, {
            currency,
            locale: language,
          })}
          subValue={
            <Trans>{`${statsOverviewQuery.data.revenue.todayVoucher} vcr`}</Trans>
          }
        />
      </div>

      <div className="flex w-full flex-col gap-4 @2xl:flex-row">
        <div className="grow space-y-3 rounded-xl border border-neutral-200 bg-white px-6 py-5">
          <h2 className="text-base font-semibold">
            <Trans>Traffic</Trans>
          </h2>
          <div>
            <TrafficChart className="h-50" />
          </div>
        </div>

        <div className="space-y-3 rounded-xl border border-neutral-200 bg-white px-6 py-5 lg:w-sm">
          <h2 className="text-base font-semibold">
            <Trans>RouterOS Health</Trans>
          </h2>
          <div>
            <div className="flex items-center justify-center">
              <Gauge
                label={t`CPU Usage`}
                size={250}
                value={Number(statsOverviewQuery.data.resource["cpu-load"])}
              />
            </div>
            <div className="space-y-1">
              <ProgressBar
                label={<Trans>Memory</Trans>}
                percentage={
                  Number(statsOverviewQuery.data.resource["free-memory"]) /
                  Number(statsOverviewQuery.data.resource["total-memory"])
                }
              />
              <ProgressBar
                label={<Trans>Disk</Trans>}
                percentage={
                  Number(statsOverviewQuery.data.resource["free-hdd-space"]) /
                  Number(statsOverviewQuery.data.resource["total-hdd-space"])
                }
              />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 @3xl:grid-cols-12">
        <div className="space-y-3 rounded-xl border border-neutral-200 bg-white pt-5 @3xl:col-span-5">
          <div className="px-6">
            <h2 className="text-base font-semibold">
              <Trans>Hotspot Log</Trans>
            </h2>
          </div>
          <div className="h-full max-h-72 overflow-y-auto">
            <table className="h-full w-full text-left [&_tbody]:text-neutral-700 [&_tbody_tr:not(:last-child)]:border-b [&_td]:py-2 [&_th]:sticky [&_th]:top-0 [&_th]:border-b [&_th]:bg-neutral-100 [&_th]:py-2.5 [&_th]:text-xs [&_th]:font-normal [&_th]:text-neutral-500 [&_th,&_td]:px-5 [&_thead_tr]:border-b">
              <thead>
                <tr>
                  <th>
                    <Trans>Time</Trans>
                  </th>
                  <th>
                    <Trans>Users IP</Trans>
                  </th>
                  <th>
                    <Trans>Messages</Trans>
                  </th>
                </tr>
              </thead>
              <tbody>
                {hotspotLogsQuery.data.length ? (
                  hotspotLogsQuery.data.map((log) => (
                    <tr key={log[".id"]}>
                      <td>{log.time}</td>
                      <td>{log.userIp}</td>
                      <td>{log.message}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3}>
                      <div className="flex min-h-full items-center justify-center text-center font-medium">
                        <Trans>No Results Found</Trans>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-3 rounded-xl border border-neutral-200 bg-white pt-5 @3xl:col-span-7">
          <div className="px-6">
            <h2 className="text-base font-semibold">
              <Trans>Hotspot Active</Trans>
            </h2>
          </div>
          <div className="h-full max-h-72 overflow-y-auto">
            <table className="h-full w-full text-left [&_tbody]:text-neutral-700 [&_tbody_tr:not(:last-child)]:border-b [&_td]:py-2 [&_th]:sticky [&_th]:top-0 [&_th]:border-b [&_th]:bg-neutral-100 [&_th]:py-2.5 [&_th]:text-xs [&_th]:font-normal [&_th]:text-neutral-500 [&_th,&_td]:px-5 [&_thead_tr]:border-b">
              <thead>
                <tr>
                  <th>
                    <Trans>User</Trans>
                  </th>
                  <th>
                    <Trans>Uptime</Trans>
                  </th>
                  <th>
                    <Trans>Address</Trans>
                  </th>
                  <th>
                    <Trans>Bytes In</Trans>
                  </th>
                  <th>
                    <Trans>Bytes Out</Trans>
                  </th>
                </tr>
              </thead>
              <tbody>
                {hotspotActivesQuery.data.length ? (
                  hotspotActivesQuery.data.map((log) => (
                    <tr key={log[".id"]}>
                      <td>{log.user}</td>
                      <td>{log.address}</td>
                      <td>{prettifyDuration(log.uptime)}</td>
                      <td>{formatBytes(log["bytes-in"])}</td>
                      <td>{formatBytes(log["bytes-out"])}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5}>
                      <div className="flex min-h-full items-center justify-center text-center font-medium">
                        <Trans>No Results Found</Trans>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </RouterosPage>
  );
}
