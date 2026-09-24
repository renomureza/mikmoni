import { useUpdatePppSecretMutation } from "~/serverfns/ppp-secret";
import PppSecretForm from "./ppp-secret-form";
import { PppService } from "~/contants/ppp";

export default function UpdatePppSecretForm({
  onClose,
  secret,
}: {
  onClose: () => void;
  secret: {
    ".id": string;
    name: string;
    service: PppService;
    password?: string;
    profile: string;
    "limit-bytes-in": string;
    "limit-bytes-out": string;
    "local-address"?: string;
    "remote-address"?: string;
    comment?: string;
  };
}) {
  const updatePppSecret = useUpdatePppSecretMutation();

  return (
    <PppSecretForm
      isUpdate
      initialState={secret}
      isLoading={updatePppSecret.isPending}
      errors={updatePppSecret.data?.errors}
      onSubmit={(data) => {
        updatePppSecret.mutate(
          { data: { ...data, id: secret[".id"] } },
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
