import { cn } from "cn";
import { BoldIcon, EyeIcon, EyeOffIcon, HelpCircleIcon } from "lucide-react";
import React, { useId, useState } from "react";
import InlineError from "./inline-error";
import { Tooltip } from "@base-ui/react";

export default function Input({
  label,
  className,
  error,
  suffix,
  prefix,
  tooltip,
  ...props
}: React.ComponentProps<"input"> & {
  label?: string;
  error?: string;
  suffix?: React.ReactNode;
  prefix?: React.ReactNode;
  tooltip?: React.ReactNode;
}) {
  const id = useId();
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div
      role="group"
      className={cn("grid grid-cols-1 gap-1 w-full h-max", className)}
    >
      {label && (
        <label htmlFor={id} className="font-medium">
          {label}{" "}
          {tooltip && (
            <Tooltip.Root>
              <Tooltip.Trigger
                delay={400}
                className="border-0 ml-1 cursor-help text-neutral-600 hover:text-foreground select-none focus-visible:relative focus-visible:z-1 focus-visible:bg-transparent focus-visible:outline-2 focus-visible:outline-neutral-950"
              >
                <HelpCircleIcon className="size-3" />
              </Tooltip.Trigger>
              <Tooltip.Portal>
                <Tooltip.Positioner sideOffset={7}>
                  <Tooltip.Popup className="relative max-w-50  flex text-xs flex-col border rounded-lg bg-white px-2.5 py-1.5 origin-(--transform-origin) shadow-lg transition-[transform,opacity] duration-100 ease-out data-ending-style:opacity-0 data-ending-style:transform-[scale(0.98)] data-instant:transition-none data-starting-style:opacity-0 data-starting-style:transform-[scale(0.98)]">
                    <Tooltip.Arrow className="relative block w-3 h-1.5 overflow-clip data-[side=bottom]:-top-1.5 data-[side=left]:-right-2.25 data-[side=left]:rotate-90 data-[side=right]:-left-2.25 data-[side=right]:-rotate-90 data-[side=top]:-bottom-1.5 data-[side=top]:rotate-180 before:content-[''] before:absolute before:bottom-0 before:left-1/2 before:w-[calc(6px*sqrt(2))] before:h-[calc(6px*sqrt(2))] before:bg-white before:border before:transform-[translate(-50%,50%)_rotate(45deg)]" />
                    <div className="[&_code]:text-[0.625rem] [&_code]:bg-neutral-200/50 [&_code]:px-1 [&_code]:rounded-sm">
                      {tooltip}
                    </div>
                  </Tooltip.Popup>
                </Tooltip.Positioner>
              </Tooltip.Portal>
            </Tooltip.Root>
          )}
        </label>
      )}
      <div className="border bg-white overflow-hidden flex w-full border-neutral-300 focus-within:ring-neutral-200 focus-within:border-neutral-400 transition-all rounded-lg h-8.5 ring-3 ring-transparent has-aria-[invalid]:border-red-600 focus-within:has-aria-[invalid]:ring-red-200 ">
        {prefix && (
          <div className="text-neutral-600 px-2 h-full flex items-center">
            {prefix}
          </div>
        )}
        <input
          {...props}
          type={props.type === "password" && showPassword ? "text" : props.type}
          id={id}
          aria-invalid={!!error || undefined}
          className={cn(
            "size-full [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none outline-none px-2.5",
            (suffix || props.type === "password") && "pr-0",
            prefix && "pl-0",
          )}
        />
        {props.type === "password" ? (
          <button
            type="button"
            className="px-2 [&_svg]:size-5 text-neutral-600 hover:text-neutral-900 transition-colors"
            onClick={() => {
              setShowPassword((prev) => !prev);
            }}
          >
            {!showPassword ? <EyeOffIcon /> : <EyeIcon />}
          </button>
        ) : (
          suffix && (
            <div className="text-neutral-600 px-2 h-full flex items-center">
              {suffix}
            </div>
          )
        )}
      </div>
      <InlineError message={error} />
    </div>
  );
}
