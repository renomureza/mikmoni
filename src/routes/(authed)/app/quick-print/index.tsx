import { createFileRoute } from "@tanstack/react-router";
import { EditIcon, PlusIcon, PrinterIcon, Trash2Icon } from "lucide-react";
import { useState } from "react";
import Button from "~/components/button";
import Dialog from "~/components/dialog";
import HotspotUserGeneratorForm from "~/components/hotspot-user-generator-form";
import {
  getUserModeLabel,
  UserModeValue,
  UsernameCharacterValue,
} from "~/contants/hotspot-user";
import {
  ensureGetQuickPrintsQuery,
  useCreateQuickPrintMutation,
  useDeleteQuickPrintMutation,
  useGetQuickPrintsSuspenseQuery,
  useQuickPrintGenerateMutation,
  useUpdateQuickPrintMutation,
} from "~/serverfns/quick-print";
import { formatBytes } from "~/utils/routeros";
import PrintButton from "../hotspot/users/-components/print-button";

export const Route = createFileRoute("/(authed)/app/quick-print/")({
  component: RouteComponent,
  loader: async ({ context }) => {
    await ensureGetQuickPrintsQuery({
      queryClient: context.queryClient,
    });
  },
});

function CreateQuickPrintForm({ onCancel }: { onCancel: () => void }) {
  const createMutation = useCreateQuickPrintMutation();

  return (
    <HotspotUserGeneratorForm
      mode="quick_print"
      isLoading={createMutation.isPending}
      actionLabel="Create"
      onCancel={onCancel}
      errors={createMutation.data?.errors}
      onSubmit={(data) => {
        createMutation.mutate(
          { data: data },
          {
            onSuccess: (data) => {
              if (data.success) {
                onCancel();
              }
            },
          },
        );
      }}
    />
  );
}

function UpdateQuickPrintForm({
  onCancel,
  quickPrint,
}: {
  onCancel: () => void;
  quickPrint: QuickPrint;
}) {
  const updateMutation = useUpdateQuickPrintMutation();

  return (
    <HotspotUserGeneratorForm
      initialState={quickPrint}
      isLoading={updateMutation.isPending}
      mode="quick_print"
      actionLabel="Update"
      onCancel={onCancel}
      errors={updateMutation.data?.errors}
      onSubmit={(data) => {
        updateMutation.mutate(
          { data: { ...data, id: quickPrint[".id"] } },
          {
            onSuccess: (data) => {
              if (data.success) {
                onCancel();
              }
            },
          },
        );
      }}
    />
  );
}

type QuickPrint = {
  ".id": string;
  name: string;
  server: string;
  userMode: UserModeValue;
  nameLength: number;
  prefix: string;
  profile: string;
  timeLimit: string;
  dataLimit: string;
  validity: string;
  lockUser: string;
  price: string;
  sellingPrice: string;
  comment: string;
  character: UsernameCharacterValue;
};

