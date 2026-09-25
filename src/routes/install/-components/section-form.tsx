import { Trans } from "@lingui/react/macro";
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
  title: React.ReactNode;
  description: React.ReactNode;
  onSubmit: () => void;
  children: React.ReactNode;
  secondaryAction: { disabled?: boolean; onClick: () => void };
  primaryAction: { children: React.ReactNode };
  isLoading?: boolean;
}) {
  const formId = useId();

  return (
    <div className="w-full space-y-6 rounded-2xl border bg-white p-8 px-6 sm:px-8">
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
          <Trans>Back</Trans>
        </Button>
        <Button form={formId} className="w-full" {...primaryAction} />
      </div>
    </div>
  );
}
