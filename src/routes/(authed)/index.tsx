import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import Switch from "~/components/switch";
import type z from "zod";
import Input from "~/components/input";
import Dialog from "~/components/dialog";
import {
  EditIcon,
  EllipsisVerticalIcon,
  ExternalLinkIcon,
  PlusIcon,
  RouterIcon,
  Trash2Icon,
} from "lucide-react";
import Button from "~/components/button";
import { Popover } from "@base-ui/react";
import {
  ensureGetAllRouterosInfiniteQueryData,
  useCreateRouterosMutation,
  useDeleteRouterosMutation,
  useGetAllRouterosSuspenseInfiniteQuery,
  useUpdateRouterosMutation,
  useSetRouterosMutation,
} from "~/serverfns/routeros";
import { cn } from "cn";

export const Route = createFileRoute("/(authed)/")({
  component: RouteComponent,
  loader: async ({ context }) => {
    await ensureGetAllRouterosInfiniteQueryData({
      opts: {},
      queryClient: context.queryClient,
    });
  },
});

type RouterosFormState = {
  name: string;
  host: string;
  port: string | number;
  tls: boolean;
  username: string;
  password: string;
  hotspotName: string;
  dnsName: string;
};

function RouterosForm({
  onSubmit,
  initialState,
  errors,
  onCancel,
  isLoading,
}: {
  onSubmit: (routeros: RouterosFormState) => void;
  initialState?: RouterosFormState;
  errors?: z.core.$ZodFlattenedError<RouterosFormState>["fieldErrors"];
  onCancel?: () => void;
  isLoading: boolean;
}) {
  const [state, setState] = useState<RouterosFormState>({
    name: initialState?.name ?? "",
    host: initialState?.host ?? "",
    port: initialState?.port ?? "",
    tls: initialState?.tls ?? false,
    username: initialState?.username ?? "",
    password: initialState?.password ?? "",
    hotspotName: initialState?.hotspotName ?? "",
    dnsName: initialState?.dnsName ?? "",
  });

  const onChange = <
    TKey extends keyof typeof state,
    TValue extends (typeof state)[TKey],
  >(
    key: TKey,
    value: TValue,
  ) => {
    setState((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <form
      className="flex flex-col gap-3"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(state);
      }}
    >
      <Input
        label="Name"
        placeholder="My RouterOS"
        required
        value={state.name}
        onChange={(e) => {
          onChange("name", e.target.value);
        }}
        error={errors?.name?.[0]}
      />
      <div className="flex w-full gap-4">
        <Input
          label="Host"
          placeholder="192.7.0.1"
          required
          value={state.host}
          onChange={(e) => {
            onChange("host", e.target.value);
          }}
          error={errors?.host?.[0]}
        />
        <Input
          label="Port"
          placeholder="8729"
          required
          value={state.port}
          type="number"
          onChange={(e) => {
            onChange("port", e.target.value);
          }}
          error={errors?.port?.[0]}
        />
      </div>
      <Switch
        label="TLS"
        checked={state.tls}
        onCheckedChange={(enabled) => {
          onChange("tls", enabled);
        }}
        error={errors?.tls?.[0]}
      />
      <div className="flex w-full gap-4">
        <Input
          label="Username"
          required
          value={state.username}
          placeholder="admin"
          onChange={(e) => {
            onChange("username", e.target.value);
          }}
          error={errors?.username?.[0]}
        />
        <Input
          label="Password"
          required
          type="password"
          value={state.password}
          onChange={(e) => {
            onChange("password", e.target.value);
          }}
          error={errors?.password?.[0]}
        />
      </div>

      <div className="flex w-full gap-4">
        <Input
          label="Hotspot Name"
          required
          value={state.hotspotName}
          placeholder="My Hotspot"
          onChange={(e) => {
            onChange("hotspotName", e.target.value);
          }}
          error={errors?.hotspotName?.[0]}
        />
        <Input
          label="DNS Name"
          required
          placeholder="myhotspot.net"
          value={state.dnsName}
          onChange={(e) => {
            onChange("dnsName", e.target.value);
          }}
          error={errors?.dnsName?.[0]}
        />
      </div>

      <div className="mt-1 flex justify-end gap-3">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button isLoading={isLoading} type="submit">
          Test & Save
        </Button>
      </div>
    </form>
  );
}

function CreateRouterosForm({ onClose }: { onClose: () => void }) {
  const createRouterosMutation = useCreateRouterosMutation();

  return (
    <RouterosForm
      onCancel={onClose}
      isLoading={createRouterosMutation.isPending}
      errors={createRouterosMutation.data?.error}
      onSubmit={(routeros) => {
        createRouterosMutation.mutate(
          { data: routeros },
          {
            onSuccess: (data) => {
              if (data.success) {
                onClose();
              }
            },
          },
        );
      }}
    />
  );
}

function UpdateRouterosForm({
  onClose,
  routeros,
}: {
  onClose: () => void;
  routeros: RouterosFormState & { id: number };
}) {
  const updateRouterosMutation = useUpdateRouterosMutation();

  return (
    <RouterosForm
      onCancel={onClose}
      initialState={routeros}
      isLoading={updateRouterosMutation.isPending}
      errors={updateRouterosMutation.data?.errors}
      onSubmit={(data) => {
        updateRouterosMutation.mutate(
          { data: { ...data, id: routeros.id } },
          {
            onSuccess: (data) => {
              if (data.success) {
                onClose();
              }
            },
          },
        );
      }}
    />
  );
}

