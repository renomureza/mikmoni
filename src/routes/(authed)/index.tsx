import { createFileRoute } from "@tanstack/react-router";
import {
  useCreateRouterosMutation,
  useDeleteRouterosMutation,
  useGetAllRouterosQuery,
  useUpdateRouterosMutation,
} from "~/services/routeros/client";
import { useState } from "react";
import Switch from "~/components/switch";
import type z from "zod";
import Input from "~/components/input";
import Dialog from "~/components/dialog";
import {
  EditIcon,
  EllipsisVerticalIcon,
  PlusIcon,
  Trash2Icon,
} from "lucide-react";
import Button from "~/components/button";
import { Popover } from "@base-ui/react";

export const Route = createFileRoute("/(authed)/")({
  component: RouteComponent,
});

type RouterosFormState = {
  name: string;
  host: string;
  port: string | number;
  tls: boolean;
  user: string;
  password: string;
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
  const [state, setState] = useState({
    name: initialState?.name ?? "",
    host: initialState?.host ?? "",
    port: initialState?.port ?? "",
    tls: initialState?.tls ?? false,
    user: initialState?.user ?? "",
    password: initialState?.password ?? "",
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
      <div className="w-full flex gap-4">
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
      <div className="w-full flex gap-4">
        <Input
          label="User"
          required
          value={state.user}
          placeholder="admin"
          onChange={(e) => {
            onChange("user", e.target.value);
          }}
          error={errors?.user?.[0]}
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

      <div className="flex justify-end gap-3 mt-1">
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
  routeros: {
    id: number;
    name: string;
    user: string;
    password: string;
    host: string;
    port: number;
    tls: boolean;
  };
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
    user: string;
    password: string;
    host: string;
    port: number;
    tls: boolean;
  };
}) {
  const [showUpdateModal, setShowUpdateModal] = useState(false);

  const deleteRouterosMutation = useDeleteRouterosMutation();

  return (
    <div className="bg-white relative px-4 py-4 flex overflow-hidden justify-between items-center border rounded-lg">
      <button type="button" className="w-full text-left">
        <h2 className="font-semibold leading-tight">{routeros.name}</h2>
        <div className="text-neutral-600 leading-tight">
          {routeros.host}:{routeros.port}
        </div>
      </button>
      <Popover.Root>
        <Popover.Trigger className="flex items-center py-2 text-neutral-600 data-popup-open:bg-neutral-100 data-popup-open:text-foreground hover:bg-neutral-100 hover:text-foreground transition-all justify-center bg-white px-1 rounded-lg select-none">
          <EllipsisVerticalIcon className="size-4" />
        </Popover.Trigger>
        <Popover.Portal>
          <Popover.Positioner sideOffset={8}>
            <Popover.Popup className="relative flex h-(--popup-height,auto) w-(--popup-width,auto) min-w-40 max-w-125 flex-col gap-px origin-(--transform-origin) bg-white p-1 outline-none border shadow-lg rounded-lg transition-[scale,opacity] duration-100 ease-out data-ending-style:scale-[0.98] data-ending-style:opacity-0 data-starting-style:scale-[0.98] data-starting-style:opacity-0">
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
                className="flex w-full disabled:pointer-events-none disabled:opacity-50 gap-2 items-center text-red-600 h-8 px-2 transition-all hover:bg-red-50 hover:text-red-700 rounded-lg"
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
  const routerosQuery = useGetAllRouterosQuery();
  const [openAddRouterosModal, setOpenAddRouterosModal] = useState(false);

  return (
    <main className="max-w-5xl w-full px-4 space-y-6 mx-auto my-10">
      <div className="flex justify-between gap-2">
        <h1 className="text-3xl font-semibold">RouterOS</h1>
        <Dialog
          rootProps={{
            open: openAddRouterosModal,
            onOpenChange: setOpenAddRouterosModal,
          }}
          title="Add RouterOS"
          triggerProps={{
            children: (
              <>
                <PlusIcon className="size-4" /> Add
              </>
            ),
          }}
        >
          <CreateRouterosForm onClose={() => setOpenAddRouterosModal(false)} />
        </Dialog>
      </div>
      <div className="w-full grid grid-cols-3 gap-3">
        {routerosQuery.data?.map((routeros) => (
          <RouterosCard key={routeros.id} routeros={routeros} />
        ))}
      </div>
    </main>
  );
}
