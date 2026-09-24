import PppProfileForm from "./ppp-profile-form";
import { useUpdatePppProfileMutation } from "~/serverfns/ppp-profile";

export default function UpdatePppProfileForm({
  onClose,
  profile,
}: {
  onClose: () => void;
  profile: {
    ".id": string;
    name: string;
    "rate-limit"?: string;
    "local-address"?: string;
    "remote-address"?: string;
    "only-one": "yes" | "no" | "default";
    comment?: string;
  };
}) {
  const updatePppProfile = useUpdatePppProfileMutation();

  return (
    <PppProfileForm
      isUpdate
      initialState={profile}
      isLoading={updatePppProfile.isPending}
      errors={updatePppProfile.data?.errors}
      onSubmit={(data) => {
        updatePppProfile.mutate(
          { data: { ...data, id: profile[".id"] } },
          {
            onSuccess: (data) => {
              if (data.success) {
                onClose();
              }
            },
          },
        );
      }}
    />
  );
}
