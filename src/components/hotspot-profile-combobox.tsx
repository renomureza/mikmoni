import { useMemo } from "react";
import ComboboxSingle from "./combobox-single";
import { useGetHotspotUserProfilesQuery } from "~/serverfns/hotspot-user-profiles";

export default function HotspotProfileCombobox({
  value,
  onChange,
  showDetails,
  label,
  error,
}: {
  value: string | null;
  onChange: (value: string | null) => void;
  showDetails?: boolean;
  label?: string;
  error?: string;
}) {
  const hotspotUserProfilesQuery = useGetHotspotUserProfilesQuery();

  const selectedProfile = useMemo(() => {
    return hotspotUserProfilesQuery.data?.find(
      (profile) => profile.name === value,
    );
  }, [value, hotspotUserProfilesQuery.data]);

  const showProfileDetail =
    showDetails &&
    (selectedProfile?.validity ||
      selectedProfile?.price ||
      selectedProfile?.sellingPrice ||
      selectedProfile?.lockUsers);

  return (
    <div className="space-y-0.5">
      <ComboboxSingle
        label={label}
        options={
          hotspotUserProfilesQuery.data?.map((opt) => ({
            label: opt.name,
            value: opt.name,
          })) ?? []
        }
        value={value}
        onChange={onChange}
        error={error}
      />
      {showProfileDetail && (
        <ul className="text-xs inline-flex text-neutral-600 [&_li:not(:last-child):after]:content-['•'] [&_li:not(:last-child):after]:ml-1.5 gap-1.5">
          <li>Validity: {selectedProfile.validity}</li>
          {selectedProfile.price && <li>Price: {selectedProfile.price}</li>}
          {selectedProfile.sellingPrice && (
            <li>Selling Price: {selectedProfile.sellingPrice}</li>
          )}
          <li>Lock User: {selectedProfile.lockUsers ? "Enable" : "Disable"}</li>
        </ul>
      )}
    </div>
  );
}
