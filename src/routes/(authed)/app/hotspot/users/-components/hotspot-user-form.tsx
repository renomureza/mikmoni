import { useState } from "react";
import Button from "~/components/button";
import HotspotProfileCombobox from "~/components/hotspot-profile-combobox";
import HotspotServerCombobox from "~/components/hotspot-server-combobox";
import Input from "~/components/input";
import Select from "~/components/select";
import {
  dataLimitUnitOptions,
  DataLimitUnitValue,
} from "~/contants/hotspot-user";
import { fromBytes } from "~/utils/routeros";
import type * as z from "zod/v4-mini";

type HotspotUserFormState = {
  name: string;
  password: string;
  server: string | null;
  profile: string | null;
  timeLimit: string;
  dataLimit: string | number;
  dataLimitUnit: DataLimitUnitValue;
  comment: string;
};

type OnSubmitValue = {
  name: string;
  password: string;
  server: string;
  profile: string;
  timeLimit: string;
  dataLimit: string | number;
  dataLimitUnit: DataLimitUnitValue;
  comment: string;
};

export default function HotspotUserForm({
  onCancel,
  user: initialUser,
  onSubmit,
  isLoading,
  errors,
  isUpdate,
}: {
  isLoading?: boolean;
  onCancel: () => void;
  user?: {
    name: string;
    password?: string;
    profile?: string;
    server?: string;
    "limit-uptime"?: string;
    "limit-bytes-total"?: string;
    comment?: string;
  };
  onSubmit: (value: OnSubmitValue) => void;
  errors?: z.core.$ZodFlattenedError<OnSubmitValue>["fieldErrors"];
  isUpdate?: boolean;
}) {
  const [state, setState] = useState<HotspotUserFormState>({
    name: initialUser?.name || "",
    password: initialUser?.password || "",
    server: initialUser?.server || "all",
    profile: initialUser?.profile || "default",
    timeLimit: initialUser?.["limit-uptime"] || "",
    dataLimit:
      fromBytes(Number(initialUser?.["limit-bytes-total"]) || 0, "mb") || "",
    dataLimitUnit: "mb",
    comment: initialUser?.comment || "",
  });

  return (
    <form
      className="space-y-3"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit({
          ...state,
          server: state.server || "all",
          profile: state.profile || "default",
        });
      }}
    >
      <div className="flex gap-3">
        <Input
          required
          label="Name"
          value={state.name}
          onChange={(e) => {
            setState((prev) => ({ ...prev, name: e.target.value }));
          }}
          error={errors?.name?.[0]}
          placeholder="john"
        />
        <Input
          required
          type="password"
          label="Password"
          value={state.password}
          onChange={(e) => {
            setState((prev) => ({ ...prev, password: e.target.value }));
          }}
          error={errors?.password?.[0]}
        />
      </div>
      <HotspotServerCombobox
        label="Server"
        value={state.server}
        onChange={(server) => {
          setState((prev) => ({ ...prev, server }));
        }}
        error={errors?.server?.[0]}
      />
      <HotspotProfileCombobox
        label="Profile"
        value={state.profile}
        onChange={(profile) => {
          setState((prev) => ({ ...prev, profile }));
        }}
        error={errors?.profile?.[0]}
        showDetails
      />
      <div className="flex gap-3">
        <Input
          label="Time Limit"
          value={state.timeLimit}
          placeholder="1d"
          onChange={(e) => {
            setState((prev) => ({ ...prev, timeLimit: e.target.value }));
          }}
          error={errors?.timeLimit?.[0]}
          tooltip="Must be shorter than the validity period in the profile."
        />
        <div className="flex w-full items-end gap-2">
          <Input
            label="Data Limit"
            placeholder="100"
            type="number"
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
        label="Comment"
        value={state.comment}
        onChange={(e) => {
          setState((prev) => ({ ...prev, comment: e.target.value }));
        }}
        error={errors?.comment?.[0]}
      />

      <div className="mt-1 flex justify-end gap-3">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" isLoading={isLoading}>
          {!isUpdate ? "Create" : "Update"}
        </Button>
      </div>
    </form>
  );
}
