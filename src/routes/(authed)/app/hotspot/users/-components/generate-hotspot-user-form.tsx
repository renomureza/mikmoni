import { useState } from "react";
import Button from "~/components/button";
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
import { useGenerateHotspotUsersMutation } from "~/serverfns/hotspot-users";

type GenerateHotspotUserFormState = {
  quantity: string;
  userMode: UserModeValue;
  nameLength: number;
  server: string | null;
  prefix: string;
  character: UsernameCharacterValue;
  profile: string | null;
  timeLimit: string;
  dataLimit: string;
  dataLimitUnit: DataLimitUnitValue;
  comment: string;
};

const nameLengthOptions = Array.from({ length: 6 }, (_, i) => ({
  label: String(i + 3),
  value: i + 3,
}));

export default function GenerateHotspotUserForm({
  onCancel,
}: {
  onCancel: () => void;
}) {
  const [state, setState] = useState<GenerateHotspotUserFormState>({
    quantity: "1",
    server: "all",
    userMode: "up",
    nameLength: 4,
    prefix: "",
    character: "alpha_lower",
    profile: "default",
    timeLimit: "",
    dataLimit: "",
    dataLimitUnit: "mb",
    comment: "",
  });
  const generateUsersMutation = useGenerateHotspotUsersMutation();

  return (
    <form
      className="flex flex-col gap-3"
      onSubmit={(e) => {
        e.preventDefault();
        generateUsersMutation.mutate(
          {
            data: {
              quantity: state.quantity,
              server: state.server || "all",
              profile: state.profile || "default",
              userMode: state.userMode,
              nameLength: state.nameLength,
              prefix: state.prefix,
              character: state.character,
              comment: state.comment,
              dataLimit: state.dataLimit,
              dataLimitUnit: state.dataLimitUnit,
              timeLimit: state.timeLimit,
            },
          },
          {
            onSuccess: (data) => {
              if (data?.success) {
                onCancel();
              }
            },
          },
        );
      }}
    >
      <Input
        label="Quantity"
        min={1}
        value={state.quantity}
        onChange={(e) => {
          setState((prev) => ({ ...prev, quantity: e.target.value }));
        }}
        error={generateUsersMutation.data?.errors?.quantity?.[0]}
      />
      <HotspotServerCombobox
        label="Server"
        value={state.server}
        onChange={(server) => {
          setState((prev) => ({ ...prev, server }));
        }}
      />

      <HotspotProfileCombobox
        showDetails
        label="Profile"
        value={state.profile}
        error={generateUsersMutation.data?.errors?.profile?.[0]}
        onChange={(profile) => {
          setState((prev) => ({ ...prev, profile }));
        }}
      />

      <div className="flex gap-3">
        <Select
          label="User Mode"
          options={userModeOptions}
          value={state.userMode}
          onChange={(value) => {
            if (!value) return;
            setState((prev) => ({ ...prev, userMode: value }));
          }}
          error={generateUsersMutation.data?.errors?.userMode?.[0]}
        />
        <Select
          label="Name Length"
          options={nameLengthOptions}
          value={state.nameLength}
          onChange={(value) => {
            if (!value) return;
            setState((prev) => ({ ...prev, nameLength: value }));
          }}
          error={generateUsersMutation.data?.errors?.nameLength?.[0]}
        />
      </div>
      <div className="flex gap-3">
        <Input
          label="Prefix"
          value={state.prefix}
          onChange={(e) => {
            setState((prev) => ({ ...prev, prefix: e.target.value }));
          }}
          error={generateUsersMutation.data?.errors?.prefix?.[0]}
        />
        <Select
          label="Character"
          options={usernameCharacterOptions}
          value={state.character}
          onChange={(value) => {
            if (!value) return;
            setState((prev) => ({ ...prev, character: value }));
          }}
          error={generateUsersMutation.data?.errors?.character?.[0]}
        />
      </div>

      <div className="flex gap-3">
        <Input
          label="Time Limit"
          value={state.timeLimit}
          placeholder="1d"
          onChange={(e) => {
            setState((prev) => ({ ...prev, timeLimit: e.target.value }));
          }}
          error={generateUsersMutation.data?.errors?.timeLimit?.[0]}
          tooltip={
            <>Must be shorter than the validity period in the profile.</>
          }
        />
        <div className="flex items-end gap-2 w-full">
          <Input
            label="Data Limit"
            placeholder="100"
            value={state.dataLimit}
            onChange={(e) => {
              setState((prev) => ({ ...prev, dataLimit: e.target.value }));
            }}
            error={generateUsersMutation.data?.errors?.dataLimit?.[0]}
          />

          <Select
            className="w-25"
            options={dataLimitUnitOptions}
            value={state.dataLimitUnit}
            onChange={(value) => {
              if (!value) return;
              setState((prev) => ({ ...prev, dataLimitUnit: value }));
            }}
            error={generateUsersMutation.data?.errors?.dataLimitUnit?.[0]}
          />
        </div>
      </div>

      <Input
        label="Comment"
        value={state.comment}
        onChange={(e) => {
          setState((prev) => ({ ...prev, comment: e.target.value }));
        }}
        error={generateUsersMutation.data?.errors?.comment?.[0]}
      />

      <div className="mt-1 flex justify-end gap-3">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" isLoading={generateUsersMutation.isPending}>
          Generate
        </Button>
      </div>
    </form>
  );
}
