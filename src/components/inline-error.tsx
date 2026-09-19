import { cn } from "cn";

export default function InlineError({
  message,
  className,
}: {
  message?: string;
  className?: string;
}) {
  if (!message) return null;
  return <p className={cn("text-xs text-red-600", className)}>{message}</p>;
}
