import { Popover } from "@base-ui/react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { EditIcon, EllipsisVerticalIcon, Trash2Icon } from "lucide-react";
import Button from "~/components/button";
import {
  ensureGetVoucherTemplatesInfiniteQueryData,
  useDeleteVoucherTemplateMutation,
  useGetVoucherTemplatesSuspenseInfiniteQuery,
} from "~/serverfns/vouer-templates";

export const Route = createFileRoute("/(authed)/voucher-templates/")({
  component: RouteComponent,
  loader: async ({ context }) => {
    await ensureGetVoucherTemplatesInfiniteQueryData({
      queryClient: context.queryClient,
      opts: {},
    });
  },
});

function VoucherTemplateCard({
  template,
}: {
  template: { name: string; id: number };
}) {
  const deleteMutation = useDeleteVoucherTemplateMutation();

  return (
    <div className="flex items-center justify-between rounded-xl border bg-white px-4 py-2">
      <div>
        <h2 className="font-medium">{template.name}</h2>
      </div>
      <Popover.Root>
        <Popover.Trigger className="flex items-center justify-center rounded-lg bg-white px-1 py-2 text-neutral-600 transition-all select-none hover:bg-neutral-100 hover:text-foreground data-popup-open:bg-neutral-100 data-popup-open:text-foreground">
          <EllipsisVerticalIcon className="size-4" />
        </Popover.Trigger>
        <Popover.Portal>
          <Popover.Positioner sideOffset={8}>
            <Popover.Popup className="relative flex h-(--popup-height,auto) w-(--popup-width,auto) max-w-125 min-w-40 origin-(--transform-origin) flex-col gap-px rounded-lg border bg-white p-1 shadow-lg transition-[scale,opacity] duration-100 ease-out outline-none data-ending-style:scale-[0.98] data-ending-style:opacity-0 data-starting-style:scale-[0.98] data-starting-style:opacity-0">
              <Link
                className="flex h-8 w-full items-center gap-2 rounded-lg px-2 text-neutral-600 transition-all hover:bg-neutral-100 hover:text-foreground"
                to="/voucher-templates/$id/edit"
                params={{ id: String(template.id) }}
              >
                <EditIcon className="size-4" /> Edit
              </Link>
              <button
                disabled={deleteMutation.isPending}
                type="button"
                className="flex h-8 w-full items-center gap-2 rounded-lg px-2 text-red-600 transition-all hover:bg-red-50 hover:text-red-700 disabled:pointer-events-none disabled:opacity-50"
                onClick={() => {
                  if (window.confirm("Are you sure you want to remove it?")) {
                    deleteMutation.mutate({
                      data: { id: template.id },
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
  const navigate = Route.useNavigate();
  const voucherTemplatesQuery = useGetVoucherTemplatesSuspenseInfiniteQuery({});

  return (
    <div className="mx-auto w-full max-w-5xl space-y-4 py-6">
      <div className="flex justify-between">
        <h1 className="text-2xl font-semibold">Voucher Templates</h1>
        <div className="flex items-center gap-3">
          <Button
            type="button"
            onClick={() => {
              void navigate({ to: "/voucher-templates/create" });
            }}
          >
            Create
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {voucherTemplatesQuery.data.map((template) => (
          <VoucherTemplateCard key={template.id} template={template} />
        ))}
      </div>
    </div>
  );
}
