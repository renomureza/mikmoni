import { useCreateHotspotUserMutation } from "~/serverfns/hotspot-users";
import HotspotUserForm from "./hotspot-user-form";

export default function CreateHotspotUserForm({
  onCancel,
}: {
  onCancel: () => void;
}) {
  const createHotspotUserMutation = useCreateHotspotUserMutation();

  return (
    <HotspotUserForm
      isLoading={createHotspotUserMutation.isPending}
      errors={createHotspotUserMutation.data?.errors}
      onCancel={onCancel}
      onSubmit={(value) => {
        createHotspotUserMutation.mutate(
          {
            data: value,
          },
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
