import {
  Checkbox as CheckboxPrimitive,
  type CheckboxRootProps,
} from "@base-ui/react";
import { cn } from "cn";
import { CheckIcon } from "lucide-react";

export default function Checkbox({
  label,
  className,
  ...props
}: CheckboxRootProps & { label?: string }) {
  return (
    <label className={cn("flex items-center gap-2", className)}>
      <CheckboxPrimitive.Root
        {...props}
        className="flex size-3.75 rounded-sm shrink-0 items-center justify-center border border-neutral-400 p-0 bg-white text-white data-checked:border-foreground  data-checked:bg-foreground data-checked:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-950 "
      >
        <CheckboxPrimitive.Indicator className="flex justify-center items-center data-unchecked:hidden">
          <CheckIcon className="size-[75%] stroke-4" />
        </CheckboxPrimitive.Indicator>
      </CheckboxPrimitive.Root>
      {label}
    </label>
  );
}
