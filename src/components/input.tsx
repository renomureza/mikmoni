import { cn } from "cn";
import { EyeIcon, EyeOffIcon, HelpCircleIcon } from "lucide-react";
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
      className={cn("grid h-max w-full grid-cols-1 gap-1", className)}
    >
      {label && (
        <label htmlFor={id} className="font-medium">
          {label}{" "}
          {tooltip && (
            <Tooltip.Root>
              <Tooltip.Trigger
                delay={400}
                className="ml-1 cursor-help border-0 text-neutral-600 select-none hover:text-foreground focus-visible:relative focus-visible:z-1 focus-visible:bg-transparent focus-visible:outline-2 focus-visible:outline-neutral-950"
              >
                <HelpCircleIcon className="size-3" />
              </Tooltip.Trigger>
              <Tooltip.Portal>
                <Tooltip.Positioner sideOffset={7}>
                  <Tooltip.Popup className="relative flex max-w-50 origin-(--transform-origin) flex-col rounded-lg border bg-white px-2.5 py-1.5 text-xs shadow-lg transition-[transform,opacity] duration-100 ease-out data-ending-style:transform-[scale(0.98)] data-ending-style:opacity-0 data-instant:transition-none data-starting-style:transform-[scale(0.98)] data-starting-style:opacity-0">
                    <Tooltip.Arrow className="relative block h-1.5 w-3 overflow-clip before:absolute before:bottom-0 before:left-1/2 before:h-[calc(6px*sqrt(2))] before:w-[calc(6px*sqrt(2))] before:transform-[translate(-50%,50%)_rotate(45deg)] before:border before:bg-white before:content-[''] data-[side=bottom]:-top-1.5 data-[side=left]:-right-2.25 data-[side=left]:rotate-90 data-[side=right]:-left-2.25 data-[side=right]:-rotate-90 data-[side=top]:-bottom-1.5 data-[side=top]:rotate-180" />
                    <div className="[&_code]:rounded-sm [&_code]:bg-neutral-200/50 [&_code]:px-1 [&_code]:text-[0.625rem]">
                      {tooltip}
                    </div>
                  </Tooltip.Popup>
                </Tooltip.Positioner>
              </Tooltip.Portal>
            </Tooltip.Root>
          )}
        </label>
      )}
      <div className="flex h-8.5 w-full overflow-hidden rounded-lg border border-neutral-300 bg-white ring-3 ring-transparent transition-all focus-within:border-neutral-400 focus-within:ring-neutral-200 has-aria-[invalid]:border-red-600 focus-within:has-aria-[invalid]:ring-red-200">
        {prefix && (
          <div className="flex h-full items-center px-2 text-neutral-600">
            {prefix}
          </div>
        )}
        <input
          {...props}
          type={props.type === "password" && showPassword ? "text" : props.type}
          id={id}
          aria-invalid={!!error || undefined}
          className={cn(
            "size-full [appearance:textfield] px-2.5 outline-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none",
            (suffix || props.type === "password") && "pr-0",
            prefix && "pl-0",
          )}
        />
        {props.type === "password" ? (
          <button
            type="button"
            className="px-2 text-neutral-600 transition-colors hover:text-neutral-900 [&_svg]:size-5"
            onClick={() => {
              setShowPassword((prev) => !prev);
            }}
          >
            {!showPassword ? <EyeOffIcon /> : <EyeIcon />}
          </button>
        ) : (
          suffix && (
            <div className="flex h-full items-center px-2 text-neutral-600">
              {suffix}
            </div>
          )
        )}
      </div>
      <InlineError message={error} />
    </div>
  );
}
