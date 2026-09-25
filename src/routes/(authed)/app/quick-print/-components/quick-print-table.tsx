import { Trans, useLingui } from "@lingui/react/macro";
import { useState } from "react";
import Table from "~/components/table";
import {
  getUserModeLabel,
  UserModeValue,
  UsernameCharacterValue,
} from "~/contants/hotspot-user";
import {
  useDeleteQuickPrintMutation,
  useQuickPrintGenerateMutation,
} from "~/serverfns/quick-print";
import { formatBytes } from "~/utils/routeros";
import PrintButton from "../../hotspot/users/-components/print-button";
import { EditIcon, PrinterIcon, Trash2Icon } from "lucide-react";
import Dialog from "~/components/dialog";
import UpdateQuickPrintForm from "./update-quick-print-form";

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
  const { t } = useLingui();

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
        title={t`Update Quick Print`}
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

export default function QuickPrintTable({
  quickPrints,
  searchQuery,
}: {
  quickPrints: QuickPrint[];
  searchQuery?: string;
}) {
  return (
    <Table>
      <Table.Thead>
        <Table.Tr>
          <Table.Th>
            <Trans>Name</Trans>
          </Table.Th>
          <Table.Th>
            <Trans>Server</Trans>
          </Table.Th>
          <Table.Th>
            <Trans>Profile</Trans>
          </Table.Th>
          <Table.Th>
            <Trans>User Mode</Trans>
          </Table.Th>
          <Table.Th>
            <Trans>Name Length</Trans>
          </Table.Th>
          <Table.Th>
            <Trans>Prefix</Trans>
          </Table.Th>
          <Table.Th>
            <Trans>Time Limit</Trans>
          </Table.Th>
          <Table.Th>
            <Trans>Data Limit</Trans>
          </Table.Th>
          <Table.Th>
            <Trans>Comment</Trans>
          </Table.Th>
          <Table.Th></Table.Th>
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>
        {quickPrints.length ? (
          quickPrints.map((quickPrint) => (
            <Table.Tr key={quickPrint[".id"]}>
              <Table.Td>{quickPrint.name}</Table.Td>
              <Table.Td>{quickPrint.server}</Table.Td>
              <Table.Td>{quickPrint.profile}</Table.Td>
              <Table.Td>{getUserModeLabel(quickPrint.userMode)}</Table.Td>
              <Table.Td>{quickPrint.nameLength}</Table.Td>
              <Table.Td>{quickPrint.prefix}</Table.Td>
              <Table.Td>{quickPrint.timeLimit}</Table.Td>
              <Table.Td>{formatBytes(quickPrint.dataLimit)}</Table.Td>
              <Table.Td>{quickPrint.comment}</Table.Td>
              <Table.Td>
                <QuickPrintItemMenu quickPrint={quickPrint} />
              </Table.Td>
            </Table.Tr>
          ))
        ) : (
          <Table.Tr>
            <Table.Td colSpan={10}>
              <Table.Empty query={searchQuery} />
            </Table.Td>
          </Table.Tr>
        )}
      </Table.Tbody>
    </Table>
  );
}
