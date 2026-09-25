import { Trans } from "@lingui/react/macro";
import { useState } from "react";
import * as z from "zod/v4";
import ComboboxSingle from "~/components/combobox-single";
import DialogForm from "~/components/dialog-form";
import Input from "~/components/input";
import Select from "~/components/select";
import {
  dataLimitUnitOptions,
  DataLimitUnitValue,
} from "~/contants/hotspot-user";
import { PppService, pppServices } from "~/contants/ppp";
import { useGetPppProfilesQuery } from "~/serverfns/ppp-profile";
import { fromBytes } from "~/utils/routeros";

type PppSecretInitialState = {
  name: string;
  password?: string;
  profile: string;
  service: PppService;
  "local-address"?: string;
  "remote-address"?: string;
  "limit-bytes-in": string;
  "limit-bytes-out": string;
  comment?: string;
};

type PppSecretFormState = {
  name: string;
  password: string;
  profile: string;
  service: PppService;
  localAddress: string;
  remoteAddress: string;
  limitBytesIn: string | number;
  limitBytesInUnit: DataLimitUnitValue;
  limitBytesOut: string | number;
  limitBytesOutUnit: DataLimitUnitValue;
  comment: string;
};

export default function PppSecretForm({
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
    password: initialState?.password || "",
    profile: initialState?.profile || "default",
    service: initialState?.service || "any",
    localAddress: initialState?.["local-address"] || "",
    remoteAddress: initialState?.["remote-address"] || "",
    limitBytesIn:
      fromBytes(Number(initialState?.["limit-bytes-in"]) || 0, "mb") || "",
    limitBytesInUnit: "mb",
    limitBytesOut:
      fromBytes(Number(initialState?.["limit-bytes-out"]) || 0, "mb") || "",
    limitBytesOutUnit: "mb",
    comment: initialState?.comment || "",
  });

  const profilesQuery = useGetPppProfilesQuery({});

  return (
    <DialogForm
      primaryAction={{ children: !isUpdate ? "Create" : "Update", isLoading }}
      onSubmit={() => {
        onSubmit(secret);
      }}
    >
      <div className="flex gap-3">
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
          label={<Trans>Password</Trans>}
          type="password"
          value={secret.password}
          onChange={(e) => {
            setSecret((prev) => ({ ...prev, password: e.target.value }));
          }}
          error={errors?.password?.[0]}
        />
      </div>
      <Select
        label={<Trans>Service</Trans>}
        value={secret.service}
        options={pppServices.map((service) => ({
          label: service,
          value: service,
        }))}
        onChange={(service) => {
          if (!service) return;
          setSecret((prev) => ({ ...prev, service }));
        }}
        error={errors?.service?.[0]}
      />
      <ComboboxSingle
        label={<Trans>Profile</Trans>}
        options={
          profilesQuery.data?.map((profile) => ({
            label: profile.name,
            value: profile.name,
          })) ?? []
        }
        value={secret.profile}
        onChange={(profile) => {
          setSecret((prev) => ({ ...prev, profile: profile as string }));
        }}
        error={errors?.profile?.[0]}
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
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="flex w-full items-end gap-1">
          <Input
            label={<Trans>Limit Bytes In</Trans>}
            placeholder="100"
            type="number"
            value={secret.limitBytesIn}
            onChange={(e) => {
              setSecret((prev) => ({
                ...prev,
                limitBytesIn: e.target.value,
              }));
            }}
            error={errors?.limitBytesIn?.[0]}
          />
          <Select
            className="w-25"
            options={dataLimitUnitOptions}
            value={secret.limitBytesInUnit}
            onChange={(value) => {
              if (!value) return;
              setSecret((prev) => ({ ...prev, limitBytesInUnit: value }));
            }}
            error={errors?.limitBytesInUnit?.[0]}
          />
        </div>
        <div className="flex w-full items-end gap-1">
          <Input
            label={<Trans>Limit Bytes Out</Trans>}
            placeholder="100"
            type="number"
            value={secret.limitBytesOut}
            onChange={(e) => {
              setSecret((prev) => ({
                ...prev,
                limitBytesOut: e.target.value,
              }));
            }}
            error={errors?.limitBytesOut?.[0]}
          />
          <Select
            className="w-25"
            options={dataLimitUnitOptions}
            value={secret.limitBytesOutUnit}
            onChange={(value) => {
              if (!value) return;
              setSecret((prev) => ({ ...prev, limitBytesOutUnit: value }));
            }}
            error={errors?.limitBytesOutUnit?.[0]}
          />
        </div>
      </div>
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
