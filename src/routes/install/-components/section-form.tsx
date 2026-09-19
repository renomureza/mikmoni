import { cn } from "cn";
import { useId } from "react";
import Button from "~/components/button";

export default function SectionForm({
  title,
  description,
  children,
  onSubmit,
  secondaryAction,
  primaryAction,
  isLoading,
}: {
  title: string;
  description: string;
  onSubmit: () => void;
  children: React.ReactNode;
  secondaryAction: { disabled?: boolean; onClick: () => void };
  primaryAction: { children: React.ReactNode };
  isLoading?: boolean;
}) {
  const formId = useId();

  return (
    <div className="bg-white rounded-2xl border p-8 space-y-6 w-full">
      <div className="space-y-1">
        <h2 className="text-xl font-medium">{title}</h2>
        <p className="text-neutral-500">{description}</p>
      </div>

      <form
        id={formId}
        className="space-y-3"
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit();
        }}
      >
        {children}
      </form>

      <div
        className={cn(
          "grid grid-cols-2 gap-2",
          isLoading && "pointer-events-auto opacity-50",
        )}
      >
        <Button variant="secondary" className="w-full" {...secondaryAction}>
          Back
        </Button>
        <Button form={formId} className="w-full" {...primaryAction} />
      </div>
    </div>
  );
}
