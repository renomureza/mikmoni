import { useLingui } from "@lingui/react/macro";
import HotspotUserGeneratorForm from "~/components/hotspot-user-generator-form";
import { useCreateQuickPrintMutation } from "~/serverfns/quick-print";

export default function CreateQuickPrintForm({
  onCancel,
}: {
  onCancel: () => void;
}) {
  const createMutation = useCreateQuickPrintMutation();
  const { t } = useLingui();

  return (
    <HotspotUserGeneratorForm
      mode="quick_print"
      isLoading={createMutation.isPending}
      actionLabel={t`Create`}
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
