import PppProfileForm from "./ppp-profile-form";
import { useCreatePppProfileMutation } from "~/serverfns/ppp-profile";

export default function CreatePppProfileForm({
  onClose,
}: {
  onClose: () => void;
}) {
  const createPppProfile = useCreatePppProfileMutation();

  return (
    <PppProfileForm
      isLoading={createPppProfile.isPending}
      errors={createPppProfile.data?.errors}
      onSubmit={(secret) => {
        createPppProfile.mutate(
          { data: secret },
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
