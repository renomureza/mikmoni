import { useLingui } from "@lingui/react/macro";
import ComboboxSingle from "./combobox-single";
import { useGetPppProfilesQuery } from "~/serverfns/ppp-profile";

export default function PppProfileCombobox({
  value,
  onChange,
  label,
  error,
  className,
}: {
  value: string | null;
  onChange: (value: string | null) => void;
  label?: string;
  error?: string;
  className?: string;
}) {
  const hotspotUserProfilesQuery = useGetPppProfilesQuery({});
  const { t } = useLingui();

  return (
    <ComboboxSingle
      className={className}
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
      placeholder={t`Search profile...`}
    />
  );
}
