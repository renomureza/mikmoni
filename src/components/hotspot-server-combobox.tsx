import { useGetHotspotServersQuery } from "~/serverfns/hotspot-server";
import ComboboxSingle from "./combobox-single";
import { useMemo } from "react";

export default function HotspotServerCombobox({
  value,
  onChange,
  error,
  label,
}: {
  value: string | null;
  onChange: (value: string | null) => void;
  error?: string;
  label?: string;
}) {
  const hotspotServersQuery = useGetHotspotServersQuery();

  const options = useMemo(() => {
    return [
      { label: "all", value: "all" },
      ...(hotspotServersQuery.data?.length
        ? hotspotServersQuery.data.map((server) => ({
            label: server.name,
            value: server.name,
          }))
        : []),
    ];
  }, [hotspotServersQuery.data]);

  return (
    <ComboboxSingle
      label={label}
      options={options}
      value={value}
      onChange={onChange}
      error={error}
    />
  );
}
