import { Trans } from "@lingui/react/macro";
import Button, { ButtonProps } from "./button";
import { Dialog } from "@base-ui/react";

export default function DialogForm({
  children,
  onSubmit,
  primaryAction,
}: {
  children: React.ReactNode;
  onSubmit: () => void;
  primaryAction: ButtonProps;
}) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
      className="flex flex-col overflow-hidden"
    >
      <div className="space-y-3 overflow-y-auto px-6 py-4">{children}</div>
      <div className="flex justify-end gap-3 border-t bg-neutral-100 px-6 py-3">
        <Dialog.Close
          render={(props) => (
            <Button {...props} variant="outline">
              <Trans>Cancel</Trans>
            </Button>
          )}
        />
        <Button type="submit" {...primaryAction} />
      </div>
    </form>
  );
}
