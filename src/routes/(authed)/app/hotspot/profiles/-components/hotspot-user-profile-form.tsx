import { useState } from "react";
import type z from "zod/v4-mini";
import Button from "~/components/button";
import ComboboxSingle from "~/components/combobox-single";
import Input from "~/components/input";
import Select from "~/components/select";
import Switch from "~/components/switch";
import {
  expiredModeOptions,
  ExpiredModeValue,
} from "~/contants/hotspot-profile";
import { useGetIpPoolsQuery } from "~/serverfns/ip-pool";
import { useGetSimpleQueuesQuery } from "~/serverfns/queue";

export type HotspotUserProfileFormState = {
  name: string;
  "address-pool"?: string | null;
  "parent-queue"?: string | null;
  "shared-users": string | number;
  "rate-limit"?: string;
  expiredMode: ExpiredModeValue;
  validity: string;
  price: string;
  lockUsers: boolean;
  sellingPrice: string;
};

export default function HotspotUserProfileForm({
  onSubmit,
  isLoading,
  errors,
  onCancel,
  initialState,
  isUpdate,
}: {
  onSubmit: (profile: HotspotUserProfileFormState) => void;
  isLoading?: boolean;
  errors?: z.core.$ZodFlattenedError<HotspotUserProfileFormState>["fieldErrors"];
  onCancel: () => void;
  initialState?: HotspotUserProfileFormState;
  isUpdate?: boolean;
}) {
  const [profile, setProfile] = useState<HotspotUserProfileFormState>({
    name: initialState?.name ?? "",
    "address-pool": initialState?.["address-pool"],
    "shared-users":
      initialState?.["shared-users"] === "unlimited"
        ? ""
        : initialState?.["shared-users"] || "1",
    "rate-limit": initialState?.["rate-limit"] ?? "",
    expiredMode: initialState?.expiredMode || null,
    validity: initialState?.validity ?? "",
    price: initialState?.price ?? "",
    sellingPrice: initialState?.sellingPrice ?? "",
    lockUsers: initialState?.lockUsers ?? false,
    "parent-queue": initialState?.["parent-queue"],
  });

  const ipPoolsQuery = useGetIpPoolsQuery();
  const simpleQueuesQuery = useGetSimpleQueuesQuery();

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(profile);
      }}
      className="space-y-3"
    >
      <Input
        required
        placeholder="My Profile"
        label="Name"
        value={profile.name}
        onChange={(e) => {
          setProfile((prev) => ({ ...prev, name: e.target.value }));
        }}
        error={errors?.name?.[0]}
      />
      <ComboboxSingle
        label="Address Pool"
        value={profile["address-pool"]}
        onChange={(value) => {
          setProfile((prev) => ({
            ...prev,
            "address-pool": value,
          }));
        }}
        options={
          ipPoolsQuery.data?.map((pool) => ({
            value: pool["name"],
            label: pool["name"],
          })) ?? []
        }
        error={errors?.["address-pool"]?.[0]}
      />
      <div className="flex gap-3">
        <Input
          placeholder="1"
          label="Shared Users"
          type="number"
          min={1}
          value={profile["shared-users"]}
          onChange={(e) => {
            setProfile((prev) => ({ ...prev, "shared-users": e.target.value }));
          }}
          error={errors?.["shared-users"]?.[0]}
        />
        <Input
          placeholder="512k/1m"
          label="Rate Limit"
          value={profile["rate-limit"]}
          onChange={(e) => {
            setProfile((prev) => ({ ...prev, ["rate-limit"]: e.target.value }));
          }}
          error={errors?.["rate-limit"]?.[0]}
        />
      </div>
      <div className="flex gap-3">
        <Select
          label="Expired Mode"
          options={expiredModeOptions}
          value={profile.expiredMode}
          onChange={(value) => {
            setProfile((prev) => ({
              ...prev,
              expiredMode: value,
              validity: !value ? "" : prev.validity,
            }));
          }}
          error={errors?.expiredMode?.[0]}
        />
        {profile.expiredMode && (
          <Input
            label="Validity"
            placeholder="1d"
            value={profile.validity}
            onChange={(e) => {
              setProfile((prev) => ({ ...prev, validity: e.target.value }));
            }}
            error={errors?.validity?.[0]}
          />
        )}
      </div>
      <div className="flex gap-3">
        <Input
          placeholder="5000"
          label="Price"
          type="number"
          min={0}
          value={profile.price}
          onChange={(e) => {
            setProfile((prev) => ({ ...prev, price: e.target.value }));
          }}
          error={errors?.price?.[0]}
        />
        <Input
          placeholder="6000"
          label="Selling Price"
          value={profile.sellingPrice}
          onChange={(e) => {
            setProfile((prev) => ({ ...prev, sellingPrice: e.target.value }));
          }}
          error={errors?.sellingPrice?.[0]}
        />
      </div>
      <Switch
        label="Lock users"
        checked={profile.lockUsers}
        onCheckedChange={(checked) => {
          setProfile((prev) => ({ ...prev, lockUsers: checked }));
        }}
        error={errors?.lockUsers?.[0]}
      />

      <ComboboxSingle
        label="Parent Queue"
        value={profile["parent-queue"]}
        onChange={(value) => {
          setProfile((prev) => ({
            ...prev,
            "parent-queue": value,
          }));
        }}
        options={
          simpleQueuesQuery.data?.map((pool) => ({
            value: pool.name,
            label: pool.name,
          })) ?? []
        }
        error={errors?.["parent-queue"]?.[0]}
      />

      <div className="mt-1 flex justify-end gap-2">
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
