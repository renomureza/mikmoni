import { createFileRoute, Link } from "@tanstack/react-router";
import { UserGroupIcon, UserPlus2Icon } from "lucide-react";
import {
  ensureGetRouterosInfoQueryData,
  useGetRouterosInfoSuspenseQuery,
} from "~/serverfns/resource";
import { formatBytes, formatUptime } from "~/utils/routeros";
import {
  Area,
  AreaChart,
  CartesianGrid,
  createHorizontalChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useEffect, useState } from "react";
import { cn } from "cn";
import { $getInterfaceTraffic } from "~/serverfns/interface";

export const Route = createFileRoute("/(authed)/app/")({
  component: RouteComponent,
  loader: async ({ context }) => {
    await ensureGetRouterosInfoQueryData({
      queryClient: context.queryClient,
    });
  },
});

const Typed = createHorizontalChart<
  { time: string; rx: string; tx: string },
  string,
  number
>()({ Area, AreaChart, XAxis, YAxis, Tooltip });

function TrafficChart() {
  const [data, setData] = useState<{ time: number; rx: number; tx: number }[]>(
    [],
  );
  const isAnimationActive = true;

  useEffect(() => {
    const controller = new AbortController();
    $getInterfaceTraffic({ signal: controller.signal }).then((data) => {
      setData((prev) => [
        ...(prev.length > 10 ? prev.slice(1) : prev).concat({
          rx: Number(data["rx-bits-per-second"]),
          tx: Number(data["tx-bits-per-second"]),
          time: Date.now(),
        }),
      ]);
    });

    const interval = setInterval(() => {
      $getInterfaceTraffic({ signal: controller.signal }).then((data) => {
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
    <div className="grow bg-white rounded-xl border">
      <div className="border-b py-3 px-6 text-base font-semibold">Traffic</div>
      <div className="px-6 py-4">
        <Typed.AreaChart
          className="**:outline-none"
          style={{
            width: "100%",
            maxHeight: "420px",
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
                    "bg-white shadow-lg transition-all rounded-lg border px-3 py-2 text-xs",
                  )}
                >
                  <div className="flex gap-2 flex-col">
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
      </div>
    </div>
  );
}

function RouteComponent() {
  const routerosInfoQuery = useGetRouterosInfoSuspenseQuery();

  return (
    <div className="mx-auto w-full space-y-4">
      <div className="grid grid-cols-3 gap-4 overflow-hidden ">
        <div className="bg-white border space-y-0.5 rounded-xl px-6 py-5 ">
          <div className="flex gap-1">
            <div className="text-neutral-500">Date & Time:</div>
            <div>
              {routerosInfoQuery.data.clock.date}{" "}
              {routerosInfoQuery.data.clock.time}
            </div>
          </div>
          <div className="flex gap-1">
            <div className="text-neutral-500">Uptime:</div>
            <div>{formatUptime(routerosInfoQuery.data.resource.uptime)}</div>
          </div>
          <div className="flex gap-1">
            <div className="text-neutral-500">Timezone:</div>
            <div>{routerosInfoQuery.data.clock["time-zone-name"]}</div>
          </div>
        </div>
        <div className="bg-white border space-y-0.5 rounded-xl px-6 py-5 ">
          <div className="flex gap-1">
            <div className="text-neutral-500">Board:</div>
            <div>{routerosInfoQuery.data.resource["board-name"]}</div>
          </div>
          <div className="flex gap-1">
            <div className="text-neutral-500">Model:</div>
            <div>{routerosInfoQuery.data.resource.model}</div>
          </div>
          <div className="flex gap-1">
            <div className="text-neutral-500">Routeros:</div>
            <div>{routerosInfoQuery.data.resource.version}</div>
          </div>
        </div>
        <div className="bg-white border space-y-0.5 rounded-xl px-6 py-5 ">
          <div className="flex gap-1">
            <div className="text-neutral-500">CPU Load:</div>
            <div>{routerosInfoQuery.data.resource["cpu-load"]}%</div>
          </div>
          <div className="flex gap-1">
            <div className="text-neutral-500">Memory:</div>
            <div>
              {formatBytes(routerosInfoQuery.data.resource["free-memory"])}
              {" / "}
              {formatBytes(routerosInfoQuery.data.resource["total-memory"])}
            </div>
          </div>
          <div className="flex gap-1">
            <div className="text-neutral-500">HDD:</div>
            <div>
              {formatBytes(routerosInfoQuery.data.resource["free-hdd-space"])}
              {" / "}
              {formatBytes(routerosInfoQuery.data.resource["total-hdd-space"])}
            </div>
          </div>
        </div>
      </div>

      <div className="w-full grid grid-cols-4 gap-4">
        <Link
          to="/app/hotspot/users"
          className="bg-white border rounded-xl px-6 py-5"
        >
          <div className="inline-flex gap-2 items-center">
            <span className="text-2xl font-semibold">0</span>
            <span>items</span>
          </div>
          <div className="text-neutral-500">Hotspot active</div>
        </Link>
        <Link
          to="/app/hotspot/users"
          className="bg-white border rounded-xl px-6 py-5"
        >
          <div className="inline-flex gap-2 items-center">
            <span className="text-2xl font-semibold">0</span>
            <span>items</span>
          </div>
          <div className="text-neutral-500">Hotspot users</div>
        </Link>
        <Link
          to="/app/hotspot/users"
          className="bg-white border rounded-xl px-6 py-5"
        >
          <div className="inline-flex gap-2 items-center">
            <UserPlus2Icon />
            <span>Add</span>
          </div>
          <div className="text-neutral-500">Hotspot users</div>
        </Link>
        <Link
          to="/app/hotspot/users"
          className="bg-white border rounded-xl px-6 py-5"
        >
          <div className="inline-flex gap-2 items-center">
            <UserGroupIcon />
            <span>Generate</span>
          </div>
          <div className="text-neutral-500">Hotspot users</div>
        </Link>
      </div>

      <div className="w-full flex gap-4">
        <TrafficChart />
        <div className="w-96 shrink-0 bg-white border rounded-xl">log</div>
      </div>
    </div>
  );
}
