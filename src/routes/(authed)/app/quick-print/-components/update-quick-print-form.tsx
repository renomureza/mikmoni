import { useLingui } from "@lingui/react/macro";
import HotspotUserGeneratorForm from "~/components/hotspot-user-generator-form";
import { UserModeValue, UsernameCharacterValue } from "~/contants/hotspot-user";
import { useUpdateQuickPrintMutation } from "~/serverfns/quick-print";

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

export default function UpdateQuickPrintForm({
  onCancel,
  quickPrint,
}: {
  onCancel: () => void;
  quickPrint: QuickPrint;
}) {
  const updateMutation = useUpdateQuickPrintMutation();
  const { t } = useLingui();

  return (
    <HotspotUserGeneratorForm
      initialState={quickPrint}
      isLoading={updateMutation.isPending}
      mode="quick_print"
      actionLabel={t`Update`}
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
