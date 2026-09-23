import { Popover } from "@base-ui/react";
import {
  createFileRoute,
  Link,
  LinkProps,
  Outlet,
  redirect,
  useRouter,
} from "@tanstack/react-router";
import { cn } from "cn";
import {
  BanknoteIcon,
  ChevronDownIcon,
  EllipsisVerticalIcon,
  GaugeCircleIcon,
  LogOutIcon,
  LucideIcon,
  NetworkIcon,
  PanelLeftCloseIcon,
  PrinterIcon,
  RouterIcon,
  SearchIcon,
  SettingsIcon,
  SquareTextIcon,
  TicketIcon,
  UsersIcon,
  WaypointsIcon,
  WifiIcon,
} from "lucide-react";
import { useState } from "react";
import { useLogoutMutation } from "~/serverfns/auth";

export const Route = createFileRoute("/(authed)")({
  component: RouteComponent,
  beforeLoad: ({ context }) => {
    if (!context.user) {
      throw redirect({ to: "/login" });
    }

    return { user: context.user };
  },
});

const menus = [
  {
    icon: GaugeCircleIcon,
    title: "Dashboard",
    to: "/app",
  },
  {
    icon: WifiIcon,
    title: "Hotspot",
    children: [
      {
        title: "Users",
        to: "/app/hotspot/users",
      },
      {
        title: "Profiles",
        to: "/app/hotspot/profiles",
      },
      {
        title: "Actives",
        to: "/app/hotspot/actives",
      },
      {
        title: "Hosts",
        to: "/app/hotspot/hosts",
      },
      {
        title: "IP Bindings",
        to: "/app/hotspot/ip-bindings",
      },
      {
        title: "Cookies",
        to: "/app/hotspot/cookies",
      },
    ],
  },
  {
    icon: PrinterIcon,
    title: "Quick Print",
    to: "/app/quick-print",
  },
  {
    icon: SquareTextIcon,
    title: "Logs",
    children: [
      {
        title: "Hotspot",
        to: "/app/log/hotspot",
      },
      {
        title: "User",
        to: "/app/log/user",
      },
    ],
  },
  {
    icon: NetworkIcon,
    title: "DHCP Leases",
    to: "/app/dhcp-leases",
  },
  {
    icon: BanknoteIcon,
    title: "Report",
    to: "/app/report",
  },
] satisfies MenuItem[];

const generalMenus = [
  {
    icon: RouterIcon,
    title: "RouterOS",
    to: "/",
  },
  {
    icon: TicketIcon,
    title: "Voucher Templates",
    to: "/voucher-templates",
  },
  {
    icon: UsersIcon,
    title: "Users",
    to: "/users",
  },
  {
    icon: SettingsIcon,
    title: "Settings",
    to: "/settings",
  },
  // {
  //   icon: SettingsIcon,
  //   title: "Settings",
  //   to: "/",
  // },
] satisfies MenuItem[];

type MenuItem =
  | { icon: LucideIcon; title: string; to: LinkProps["to"] }
  | {
      icon: LucideIcon;
      title: string;
      children: { title: string; to: LinkProps["to"] }[];
    };

function MenuWithChildren({
  menu,
}: {
  menu: Extract<MenuItem, { children: any[] }>;
}) {
  const [collapsed, setCollapsed] = useState(false);
  return (
    <div className="flex flex-col gap-0.5 [&_a:has(active)]:bg-red-50">
      <button
        type="button"
        className="flex h-9 w-full items-center justify-between gap-2 rounded-lg px-3 transition-all hover:bg-neutral-100"
        onClick={() => {
          setCollapsed((prev) => !prev);
        }}
      >
        <div className="flex items-center gap-2">
          <menu.icon className="size-4.5" /> {menu.title}
        </div>
        <ChevronDownIcon
          className={cn("size-3.5 transition-all", collapsed && "rotate-180")}
        />
      </button>
      <div
        className={cn(
          "mx-4 flex flex-col gap-0.5 border-l pl-2",
          !collapsed && "hidden",
        )}
      >
        {menu.children.map((childMenu, i) => (
          <Link
            key={i}
            to={childMenu.to}
            className="flex h-9 w-full items-center gap-2 rounded-lg px-3 transition-all hover:bg-neutral-100 [&.active]:bg-brand/10 [&.active]:text-brand"
          >
            {childMenu.title}
          </Link>
        ))}
      </div>
    </div>
  );
}

