import { useLingui } from "@lingui/react/macro";
import HotspotUserGeneratorForm from "~/components/hotspot-user-generator-form";
import { useGenerateHotspotUsersMutation } from "~/serverfns/hotspot-users";

export default function GenerateHotspotUserForm({
  onCancel,
}: {
  onCancel: () => void;
}) {
  const generateUsersMutation = useGenerateHotspotUsersMutation();
  const { t } = useLingui();

  return (
    <HotspotUserGeneratorForm
      mode="generate"
      actionLabel={t`Generate`}
      errors={generateUsersMutation.data?.errors}
      isLoading={generateUsersMutation.isPending}
      onSubmit={(value) => {
        generateUsersMutation.mutate(
          {
            data: value,
          },
          {
            onSuccess: (data) => {
              if (data?.success) {
                onCancel();
              }
            },
          },
        );
      }}
    />
  );
}
