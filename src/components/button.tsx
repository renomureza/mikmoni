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
        "flex w-max items-center justify-center gap-2 rounded-lg px-4 font-medium transition-all disabled:pointer-events-none disabled:opacity-50",
        {
          "h-9": !size,
          "h-10": size === "lg",
          "h-8": size === "sm",
          "h-7": size === "xs",
        },
        {
          "bg-brand text-white": !variant,
          "border border-neutral-300 bg-white hover:bg-neutral-100":
            variant === "outline",
          "bg-neutral-100 hover:bg-neutral-200": variant === "secondary",
          "bg-red-50 text-red-600 hover:bg-red-100": variant === "destructive",
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