function Menu({ visible, items }: { visible: boolean; items: MenuItem[] }) {
  return (
    <div
      inert={!visible}
      className={cn(
        "ransition-[opacity,transform] top-0 left-0 flex flex-col gap-1 font-medium text-neutral-700 duration-300",
        visible
          ? "relative w-full opacity-100"
          : "pointer-events-none absolute inset-0 -translate-x-full overflow-hidden opacity-0",
      )}
    >
      {items.map((menu, i) => {
        if (!("children" in menu)) {
          return (
            <Link
              key={i}
              to={menu.to}
              activeOptions={{ exact: true }}
              className="flex h-9 w-full shrink-0 items-center gap-2 rounded-lg px-3 transition-all hover:bg-neutral-100 [&.active]:bg-brand/10 [&.active]:text-brand"
            >
              <menu.icon className="size-4.5" /> {menu.title}
            </Link>
          );
        }

        return <MenuWithChildren key={i} menu={menu} />;
      })}
    </div>
  );
}

function RouteComponent() {
  const user = Route.useRouteContext({ select: (state) => state.user });
  const router = useRouter();
  const currentPath = router.state.location.pathname;
  const showRouterosMenu = currentPath.startsWith("/app");

  const logoutMutation = useLogoutMutation();

  return (
    <div className="flex size-full">
      <div className="sticky top-0 flex h-screen w-64 shrink-0 flex-col border-r bg-white">
        <div className="flex h-14 items-center border-b px-4 py-2">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-lg font-bold"
          >
            <WaypointsIcon /> Mikmoni
          </Link>
        </div>
        <div className="grow overflow-y-auto p-2">
          <div className="relative overflow-x-hidden">
            <Menu items={menus} visible={showRouterosMenu} />
            <Menu items={generalMenus} visible={!showRouterosMenu} />
          </div>
        </div>
        <div className="border-t px-2 py-2">
          <Popover.Root>
            <Popover.Trigger className="w-full rounded-xl px-2 py-2 transition-all hover:bg-neutral-100 data-popup-open:bg-neutral-100">
              <div className="flex items-center gap-2 text-left">
                <img
                  src={`https://avatar.vercel.sh/${user.name}?size=30`}
                  className="size-7.5 shrink-0 rounded-full"
                />
                <div className="grow">
                  <div className="leading-tight">{user.name}</div>
                  <div className="text-xs leading-tight text-neutral-600">
                    {user.username}
                  </div>
                </div>
                <EllipsisVerticalIcon className="size-4 shrink-0 text-neutral-600" />
              </div>
            </Popover.Trigger>
            <Popover.Portal>
              <Popover.Positioner sideOffset={8}>
                <Popover.Popup className="relative flex h-(--popup-height,auto) w-(--popup-width,auto) max-w-125 min-w-(--anchor-width) origin-(--transform-origin) flex-col gap-1 rounded-xl border bg-white shadow-lg transition-[scale,opacity] duration-100 ease-out outline-none data-ending-style:scale-[0.98] data-ending-style:opacity-0 data-starting-style:scale-[0.98] data-starting-style:opacity-0">
                  <div className="flex items-center gap-2 border-b px-2 py-2.5 text-left">
                    <img
                      src={`https://avatar.vercel.sh/${user.name}?size=30`}
                      className="size-7.5 shrink-0 rounded-full"
                    />
                    <div className="grow">
                      <div className="leading-tight">{user.name}</div>
                      <div className="text-xs leading-tight text-neutral-600">
                        {user.username}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-px px-1 pb-1">
                    <Link
                      to="/"
                      className="flex h-8 w-full items-center gap-2 rounded-lg px-2 text-neutral-700 transition-all hover:bg-neutral-100 hover:text-foreground"
                    >
                      <div className="grow">Settings</div>
                      <SettingsIcon className="size-4 shrink-0" />
                    </Link>
                    <button
                      disabled={logoutMutation.isPending}
                      className="flex h-8 w-full items-center gap-2 rounded-lg px-2 text-left text-neutral-700 transition-all hover:bg-neutral-100 hover:text-foreground"
                      type="button"
                      onClick={() => {
                        logoutMutation.mutate();
                      }}
                    >
                      <div className="grow">Logout</div>
                      <LogOutIcon className="size-4 shrink-0" />
                    </button>
                  </div>
                </Popover.Popup>
              </Popover.Positioner>
            </Popover.Portal>
          </Popover.Root>
        </div>
      </div>
      <div className="relative min-w-0 grow">
        <div className="sticky top-0 flex h-14 justify-between border-b bg-white px-8">
          <div className="flex items-center gap-6">
            <button type="button" className="text-neutral-500">
              <PanelLeftCloseIcon className="size-4.5" />
            </button>

            {/* <div className="relative flex h-9 items-center rounded-lg border border-neutral-300 bg-neutral-50 ring-3 ring-transparent transition-all focus-within:border-brand focus-within:ring-brand/20">
              <SearchIcon className="pointer-events-none absolute left-3 size-4 text-neutral-600" />
              <input
                type="text"
                placeholder="Search..."
                className="size-full pr-3 pl-9 outline-none"
              />
            </div> */}
          </div>
          <button type="button">right</button>
        </div>
        <div className="px-8 py-6">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
