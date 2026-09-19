import HotspotUserGeneratorForm from "~/components/hotspot-user-generator-form";
import { useGenerateHotspotUsersMutation } from "~/serverfns/hotspot-users";

export default function GenerateHotspotUserForm({
  onCancel,
}: {
  onCancel: () => void;
}) {
  const generateUsersMutation = useGenerateHotspotUsersMutation();

  return (
    <HotspotUserGeneratorForm
      mode="generate"
      actionLabel="Generate"
      onCancel={onCancel}
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
