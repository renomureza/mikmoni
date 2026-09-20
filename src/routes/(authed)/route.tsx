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
  ChevronDownIcon,
  EllipsisVerticalIcon,
  GaugeCircleIcon,
  LogOutIcon,
  LucideIcon,
  NetworkIcon,
  PrinterIcon,
  RouterIcon,
  SettingsIcon,
  SquareTextIcon,
  TicketIcon,
  UsersIcon,
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
            className="[&.active]:bg-neutral-100 flex w-full items-center gap-2 px-2.5 h-8 hover:bg-neutral-100 rounded-lg transition-all"
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
        "flex flex-col ransition-[opacity,transform] duration-300 gap-0.5 left-0 top-0",
        visible
          ? "relative w-full opacity-100"
          : "pointer-events-none opacity-0 absolute inset-0 overflow-hidden -translate-x-full",
      )}
    >
      {items.map((menu, i) => {
        if (!("children" in menu)) {
          return (
            <Link
              key={i}
              to={menu.to}
              activeOptions={{ exact: true }}
              className="[&.active]:bg-neutral-100 flex shrink-0 w-full items-center gap-2 px-2.5 transition-all h-8 hover:bg-neutral-100 rounded-lg "
            >
              <menu.icon className="size-4" /> {menu.title}
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
      <div className="bg-white flex flex-col w-60 shrink-0 border-r h-screen sticky top-0">
        <div className="border-b px-4 py-2">
          <Link to="/" className="text-lg font-semibold">
            Mikmoni
          </Link>
        </div>
        <div className="overflow-y-auto p-2 grow">
          <div className="relative overflow-x-hidden">
            <Menu items={menus} visible={showRouterosMenu} />
            <Menu items={generalMenus} visible={!showRouterosMenu} />
          </div>
        </div>
        <div className="px-2 py-2 border-t">
          <Popover.Root>
            <Popover.Trigger className="px-2 py-2 data-popup-open:bg-neutral-100 w-full rounded-xl transition-all hover:bg-neutral-100">
              <div className="flex gap-2 text-left items-center">
                <img
                  src={`https://avatar.vercel.sh/${user.name}?size=30`}
                  className="rounded-full size-7.5 shrink-0"
                />
                <div className="grow">
                  <div className="leading-tight">{user.name}</div>
                  <div className="text-xs text-neutral-600 leading-tight">
                    {user.username}
                  </div>
                </div>
                <EllipsisVerticalIcon className="size-4 shrink-0 text-neutral-600" />
              </div>
            </Popover.Trigger>
            <Popover.Portal>
              <Popover.Positioner sideOffset={8}>
                <Popover.Popup className="relative flex h-(--popup-height,auto) rounded-xl min-w-(--anchor-width) w-(--popup-width,auto) max-w-125 flex-col gap-1 origin-(--transform-origin) bg-white outline-none border shadow-lg transition-[scale,opacity] duration-100 ease-out data-ending-style:scale-[0.98] data-ending-style:opacity-0 data-starting-style:scale-[0.98] data-starting-style:opacity-0">
                  <div className="flex gap-2 text-left items-center border-b px-2 py-2.5">
                    <img
                      src={`https://avatar.vercel.sh/${user.name}?size=30`}
                      className="rounded-full size-7.5 shrink-0"
                    />
                    <div className="grow">
                      <div className="leading-tight">{user.name}</div>
                      <div className="text-xs text-neutral-600 leading-tight">
                        {user.username}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col px-1 gap-px pb-1">
                    <Link
                      to="/"
                      className="px-2 hover:bg-neutral-100 gap-2 w-full rounded-lg text-neutral-700 hover:text-foreground transition-all h-8 flex items-center"
                    >
                      <div className="grow">Settings</div>
                      <SettingsIcon className="size-4 shrink-0" />
                    </Link>
                    <button
                      disabled={logoutMutation.isPending}
                      className="px-2 hover:bg-neutral-100 text-left gap-2 w-full rounded-lg text-neutral-700 hover:text-foreground transition-all h-8 flex items-center"
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
      <div className="grow p-4 min-w-0">
        <Outlet />
      </div>
    </div>
  );
}
