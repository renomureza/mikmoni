import { useUpdateHotspotUserProfile } from "~/serverfns/hotspot-user-profiles";
import HotspotUserProfileForm, {
  HotspotUserProfileFormState,
} from "./hotspot-user-profile-form";

export default function UpdateHotspotUserProfileForm({
  onClose,
  profile,
}: {
  onClose: () => void;
  profile: HotspotUserProfileFormState & { ".id": string };
}) {
  const updateProfileMutation = useUpdateHotspotUserProfile();

  return (
    <HotspotUserProfileForm
      isUpdate
      initialState={profile}
      errors={updateProfileMutation.data?.errors}
      isLoading={updateProfileMutation.isPending}
      onSubmit={(updatedProfile) => {
        updateProfileMutation.mutate(
          {
            data: { ...updatedProfile, ".id": profile[".id"] },
          },
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
