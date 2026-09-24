import { Trans } from "@lingui/react/macro";
import Button from "./button";

export default function SettingCard({
  title,
  description,
  children,
  isPending,
  onSave,
  disabled,
}: {
  title: React.ReactNode;
  description: React.ReactNode;
  children: React.ReactNode;
  isPending: boolean;
  onSave: () => void;
  disabled?: boolean;
}) {
  return (
    <div className="overflow-hidden rounded-xl border bg-white">
      <div className="space-y-4 p-5">
        <div>
          <h2 className="text-base font-medium">{title}</h2>
          <p className="text-neutral-500">{description}</p>
        </div>
        <div className="flex w-full max-w-md flex-col gap-3">{children}</div>
      </div>
      <div className="flex justify-end border-t bg-neutral-50 px-5 py-2">
        <Button
          disabled={disabled}
          isLoading={isPending}
          type="button"
          onClick={onSave}
        >
          <Trans>Save</Trans>
        </Button>
      </div>
    </div>
  );
}
