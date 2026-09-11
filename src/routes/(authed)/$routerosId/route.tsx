import {
  createFileRoute,
  Link,
  LinkProps,
  Outlet,
} from "@tanstack/react-router";
import { cn } from "cn";
import {
  ChevronDownIcon,
  GaugeCircleIcon,
  LucideIcon,
  NetworkIcon,
  SquareTextIcon,
  WifiIcon,
} from "lucide-react";
import { useState } from "react";
import { $getRouteros } from "~/services/routeros/client";

export const Route = createFileRoute("/(authed)/$routerosId")({
  component: RouteComponent,
  loader: async ({ params }) => {
    const routeros = await $getRouteros({ data: { id: params.routerosId } });
    return { routeros };
  },
});

const menus = [
  {
    icon: GaugeCircleIcon,
    title: "Dashboard",
    to: "/$routerosId",
  },
  {
    icon: WifiIcon,
    title: "Hotspot",
    children: [
      {
        title: "Users",
        to: "/$routerosId/hotspot/users",
      },
      {
        title: "Profiles",
        to: "/$routerosId/hotspot/profiles",
      },
      {
        title: "Actives",
        to: "/$routerosId/hotspot/actives",
      },
      {
        title: "Hosts",
        to: "/$routerosId/hotspot/hosts",
      },
    ],
  },
  {
    icon: NetworkIcon,
    title: "DHCP Leases",
    to: "/$routerosId/dhcp-leases",
  },
  {
    icon: SquareTextIcon,
    title: "Logs",
    to: "/$routerosId/log",
  },
] satisfies (
  | { icon: LucideIcon; title: string; to: LinkProps["to"] }
  | {
      icon: LucideIcon;
      title: string;
      children: { title: string; to: LinkProps["to"] }[];
    }
)[];

function MenuWithChildren({
  menu,
  routerosId,
}: {
  routerosId: string;
  menu: Extract<(typeof menus)[number], { children: any[] }>;
}) {
  const [collapsed, setCollapsed] = useState(false);
  return (
    <div className="flex flex-col [&_a:has(active)]:bg-red-50">
      <button
        type="button"
        className="flex w-full items-center gap-2 px-2.5 transition-all justify-between h-8 hover:bg-neutral-100 rounded-lg "
        onClick={() => {
          setCollapsed((prev) => !prev);
        }}
      >
        <div className="flex items-center gap-2 ">
          <menu.icon className="size-4" /> {menu.title}
        </div>
        <ChevronDownIcon
          className={cn("size-3.5 transition-all", collapsed && "rotate-180")}
        />
      </button>
      <div
        className={cn(
          "flex flex-col pl-2 mx-4 gap-0.5 border-l",
          !collapsed && "hidden",
        )}
      >
        {menu.children.map((childMenu, i) => (
          <Link
            key={i}
            to={childMenu.to}
            params={{ routerosId }}
            className="[&.active]:bg-neutral-100 flex w-full items-center gap-2 px-2.5 h-8 hover:bg-neutral-100 rounded-lg transition-all"
          >
            {childMenu.title}
          </Link>
        ))}
      </div>
    </div>
  );
}

function RouteComponent() {
  const routerosId = Route.useParams({ select: (s) => s.routerosId });

  return (
    <div className="flex size-full">
      <div className="bg-white flex flex-col w-60 border-r h-screen sticky top-0">
        <div className="border-b px-4 py-3">
          <Link to="/" className="text-lg font-semibold">
            MIKMONI
          </Link>
        </div>
        <div className="w-full px-2 py-2 flex flex-col gap-0.5 grow overflow-y-auto">
          {menus.map((menu, i) => {
            if (!menu.children) {
              return (
                <Link
                  key={i}
                  to={menu.to}
                  params={{ routerosId: routerosId }}
                  activeOptions={{ exact: true }}
                  className="[&.active]:bg-neutral-100 flex shrink-0 w-full items-center gap-2 px-2.5 transition-all h-8 hover:bg-neutral-100 rounded-lg "
                >
                  <menu.icon className="size-4" /> {menu.title}
                </Link>
              );
            }

            return (
              <MenuWithChildren key={i} menu={menu} routerosId={routerosId} />
            );
          })}
        </div>
      </div>
      <div className="grow p-4">
        <Outlet />
      </div>
    </div>
  );
}
