import { useCreatePppSecretMutation } from "~/serverfns/ppp-secret";
import PppSecretForm from "./ppp-secret-form";

export default function CreatePppSecretForm({
  onClose,
}: {
  onClose: () => void;
}) {
  const createPppSecret = useCreatePppSecretMutation();

  return (
    <PppSecretForm
      isLoading={createPppSecret.isPending}
      errors={createPppSecret.data?.errors}
      onSubmit={(secret) => {
        createPppSecret.mutate(
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
