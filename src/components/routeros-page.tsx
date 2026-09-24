import { cn } from "cn";

export default function RouterosPage({
  title,
  actions,
  children,
  className,
}: {
  title: React.ReactNode;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("size-full space-y-4", className)}>
      <div className="flex justify-between">
        <h1 className="text-2xl font-semibold">{title}</h1>
        {actions && <div className="flex items-center gap-3">{actions}</div>}
      </div>

      {children}
    </div>
  );
}
