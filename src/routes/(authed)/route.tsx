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
  GaugeCircleIcon,
  LucideIcon,
  MegaphoneIcon,
  NetworkIcon,
  PanelLeftCloseIcon,
  PanelLeftOpenIcon,
  PrinterIcon,
  RouterIcon,
  SettingsIcon,
  SquareTextIcon,
  TicketIcon,
  UserIcon,
  WifiIcon,
  WorkflowIcon,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Logo } from "~/components/logo";
import ProfilePopover from "~/components/profile-popover";
import RouterosPopover from "~/components/routeros-popover";
import { APP_NAME, GITHUB_URL } from "~/contants/app";

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
    icon: WorkflowIcon,
    title: "PPP",
    children: [
      {
        title: "Secrets",
        to: "/app/ppp/secrets",
      },
      {
        title: "Profiles",
        to: "/app/ppp/profiles",
      },
      {
        title: "Actives",
        to: "/app/ppp/actives",
      },
    ],
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
    icon: UserIcon,
    title: "Account",
    to: "/account",
  },
  {
    icon: SettingsIcon,
    title: "Settings",
    to: "/settings",
  },
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
  onMenuClicked,
}: {
  menu: Extract<MenuItem, { children: unknown[] }>;
  onMenuClicked: () => void;
}) {
  const [collapsed, setCollapsed] = useState(false);
  return (
    <div className="flex flex-col gap-0.5">
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
            onClick={onMenuClicked}
            className="flex h-9 w-full items-center gap-2 rounded-lg px-3 transition-all hover:bg-neutral-100 [&.active]:bg-brand/10 [&.active]:text-brand"
          >
            {childMenu.title}
          </Link>
        ))}
      </div>
    </div>
  );
}

function Menu({
  visible,
  items,
  onMenuClicked,
}: {
  visible: boolean;
  items: MenuItem[];
  onMenuClicked: () => void;
}) {
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
              onClick={onMenuClicked}
              className="flex h-9 w-full shrink-0 items-center gap-2 rounded-lg px-3 transition-all hover:bg-neutral-100 [&.active]:bg-brand/10 [&.active]:text-brand"
            >
              <menu.icon className="size-4.5" /> {menu.title}
            </Link>
          );
        }

        return (
          <MenuWithChildren key={i} menu={menu} onMenuClicked={onMenuClicked} />
        );
      })}
    </div>
  );
}

function useIsRouterosManagementPage() {
  const router = useRouter();
  const [currentPath, setCurrentPath] = useState(
    router.state.location.pathname,
  );
  const isRouterosManagementPage = currentPath.startsWith("/app");

  useEffect(() => {
    const unsubscribe = router.subscribe("onResolved", (e) => {
      setCurrentPath(e.toLocation.pathname);
    });
    return () => {
      unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return isRouterosManagementPage;
}

function Sidebar({
  closeSidebar,
  showSidebar,
}: {
  closeSidebar: () => void;
  showSidebar: boolean;
}) {
  const isRouterosManagementPage = useIsRouterosManagementPage();

  return (
    <aside
      className={cn(
        "fixed top-0 z-20 h-screen w-full shrink-0 lg:pointer-events-auto lg:sticky lg:w-max",
        showSidebar ? "lg:w-max" : "pointer-events-none",
      )}
    >
      {/* backdrop */}
      <div
        className={cn(
          "fixed size-full bg-black/50 transition-all lg:pointer-events-none",
          showSidebar ? "opacity-100" : "opacity-0",
        )}
        onClick={closeSidebar}
      />

      <div
        className={cn(
          "relative z-1 flex h-full w-64 flex-col border-r bg-white transition-transform lg:translate-x-0",
          showSidebar ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-14 shrink-0 items-center border-b px-4 py-2">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-lg font-bold"
            onClick={closeSidebar}
          >
            <Logo className="size-6" /> {APP_NAME}
          </Link>
          <button
            type="button"
            className="ml-auto text-neutral-500 transition-all hover:text-foreground lg:hidden"
            onClick={closeSidebar}
          >
            <PanelLeftCloseIcon className="size-4.5" />
          </button>
        </div>
        <div className="grow overflow-y-auto p-2">
          <div className="relative overflow-x-hidden">
            <Menu
              onMenuClicked={closeSidebar}
              items={menus}
              visible={isRouterosManagementPage}
            />
            <Menu
              onMenuClicked={closeSidebar}
              items={generalMenus}
              visible={!isRouterosManagementPage}
            />
          </div>
        </div>
        <div className="w-full border-t p-2">
          <a
            href={`${GITHUB_URL}/issues/new`}
            target="_blank"
            className="flex h-9 w-full items-center gap-2 rounded-lg px-3 text-neutral-700 hover:bg-neutral-100"
            onClick={closeSidebar}
            rel="noreferrer"
          >
            <MegaphoneIcon className="size-4.5" /> Feedback
          </a>
        </div>
      </div>
    </aside>
  );
}

function Header({
  showSidebar,
  toggleSidebar,
}: {
  toggleSidebar: () => void;
  showSidebar: boolean;
}) {
  const isRouterosManagementPage = useIsRouterosManagementPage();
  const user = Route.useRouteContext({ select: (state) => state.user });
  const routeros = Route.useRouteContext({ select: (state) => state.routeros });

  return (
    <header className="sticky top-0 z-10 flex h-14 items-center justify-between gap-4 border-b bg-white px-4 sm:px-6 md:px-8">
      <div className="flex items-center gap-6">
        <button
          type="button"
          className="text-neutral-500 transition-all hover:text-foreground lg:hidden"
          onClick={toggleSidebar}
        >
          {showSidebar ? (
            <PanelLeftCloseIcon className="size-4.5" />
          ) : (
            <PanelLeftOpenIcon className="size-4.5" />
          )}
        </button>
        {routeros && isRouterosManagementPage && (
          <RouterosPopover routeros={routeros} />
        )}
      </div>
      <ProfilePopover user={user} />
    </header>
  );
}

function RouteComponent() {
  const [showSidebar, setShowSidebar] = useState(false);

  const closeSidebar = useCallback(() => {
    setShowSidebar(false);
  }, []);

  const toggleSidebar = useCallback(() => {
    setShowSidebar((prev) => !prev);
  }, []);

  return (
    <div className="flex size-full">
      <Sidebar showSidebar={showSidebar} closeSidebar={closeSidebar} />
      <div className="relative z-10 min-w-0 grow">
        <Header showSidebar={showSidebar} toggleSidebar={toggleSidebar} />
        <main className="px-4 py-6 sm:px-6 md:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
