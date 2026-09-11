import { cn } from "cn";
import { Loader2Icon } from "lucide-react";

export default function Button({
  isLoading,
  children,
  className,
  disabled,
  size,
  variant,
  ...props
}: React.ComponentProps<"button"> & {
  isLoading?: boolean;
  size?: "xs" | "sm" | "lg";
  variant?: "outline" | "secondary" | "ghost" | "destructive";
}) {
  return (
    <button
      {...props}
      disabled={disabled || isLoading}
      className={cn(
        "disabled:opacity-50 disabled:pointer-events-none justify-center transition-all flex items-center gap-2 w-max px-3.5 h-8.5 rounded-lg font-medium",
        {
          "h-8.5": !size,
          "h-9": size === "lg",
          "h-8": size === "sm",
          "h-7": size === "xs",
        },
        {
          "bg-neutral-900 text-white ": !variant,
          "border-neutral-300 bg-white border hover:bg-neutral-100":
            variant === "outline",
          "bg-neutral-100 hover:bg-neutral-200": variant === "secondary",
          "bg-red-50 hover:bg-red-100 text-red-600": variant === "destructive",
          "hover:bg-neutral-200": variant === "ghost",
        },
        className,
      )}
    >
      {isLoading && <Loader2Icon className="h-[60%] w-auto animate-spin" />}
      {children}
    </button>
  );
}
