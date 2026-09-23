import { useEffect, useState } from "react";
import Button from "~/components/button";
import Select from "~/components/select";

const dayOptions = Array.from({ length: 31 }, (_, i) => {
  const value = i + 1;
  const label = String(value);
  return { label: label, value: value };
});

const monthOptions = Array.from({ length: 12 }, (_, i) => {
  const month = new Date(0, i).toLocaleString("en", { month: "long" });
  return { label: month, value: i + 1 };
});

const yearOptions = Array.from({ length: 6 }, (_, i) => {
  const year = new Date().getFullYear() - i;
  return { label: String(year), value: year };
});

export default function DateFilter({
  value,
  onSubmit,
}: {
  value?: {
    day?: number;
    month?: number;
    year?: number;
  };
  onSubmit: (value?: { day?: number; month?: number; year?: number }) => void;
}) {
  const [filter, setFilter] = useState<{
    day: number | null;
    month: number | null;
    year: number | null;
  }>({
    day: value?.day || null,
    month: value?.month || null,
    year: value?.year || null,
  });

  useEffect(() => {
    setFilter({
      day: value?.day || null,
      month: value?.month || null,
      year: value?.year || null,
    });
  }, [value]);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit({
          day: filter.day || undefined,
          month: filter.month || undefined,
          year: filter.year || undefined,
        });
      }}
      className="flex items-center gap-2"
    >
      <Select
        className="w-32"
        options={[{ label: "Select day", value: null }, ...dayOptions]}
        value={filter.day}
        onChange={(day) => {
          setFilter((prev) => ({ ...prev, day }));
        }}
      />
      <Select
        className="w-34"
        options={[{ label: "Select month", value: null }, ...monthOptions]}
        value={filter.month}
        onChange={(month) => {
          setFilter((prev) => ({ ...prev, month }));
        }}
      />
      <Select
        className="w-34"
        options={[{ label: "Select year", value: null }, ...yearOptions]}
        value={filter.year}
        onChange={(year) => {
          setFilter((prev) => ({ ...prev, year }));
        }}
      />
      <Button
        type="submit"
        disabled={
          (!!filter.month && !filter.year) ||
          (!filter.month && !!filter.year) ||
          (!!filter.day && !filter.month && !filter.year)
        }
      >
        Filter
      </Button>
      {(value?.day || value?.month || value?.year) && (
        <Button
          variant="ghost"
          type="button"
          onClick={() => {
            onSubmit(undefined);
          }}
        >
          Clear
        </Button>
      )}
    </form>
  );
}
