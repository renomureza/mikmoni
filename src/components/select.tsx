import { Select as SelectPrimitive } from "@base-ui/react";
import { CheckIcon, ChevronDownIcon, ChevronUpIcon } from "lucide-react";
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
  label?: string;
  placeholder?: string;
  error?: string;
  className?: string;
}) {
  return (
    <div className={cn("grid grid-cols-1 gap-1 w-full h-max", className)}>
      <SelectPrimitive.Root
        required={required}
        items={options}
        // @ts-ignore
        value={value}
        onValueChange={(value) => {
          if (required && value != null) {
            // @ts-ignore
            onChange(value);
          } else {
            // @ts-ignore
            onChange(value);
          }
        }}
      >
        {label && (
          <SelectPrimitive.Label className="cursor-default font-medium">
            {label}
          </SelectPrimitive.Label>
        )}
        <SelectPrimitive.Trigger className="flex h-8.5 outline-none rounded-lg items-center justify-between gap-3 pl-3 pr-1 text-sm leading-none whitespace-nowrap border border-neutral-300 transition-all ring-3 ring-transparent [data-pressed,:focus]:border-neutral-400 [data-pressed,:focus]:ring-neutral-200 bg-white select-none ">
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
            className="outline-hidden select-none z-10"
            sideOffset={4}
          >
            <SelectPrimitive.Popup className="group p-1 overflow-hidden min-w-(--anchor-width) origin-(--transform-origin) bg-clip-padding border rounded-lg bg-white outline-hidden shadow-lg transition-[scale,opacity] duration-100 ease-out data-ending-style:scale-[0.98] data-ending-style:opacity-0 data-[side=none]:translate-y-px data-[side=none]:min-w-[calc(var(--anchor-width)+1.75rem)] data-[side=none]:data-ending-style:transition-none data-starting-style:scale-[0.98] data-starting-style:opacity-0 data-[side=none]:data-starting-style:scale-100 data-[side=none]:data-starting-style:opacity-100 data-[side=none]:data-starting-style:transition-none">
              <SelectPrimitive.ScrollUpArrow className="top-0 z-1 flex h-4 w-full cursor-default items-center justify-center bg-white text-center before:absolute data-[side=none]:before:-top-full before:left-0 before:h-full before:w-full before:content-['']">
                <ChevronUpIcon className="size-4 text-neutral-500" />
              </SelectPrimitive.ScrollUpArrow>
              <SelectPrimitive.List className="relative scroll-py-6 space-y-0.5 overflow-y-auto max-h-(--available-height)">
                {options.map(({ label, value }) => (
                  <SelectPrimitive.Item
                    key={label}
                    value={value}
                    className="grid cursor-default grid-cols-1 rounded-lg gap-2 py-1.5 px-2.5 outline-hidden select-none data-selected:bg-neutral-100 hover:bg-neutral-100"
                  >
                    <SelectPrimitive.ItemText>{label}</SelectPrimitive.ItemText>
                  </SelectPrimitive.Item>
                ))}
              </SelectPrimitive.List>
              <SelectPrimitive.ScrollDownArrow className="bottom-0 z-1 flex h-4 w-full cursor-default items-center justify-center bg-white text-center text-xs before:absolute before:left-0 before:h-full before:w-full before:content-[''] data-[side=none]:before:bottom-[-100%] dark:bg-neutral-950">
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
