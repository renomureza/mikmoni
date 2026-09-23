export default function RouterosPage({
  title,
  actions,
  children,
}: {
  title: React.ReactNode;
  actions?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="size-full space-y-4">
      <div className="flex justify-between">
        <h1 className="text-2xl font-semibold">{title}</h1>
        {actions && <div className="flex items-center gap-3">{actions}</div>}
      </div>

      {children}
    </div>
  );
}
