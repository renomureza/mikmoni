export default function TableContent({
  filters,
  children,
}: {
  filters: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-xl border bg-white">
      <div className="flex w-full flex-wrap gap-2 p-4">{filters}</div>
      <div className="max-h-160 w-full overflow-y-auto">{children}</div>
    </div>
  );
}