function RouterosCard({
  routeros,
}: {
  routeros: {
    id: number;
    name: string;
    username: string;
    password: string;
    host: string;
    port: number;
    tls: boolean;
    hotspotName: string;
    dnsName: string;
  };
}) {
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const deleteRouterosMutation = useDeleteRouterosMutation();
  const setRouterosMutation = useSetRouterosMutation();

  return (
    <div
      className={cn(
        "relative flex items-center justify-between overflow-hidden rounded-xl border bg-white px-4 py-4",
        setRouterosMutation.isPending && "pointer-events-none opacity-50",
      )}
    >
      <button
        type="button"
        className="group flex w-full items-center gap-3 text-left"
        onClick={() => {
          setRouterosMutation.mutate({ data: { id: routeros.id } });
        }}
      >
        <div className="relative flex size-7 items-center justify-center">
          <ExternalLinkIcon className="invisible absolute size-full text-neutral-500 opacity-0 transition-all group-hover:visible group-hover:opacity-100" />
          <RouterIcon className="visible absolute size-full text-neutral-500 opacity-100 transition-all group-hover:invisible group-hover:opacity-0" />
        </div>
        <div>
          <h2 className="leading-tight font-semibold">{routeros.name}</h2>
          <div className="leading-tight text-neutral-600">
            {routeros.host}:{routeros.port}
          </div>
        </div>
      </button>
      <Popover.Root>
        <Popover.Trigger className="flex items-center justify-center rounded-lg bg-white px-1 py-2 text-neutral-600 transition-all select-none hover:bg-neutral-100 hover:text-foreground data-popup-open:bg-neutral-100 data-popup-open:text-foreground">
          <EllipsisVerticalIcon className="size-4" />
        </Popover.Trigger>
        <Popover.Portal>
          <Popover.Positioner sideOffset={8}>
            <Popover.Popup className="relative flex h-(--popup-height,auto) w-(--popup-width,auto) max-w-125 min-w-40 origin-(--transform-origin) flex-col gap-px rounded-lg border bg-white p-1 shadow-lg transition-[scale,opacity] duration-100 ease-out outline-none data-ending-style:scale-[0.98] data-ending-style:opacity-0 data-starting-style:scale-[0.98] data-starting-style:opacity-0">
              <Dialog
                rootProps={{
                  open: showUpdateModal,
                  onOpenChange: setShowUpdateModal,
                }}
                title="Update RouterOS"
                triggerProps={{
                  children: (
                    <>
                      <EditIcon className="size-4" /> Edit
                    </>
                  ),
                  className:
                    "flex w-full gap-2 items-center h-8 px-2 hover:bg-neutral-100 transition-all text-neutral-600 hover:text-foreground rounded-lg",
                }}
              >
                <UpdateRouterosForm
                  routeros={routeros}
                  onClose={() => setShowUpdateModal(false)}
                />
              </Dialog>
              <button
                disabled={deleteRouterosMutation.isPending}
                type="button"
                className="flex h-8 w-full items-center gap-2 rounded-lg px-2 text-red-600 transition-all hover:bg-red-50 hover:text-red-700 disabled:pointer-events-none disabled:opacity-50"
                onClick={() => {
                  if (window.confirm("Are you sure you want to remove it?")) {
                    deleteRouterosMutation.mutate({
                      data: { id: routeros.id },
                    });
                  }
                }}
              >
                <Trash2Icon className="size-4" /> Delete
              </button>
            </Popover.Popup>
          </Popover.Positioner>
        </Popover.Portal>
      </Popover.Root>
    </div>
  );
}

function RouteComponent() {
  const routerosQuery = useGetAllRouterosSuspenseInfiniteQuery({});
  const [openAddRouterosModal, setOpenAddRouterosModal] = useState(false);

  return (
    <main className="mx-auto w-full max-w-5xl space-y-4 py-6">
      <div className="flex justify-between gap-2">
        <h1 className="text-2xl font-semibold">RouterOS</h1>
        <Dialog
          rootProps={{
            open: openAddRouterosModal,
            onOpenChange: setOpenAddRouterosModal,
          }}
          title="Add RouterOS"
          triggerProps={{
            render: (props) => (
              <Button {...props} type="button">
                <PlusIcon className="size-4" /> Add
              </Button>
            ),
          }}
        >
          <CreateRouterosForm onClose={() => setOpenAddRouterosModal(false)} />
        </Dialog>
      </div>
      <div className="grid w-full grid-cols-3 gap-3">
        {!routerosQuery.data.length ? (
          <div className="col-span-full flex min-h-60 w-full items-center justify-center rounded-xl border bg-white">
            <div className="font-medium">No Results Found</div>
          </div>
        ) : (
          <>
            {routerosQuery.data?.map((routeros) => (
              <RouterosCard key={routeros.id} routeros={routeros} />
            ))}
          </>
        )}
      </div>
    </main>
  );
}