function QuickPrintItemMenu({ quickPrint }: { quickPrint: QuickPrint }) {
  const generateMutation = useQuickPrintGenerateMutation();
  const deleteMutation = useDeleteQuickPrintMutation();
  const [showUpdateModal, setShowUpdateModal] = useState(false);

  return (
    <div className="flex items-center justify-end gap-0.5">
      <PrintButton
        onClickTemplate={(templateId) => {
          generateMutation.mutate(
            {
              data: {
                character: quickPrint.character,
                comment: quickPrint.comment,
                dataLimitBytes:
                  quickPrint.dataLimit && quickPrint.dataLimit !== "0"
                    ? quickPrint.dataLimit
                    : "",
                timeLimit:
                  quickPrint.timeLimit && quickPrint.timeLimit !== "0"
                    ? quickPrint.timeLimit
                    : "",
                nameLength: quickPrint.nameLength,
                prefix: quickPrint.prefix,
                profile: quickPrint.profile,
                server: quickPrint.server,
                userMode: quickPrint.userMode,
              },
            },
            {
              onSuccess: (data) => {
                if (data.success) {
                  window.open(
                    `/app/print/${templateId}?id=${data.data.id}`,
                    "_blank",
                    "width=420,height=420",
                  );
                }
              },
            },
          );
        }}
        className="flex size-7 items-center justify-center rounded-lg text-neutral-600 transition-all hover:bg-neutral-50 hover:text-neutral-700 data-popup-open:bg-neutral-50 data-popup-open:text-neutral-700"
      >
        <PrinterIcon className="size-4" />
      </PrintButton>
      <Dialog
        rootProps={{
          open: showUpdateModal,
          onOpenChange: setShowUpdateModal,
        }}
        title="Update Quick Print"
        triggerProps={{
          className:
            "text-neutral-600 rounded-lg transition-all hover:text-neutral-700 hover:bg-neutral-50 size-7 flex justify-center items-center",
          children: <EditIcon className="size-4" />,
        }}
      >
        <UpdateQuickPrintForm
          quickPrint={quickPrint}
          onCancel={() => setShowUpdateModal(false)}
        />
      </Dialog>

      <button
        disabled={deleteMutation.isPending}
        type="button"
        className="flex size-7 items-center justify-center rounded-lg text-red-600 transition-all hover:bg-red-50 hover:text-red-700 disabled:pointer-events-none disabled:opacity-50"
        onClick={() => {
          if (window.confirm("Are you sure you want to delete it?")) {
            deleteMutation.mutate({ data: { id: quickPrint[".id"] } });
          }
        }}
      >
        <Trash2Icon className="size-4" />
      </button>
    </div>
  );
}

function RouteComponent() {
  const [showAddModal, setShowAddModal] = useState(false);
  const quickPrints = useGetQuickPrintsSuspenseQuery();

  return (
    <div className="w-full space-y-4">
      <div className="flex justify-between">
        <h1 className="text-xl font-semibold">Quick Print</h1>
        <Dialog
          rootProps={{
            open: showAddModal,
            onOpenChange: setShowAddModal,
          }}
          title="Create Quick Print"
          triggerProps={{
            render: (props) => (
              <Button type="button" {...props}>
                <PlusIcon className="size-4" /> Add
              </Button>
            ),
          }}
        >
          <CreateQuickPrintForm onCancel={() => setShowAddModal(false)} />
        </Dialog>
      </div>

      <div className="overflow-hidden rounded-lg border bg-white">
        <table className="w-full text-left [&_tbody_tr:not(:last-child)]:border-b [&_td]:py-1.5 [&_th]:py-2 [&_th]:font-medium [&_th]:text-neutral-500 [&_th,&_td]:px-3 [&_thead]:border-b [&_thead]:bg-neutral-100">
          <thead>
            <tr>
              <th>Name</th>
              <th>Server</th>
              <th>Profile</th>
              <th>User Mode</th>
              <th>Name Length</th>
              <th>Prefix</th>
              <th>Time Limit</th>
              <th>Data Limit</th>
              <th>Comment</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {quickPrints.data.length ? (
              quickPrints.data.map((quickPrint) => (
                <tr key={quickPrint[".id"]}>
                  <td>{quickPrint.name}</td>
                  <td>{quickPrint.server}</td>
                  <td>{quickPrint.profile}</td>
                  <td>{getUserModeLabel(quickPrint.userMode)}</td>
                  <td>{quickPrint.nameLength}</td>
                  <td>{quickPrint.prefix}</td>
                  <td>{quickPrint.timeLimit}</td>
                  <td>{formatBytes(quickPrint.dataLimit)}</td>
                  <td>{quickPrint.comment}</td>
                  <td>
                    <QuickPrintItemMenu quickPrint={quickPrint} />
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={10}>
                  <div className="flex min-h-60 items-center justify-center">
                    <div>No Results Found</div>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
