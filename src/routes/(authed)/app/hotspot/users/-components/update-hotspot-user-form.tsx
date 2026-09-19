import { useUpdateHotspotUserMutation } from "~/serverfns/hotspot-users";
import HotspotUserForm from "./hotspot-user-form";

export default function UpdateHotspotUserForm({
  onCancel,
  user: initialUser,
}: {
  onCancel: () => void;
  user: {
    ".id": string;
    name: string;
    password?: string;
    profile?: string;
    server?: string;
    "limit-uptime"?: string;
    "limit-bytes-total"?: string;
    comment?: string;
  };
}) {
  const updateHotspotUserMutation = useUpdateHotspotUserMutation();

  return (
    <HotspotUserForm
      isUpdate
      isLoading={updateHotspotUserMutation.isPending}
      errors={updateHotspotUserMutation.data?.errors}
      onCancel={onCancel}
      user={initialUser}
      onSubmit={(value) => {
        updateHotspotUserMutation.mutate(
          {
            data: {
              ...value,
              id: initialUser[".id"],
            },
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
