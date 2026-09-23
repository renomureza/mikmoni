import { useCreateHotspotUserProfile } from "~/serverfns/hotspot-user-profiles";
import HotspotUserProfileForm from "./hotspot-user-profile-form";

export default function CreateHotspotUserProfileForm({
  onClose,
}: {
  onClose: () => void;
}) {
  const createProfileMutation = useCreateHotspotUserProfile();

  return (
    <HotspotUserProfileForm
      errors={createProfileMutation.data?.errors}
      isLoading={createProfileMutation.isPending}
      onSubmit={(profile) => {
        createProfileMutation.mutate(
          { data: profile },
          {
            onSuccess: (data) => {
              if (data?.success) {
                onClose();
              }
            },
          },
        );
      }}
    />
  );
}
