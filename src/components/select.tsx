import { Select as SelectPrimitive } from "@base-ui/react";
import { ChevronDownIcon, ChevronUpIcon } from "lucide-react";
import InlineError from "./inline-error";
import { cn } from "cn";

type Option = {
  label: string;
  value: string | number | null;
};

export default function Select<
  TOption extends Option,
  TRequired extends boolean,
>({
  options,
  value,
  onChange,
  required,
  label,
  placeholder = "Select...",
  error,
  className,
}: {
  options: readonly TOption[] | TOption[];
  value: TRequired extends true ? TOption["value"] : TOption["value"] | null;
  onChange: (
    value: TRequired extends true ? TOption["value"] : TOption["value"] | null,
  ) => void;
  required?: boolean;
  label?: React.ReactNode;
  placeholder?: string;
  error?: string;
  className?: string;
}) {
  return (
    <div className={cn("grid h-max w-full grid-cols-1 gap-1", className)}>
      <SelectPrimitive.Root
        required={required}
        items={options}
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        value={value}
        onValueChange={(value) => {
          if (required && value != null) {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-expect-error
            onChange(value);
          } else {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-expect-error
            onChange(value);
          }
        }}
      >
        {label && (
          <SelectPrimitive.Label className="cursor-default font-medium">
            {label}
          </SelectPrimitive.Label>
        )}
        <SelectPrimitive.Trigger className="flex h-9 items-center justify-between gap-3 rounded-lg border border-neutral-300 bg-white pr-1 pl-3 text-sm leading-none whitespace-nowrap ring-3 ring-transparent transition-all outline-none select-none [data-pressed,:focus]:border-neutral-400 [data-pressed,:focus]:ring-neutral-200">
          <SelectPrimitive.Value
            className="data-placeholder:text-neutral-400"
            placeholder={placeholder}
          />
          <SelectPrimitive.Icon>
            <ChevronDownIcon className="size-4 text-neutral-500" />
          </SelectPrimitive.Icon>
        </SelectPrimitive.Trigger>
        <SelectPrimitive.Portal>
          <SelectPrimitive.Positioner
            className="z-10 outline-hidden select-none"
            sideOffset={4}
          >
            <SelectPrimitive.Popup className="group min-w-(--anchor-width) origin-(--transform-origin) overflow-hidden rounded-lg border bg-white bg-clip-padding p-1 shadow-lg outline-hidden transition-[scale,opacity] duration-100 ease-out data-ending-style:scale-[0.98] data-ending-style:opacity-0 data-starting-style:scale-[0.98] data-starting-style:opacity-0 data-[side=none]:min-w-[calc(var(--anchor-width)+1.75rem)] data-[side=none]:translate-y-px data-[side=none]:data-ending-style:transition-none data-[side=none]:data-starting-style:scale-100 data-[side=none]:data-starting-style:opacity-100 data-[side=none]:data-starting-style:transition-none">
              <SelectPrimitive.ScrollUpArrow className="top-0 z-1 flex h-4 w-full cursor-default items-center justify-center bg-white text-center before:absolute before:left-0 before:h-full before:w-full before:content-[''] data-[side=none]:before:-top-full">
                <ChevronUpIcon className="size-4 text-neutral-500" />
              </SelectPrimitive.ScrollUpArrow>
              <SelectPrimitive.List className="relative max-h-(--available-height) scroll-py-6 space-y-0.5 overflow-y-auto">
                {options.map(({ label, value }) => (
                  <SelectPrimitive.Item
                    key={label}
                    value={value}
                    className="grid cursor-default grid-cols-1 gap-2 rounded-lg px-2.5 py-1.5 outline-hidden select-none hover:bg-neutral-100 data-selected:bg-neutral-100"
                  >
                    <SelectPrimitive.ItemText>{label}</SelectPrimitive.ItemText>
                  </SelectPrimitive.Item>
                ))}
              </SelectPrimitive.List>
              <SelectPrimitive.ScrollDownArrow className="bottom-0 z-1 flex h-4 w-full cursor-default items-center justify-center bg-white text-center text-xs before:absolute before:left-0 before:h-full before:w-full before:content-[''] data-[side=none]:before:-bottom-full dark:bg-neutral-950">
                <ChevronDownIcon className="size-4 text-neutral-500" />
              </SelectPrimitive.ScrollDownArrow>
            </SelectPrimitive.Popup>
          </SelectPrimitive.Positioner>
        </SelectPrimitive.Portal>
        <InlineError message={error} />
      </SelectPrimitive.Root>
    </div>
  );
}
