import {
  Dialog as DialogPrimitive,
  DialogRootProps,
  DialogTriggerProps,
} from "@base-ui/react";
import { XIcon } from "lucide-react";

export default function Dialog({
  triggerProps,
  rootProps,
  children,
  title,
}: {
  triggerProps?: DialogTriggerProps;
  rootProps?: DialogRootProps;
  children: React.ReactNode;
  title: React.ReactNode;
}) {
  return (
    <DialogPrimitive.Root {...rootProps}>
      {triggerProps && <DialogPrimitive.Trigger {...triggerProps} />}
      <DialogPrimitive.Portal>
        <DialogPrimitive.Backdrop className="fixed inset-0 min-h-dvh bg-black opacity-50 transition-opacity duration-150 data-ending-style:opacity-0 data-starting-style:opacity-0 supports-[-webkit-touch-callout:none]:absolute" />
        <DialogPrimitive.Popup className="fixed top-1/2 left-1/2 flex max-h-[calc(100vh-3rem)] w-lg max-w-[calc(100vw-3rem)] -translate-x-1/2 -translate-y-1/2 flex-col overflow-clip rounded-xl bg-white shadow-black/12 transition-[scale,opacity] duration-100 ease-out data-ending-style:scale-[0.98] data-ending-style:opacity-0 data-starting-style:scale-[0.98] data-starting-style:opacity-0">
          <div className="flex w-full justify-between gap-1 border-b px-6 py-3">
            <DialogPrimitive.Title className="text-xl font-semibold">
              {title}
            </DialogPrimitive.Title>
            <DialogPrimitive.Close
              type="button"
              className="flex size-8 items-center justify-center rounded-lg text-neutral-600 transition-all hover:bg-neutral-50 hover:text-neutral-900"
            >
              <XIcon className="size-4" />
            </DialogPrimitive.Close>
          </div>
          {children}
        </DialogPrimitive.Popup>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
