import { Popover } from "@base-ui/react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { EditIcon, EllipsisVerticalIcon, Trash2Icon } from "lucide-react";
import Button from "~/components/button";
import Dialog from "~/components/dialog";
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
    <div className="border flex items-center justify-between bg-white px-4 py-2 rounded-xl">
      <div>
        <h2 className="font-medium ">{template.name}</h2>
      </div>
      <Popover.Root>
        <Popover.Trigger className="flex items-center py-2 text-neutral-600 data-popup-open:bg-neutral-100 data-popup-open:text-foreground hover:bg-neutral-100 hover:text-foreground transition-all justify-center bg-white px-1 rounded-lg select-none">
          <EllipsisVerticalIcon className="size-4" />
        </Popover.Trigger>
        <Popover.Portal>
          <Popover.Positioner sideOffset={8}>
            <Popover.Popup className="relative flex h-(--popup-height,auto) w-(--popup-width,auto) min-w-40 max-w-125 flex-col gap-px origin-(--transform-origin) bg-white p-1 outline-none border shadow-lg rounded-lg transition-[scale,opacity] duration-100 ease-out data-ending-style:scale-[0.98] data-ending-style:opacity-0 data-starting-style:scale-[0.98] data-starting-style:opacity-0">
              <Link
                className="flex w-full gap-2 items-center h-8 px-2 hover:bg-neutral-100 transition-all text-neutral-600 hover:text-foreground rounded-lg"
                to="/voucher-templates/$id/edit"
                params={{ id: String(template.id) }}
              >
                <EditIcon className="size-4" /> Edit
              </Link>
              <button
                disabled={deleteMutation.isPending}
                type="button"
                className="flex w-full disabled:pointer-events-none disabled:opacity-50 gap-2 items-center text-red-600 h-8 px-2 transition-all hover:bg-red-50 hover:text-red-700 rounded-lg"
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
    <div className="w-full space-y-4 max-w-5xl mx-auto py-6">
      <div className="flex justify-between">
        <h1 className="text-2xl font-semibold">Voucher Templates</h1>
        <div className="flex items-center gap-3">
          <Button
            type="button"
            onClick={() => {
              navigate({ to: "/voucher-templates/create" });
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
