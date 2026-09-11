import { cn } from "cn";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import { useId, useState } from "react";
import InlineError from "./inline-error";

export default function Input({
  label,
  className,
  error,
  suffix,
  prefix,
  ...props
}: React.ComponentProps<"input"> & {
  label?: string;
  error?: string;
  suffix?: React.ReactNode;
  prefix?: React.ReactNode;
}) {
  const id = useId();
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div role="group" className="grid grid-cols-1 gap-1 w-full h-max">
      {label && (
        <label htmlFor={id} className="font-medium">
          {label}
        </label>
      )}
      <div className="border overflow-hidden flex w-full border-neutral-300 focus-within:ring-neutral-200 focus-within:border-neutral-400 transition-all rounded-lg h-8.5 ring-3 ring-transparent has-aria-[invalid]:border-red-600 focus-within:has-aria-[invalid]:ring-red-200 ">
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
            className,
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
