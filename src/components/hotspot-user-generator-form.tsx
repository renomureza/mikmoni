import { useState } from "react";
import type * as z from "zod/v4-mini";
import HotspotProfileCombobox from "~/components/hotspot-profile-combobox";
import HotspotServerCombobox from "~/components/hotspot-server-combobox";
import Input from "~/components/input";
import Select from "~/components/select";
import {
  dataLimitUnitOptions,
  DataLimitUnitValue,
  userModeOptions,
  UserModeValue,
  usernameCharacterOptions,
  UsernameCharacterValue,
} from "~/contants/hotspot-user";
import { fromBytes } from "~/utils/routeros";
import { NonNullableFields } from "~/utils/types";
import DialogForm from "./dialog-form";
import { Trans, useLingui } from "@lingui/react/macro";

interface BaseFormState {
  userMode: UserModeValue;
  nameLength: number;
  server?: string | null;
  prefix: string;
  character: UsernameCharacterValue;
  profile?: string | null;
  timeLimit: string;
  dataLimit: string;
  dataLimitUnit: DataLimitUnitValue;
  comment: string;
}

interface GenerateHotspotUserFormState extends BaseFormState {
  quantity: string;
}
interface QuickPrintHotspotUserFormState extends BaseFormState {
  name: string;
}

const nameLengthOptions = Array.from({ length: 6 }, (_, i) => ({
  label: String(i + 3),
  value: i + 3,
}));

export default function HotspotUserGeneratorForm<
  TMode extends "generate" | "quick_print",
  TState extends (TMode extends "generate"
    ? GenerateHotspotUserFormState
    : QuickPrintHotspotUserFormState),
>({
  onSubmit,
  errors,
  isLoading,
  initialState,
  mode,
  actionLabel,
}: {
  onSubmit: (value: NonNullableFields<TState>) => void;
  errors?: z.core.$ZodFlattenedError<NonNullableFields<TState>>["fieldErrors"];
  isLoading?: boolean;
  initialState?: Omit<TState, "dataLimitUnit">;
  mode: TMode;
  actionLabel: string;
}) {
  const { t } = useLingui();

  const [state, setState] = useState<TState>({
    server: initialState?.server || "all",
    userMode: initialState?.userMode || "up",
    nameLength: initialState?.nameLength || 4,
    prefix: initialState?.prefix || "",
    character: initialState?.character || "lower",
    profile: initialState?.profile || "default",
    timeLimit:
      initialState?.timeLimit && initialState?.timeLimit !== "0"
        ? initialState?.timeLimit
        : "",
    dataLimit: fromBytes(Number(initialState?.dataLimit) || 0, "mb") || "",
    dataLimitUnit: "mb",
    comment: initialState?.comment || "",

    // @ts-ignore
    ...(mode === "generate" ? { quantity: initialState?.quantity || "1" } : {}),
    // @ts-ignore
    ...(mode === "quick_print" ? { name: initialState?.name || "" } : {}),
  } as TState);

  return (
    <DialogForm
      onSubmit={() => {
        // @ts-ignore
        onSubmit({
          ...state,
          server: state.server || "all",
          profile: state.profile || "default",
        } as TState);
      }}
      primaryAction={{ isLoading, children: actionLabel }}
    >
      {mode === "generate" ? (
        <Input
          label={t`Quantity`}
          min={1}
          // @ts-ignore
          value={state.quantity}
          onChange={(e) => {
            setState((prev) => ({ ...prev, quantity: e.target.value }));
          }}
          // @ts-ignore
          error={errors?.quantity?.[0]}
        />
      ) : (
        <Input
          label={t`Name`}
          // @ts-ignore
          value={state.name}
          onChange={(e) => {
            setState((prev) => ({ ...prev, name: e.target.value }));
          }}
          // @ts-ignore
          error={errors?.name?.[0]}
        />
      )}
      <HotspotServerCombobox
        label={t`Server`}
        value={state.server ?? null}
        onChange={(server) => {
          setState((prev) => ({ ...prev, server }));
        }}
      />

      <HotspotProfileCombobox
        showDetails
        label={t`Profile`}
        value={state.profile ?? null}
        error={errors?.profile?.[0]}
        onChange={(profile) => {
          setState((prev) => ({ ...prev, profile }));
        }}
      />

      <div className="flex flex-col gap-3 sm:flex-row">
        <Select
          label={t`User Mode`}
          options={userModeOptions}
          value={state.userMode}
          onChange={(value) => {
            if (!value) return;
            setState((prev) => ({ ...prev, userMode: value }));
          }}
          error={errors?.userMode?.[0]}
        />
        <Select
          label={t`Name Length`}
          options={nameLengthOptions}
          value={state.nameLength}
          onChange={(value) => {
            if (!value) return;
            setState((prev) => ({ ...prev, nameLength: value }));
          }}
          error={errors?.nameLength?.[0]}
        />
      </div>
      <div className="flex flex-col gap-3 sm:flex-row">
        <Input
          label={t`Prefix`}
          value={state.prefix}
          onChange={(e) => {
            setState((prev) => ({ ...prev, prefix: e.target.value }));
          }}
          error={errors?.prefix?.[0]}
        />
        <Select
          label={t`Character`}
          options={usernameCharacterOptions}
          value={state.character}
          onChange={(value) => {
            if (!value) return;
            setState((prev) => ({ ...prev, character: value }));
          }}
          error={errors?.character?.[0]}
        />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Input
          label={t`Time Limit`}
          value={state.timeLimit}
          placeholder="1d"
          onChange={(e) => {
            setState((prev) => ({ ...prev, timeLimit: e.target.value }));
          }}
          error={errors?.timeLimit?.[0]}
          tooltip={
            <Trans>
              Must be shorter than the validity period in the profile.
            </Trans>
          }
        />
        <div className="flex w-full items-end gap-2">
          <Input
            label={t`Data Limit`}
            placeholder="100"
            value={state.dataLimit}
            onChange={(e) => {
              setState((prev) => ({ ...prev, dataLimit: e.target.value }));
            }}
            error={errors?.dataLimit?.[0]}
          />

          <Select
            className="w-25"
            options={dataLimitUnitOptions}
            value={state.dataLimitUnit}
            onChange={(value) => {
              if (!value) return;
              setState((prev) => ({ ...prev, dataLimitUnit: value }));
            }}
            error={errors?.dataLimitUnit?.[0]}
          />
        </div>
      </div>

      <Input
        label={t`Comment`}
        value={state.comment}
        onChange={(e) => {
          setState((prev) => ({ ...prev, comment: e.target.value }));
        }}
        error={errors?.comment?.[0]}
      />
    </DialogForm>
  );
}
