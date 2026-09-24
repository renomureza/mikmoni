import { useEffect, useId, useMemo, useState } from "react";
import { Combobox as ComboboxPrimitive } from "@base-ui/react/combobox";
import { ChevronDownIcon, XIcon } from "lucide-react";
import InlineError from "./inline-error";
import { cn } from "cn";

type Option = {
  label: string;
  value: string | number;
};

function searchOptions<TOption extends Option>(
  options: TOption[] | readonly TOption[],
  query: string,
  filter: (item: string, query: string) => boolean,
): TOption[] {
  return options.filter((opt) => {
    return filter(opt.label, query) || filter(String(opt.value), query);
  });
}

export default function ComboboxSingle<TOption extends Option>({
  options,
  label,
  placeholder = "Search...",
  value,
  onChange,
  error,
  className,
}: {
  options: TOption[] | readonly TOption[];
  label?: string;
  placeholder?: string;
  value?: TOption["value"] | null;
  onChange: (value: TOption["value"] | null) => void;
  error?: string;
  className?: string;
}) {
  const id = useId();
  const [searchResults, setSearchResults] = useState(options);
  const [searchValue, setSearchValue] = useState("");

  const activeValue = useMemo(() => {
    return options.find((opt) => opt.value === value) ?? null;
  }, [value, options]);

  const { contains } = ComboboxPrimitive.useFilter();

  const trimmedSearchValue = searchValue.trim();

  useEffect(() => {
    setSearchResults(options);
  }, [options]);

  function getEmptyMessage() {
    if (!searchResults.length) {
      return (
        <>
          <p className="text-foreground">No Results Found</p>
          {trimmedSearchValue && (
            <p>
              Your search for "{trimmedSearchValue}" did not return any results.
            </p>
          )}
        </>
      );
    }

    return null;
  }

  const emptyMessage = getEmptyMessage();

  return (
    <ComboboxPrimitive.Root
      items={searchResults}
      value={activeValue}
      itemToStringLabel={(opt: TOption) => opt.label}
      isItemEqualToValue={(item, value) => item.value === value.value}
      filter={null}
      onOpenChangeComplete={(open) => {
        if (!open && value) {
          const opt = options.find((opt) => opt.value === value);
          if (opt) {
            setSearchResults([opt]);
          }
        }
      }}
      onValueChange={(nextSelectedValue) => {
        onChange(nextSelectedValue?.value ?? null);
        setSearchValue("");
      }}
      onInputValueChange={(nextSearchValue, { reason }) => {
        setSearchValue(nextSearchValue);

        if (nextSearchValue === "") {
          setSearchResults(options);
          return;
        }

        if (reason === "item-press") {
          return;
        }

        const result = searchOptions(options, nextSearchValue, contains);
        setSearchResults(result);
      }}
    >
      <div className={cn("relative grid w-full grid-cols-1 gap-1", className)}>
        {label && (
          <label htmlFor={id} className="font-medium">
            {label}
          </label>
        )}
        <ComboboxPrimitive.InputGroup
          aria-invalid={!!error || undefined}
          className="relative h-9 w-full overflow-hidden rounded-lg border border-neutral-300 bg-white ring-3 ring-transparent transition-all focus-within:border-neutral-400 focus-within:ring-neutral-200 focus-within:-outline-offset-1 focus-within:outline-neutral-950 focus-within:outline-none aria-invalid:border-red-600 focus-within:aria-invalid:ring-red-200 [&>input]:pr-10 has-[.combobox-clear]:[&>input]:pr-[calc(0.5rem+2rem*2)]"
        >
          <ComboboxPrimitive.Input
            id={id}
            placeholder={placeholder}
            className="h-full w-full border-0 bg-white pl-3 outline-none"
          />
          <div className="absolute right-0 bottom-0 flex h-full items-center justify-center text-neutral-500">
            <ComboboxPrimitive.Clear
              className="combobox-clear flex h-full w-6 items-center justify-center border-0 bg-transparent p-0"
              aria-label="Clear selection"
            >
              <XIcon className="size-3 text-neutral-500" />
            </ComboboxPrimitive.Clear>
            <ComboboxPrimitive.Trigger
              className="flex h-full w-6 items-center justify-center border-0 bg-transparent p-0"
              aria-label="Open popup"
            >
              <ChevronDownIcon className="size-4 text-neutral-500" />
            </ComboboxPrimitive.Trigger>
          </div>
        </ComboboxPrimitive.InputGroup>
        <InlineError message={error} />
      </div>

      <ComboboxPrimitive.Portal>
        <ComboboxPrimitive.Positioner className="outline-none" sideOffset={4}>
          <ComboboxPrimitive.Popup className="w-(--anchor-width) max-w-(--available-width) origin-(--transform-origin) rounded-lg border bg-white shadow-lg transition-[scale,opacity] data-ending-style:transition-none data-starting-style:scale-95 data-starting-style:opacity-0">
            <div className="max-h-[min(var(--available-height),22.5rem)] scroll-pt-1 scroll-pb-1 overflow-y-auto overscroll-contain p-1">
              <ComboboxPrimitive.Empty>
                {emptyMessage ? (
                  <div className="space-y-0.5 px-2 py-5 text-center text-neutral-600">
                    {emptyMessage}
                  </div>
                ) : null}
              </ComboboxPrimitive.Empty>
              <ComboboxPrimitive.List className="space-y-0.5">
                {(opt: TOption) => (
                  <ComboboxPrimitive.Item
                    key={opt.value}
                    value={opt}
                    className="cursor-default items-start gap-2 rounded-lg px-2.5 py-1.5 transition-all outline-none select-none hover:bg-neutral-100 data-selected:bg-neutral-100"
                  >
                    {opt.label}
                  </ComboboxPrimitive.Item>
                )}
              </ComboboxPrimitive.List>
            </div>
          </ComboboxPrimitive.Popup>
        </ComboboxPrimitive.Positioner>
      </ComboboxPrimitive.Portal>
    </ComboboxPrimitive.Root>
  );
}
