import { Trans } from "@lingui/react/macro";
import { useState } from "react";
import * as z from "zod/v4";
import DialogForm from "~/components/dialog-form";
import Input from "~/components/input";
import Select from "~/components/select";
import { OnlyOne, onlyOneOptions } from "~/contants/ppp";

type PppSecretInitialState = {
  name: string;
  "local-address"?: string;
  "remote-address"?: string;
  "only-one": OnlyOne;
  "rate-limit"?: string;
  comment?: string;
};

type PppSecretFormState = {
  name: string;
  localAddress: string;
  remoteAddress: string;
  rateLimit: string;
  onlyOne: OnlyOne;
  comment: string;
};

export default function PppProfileForm({
  isUpdate,
  initialState,
  onSubmit,
  isLoading,
  errors,
}: {
  isUpdate?: boolean;
  initialState?: PppSecretInitialState;
  onSubmit: (value: PppSecretFormState) => void;
  isLoading: boolean;
  errors?: z.core.$ZodFlattenedError<PppSecretFormState>["fieldErrors"];
}) {
  const [secret, setSecret] = useState<PppSecretFormState>({
    name: initialState?.name || "",
    localAddress: initialState?.["local-address"] || "",
    remoteAddress: initialState?.["remote-address"] || "",
    onlyOne: initialState?.["only-one"] || "default",
    rateLimit: initialState?.["rate-limit"] || "",
    comment: initialState?.comment || "",
  });

  return (
    <DialogForm
      primaryAction={{ children: !isUpdate ? "Create" : "Update", isLoading }}
      onSubmit={() => {
        onSubmit(secret);
      }}
    >
      <Input
        required
        label={<Trans>Name</Trans>}
        placeholder="john"
        value={secret.name}
        onChange={(e) => {
          setSecret((prev) => ({ ...prev, name: e.target.value }));
        }}
        error={errors?.name?.[0]}
      />
      <Input
        label={<Trans>Rate Limit</Trans>}
        placeholder="2MB/5MB"
        value={secret.rateLimit}
        onChange={(e) => {
          setSecret((prev) => ({ ...prev, rateLimit: e.target.value }));
        }}
        error={errors?.rateLimit?.[0]}
      />
      <div className="flex gap-3">
        <Input
          label={<Trans>Local Address</Trans>}
          placeholder="192.168.100.1"
          value={secret.localAddress}
          onChange={(e) => {
            setSecret((prev) => ({ ...prev, localAddress: e.target.value }));
          }}
          error={errors?.localAddress?.[0]}
        />
        <Input
          label={<Trans>Remote Address</Trans>}
          placeholder="192.168.200.1"
          value={secret.remoteAddress}
          onChange={(e) => {
            setSecret((prev) => ({
              ...prev,
              remoteAddress: e.target.value,
            }));
          }}
          error={errors?.remoteAddress?.[0]}
        />
      </div>
      <Select
        label={<Trans>Only One</Trans>}
        value={secret.onlyOne}
        options={onlyOneOptions.map((opt) => ({ label: opt, value: opt }))}
        onChange={(value) => {
          if (!value) return;
          setSecret((prev) => ({ ...prev, onlyOne: value }));
        }}
        error={errors?.onlyOne?.[0]}
      />
      <Input
        label={<Trans>Comment</Trans>}
        value={secret.comment}
        onChange={(e) => {
          setSecret((prev) => ({ ...prev, comment: e.target.value }));
        }}
        error={errors?.comment?.[0]}
      />
    </DialogForm>
  );
}
