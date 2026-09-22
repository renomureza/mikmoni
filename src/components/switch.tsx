import { Switch as SwitchPrimitive, SwitchRootProps } from "@base-ui/react";
import { cn } from "cn";
import InlineError from "./inline-error";

export default function Switch({
  label,
  error,
  ...props
}: SwitchRootProps & { label?: string; error?: string }) {
  return (
    <div className="grid grid-cols-1 gap-1">
      <label className="flex items-center gap-2 font-medium">
        <SwitchPrimitive.Root
          {...props}
          className={cn(
            "flex h-5 w-9 shrink-0 cursor-pointer rounded-full border border-neutral-300 bg-neutral-300 p-0.5 transition-colors duration-150 ease-[ease] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900 data-checked:border-neutral-900 data-checked:bg-neutral-900",
            props.className,
          )}
        >
          <SwitchPrimitive.Thumb className="size-3.5 rounded-full bg-white transition-[translate,background-color] duration-150 ease-[ease] data-checked:translate-x-4 data-checked:bg-white" />
        </SwitchPrimitive.Root>
        {label}
      </label>
      <InlineError message={error} />
    </div>
  );
}
