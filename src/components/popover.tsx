import {
  Popover as PopoverPrimitive,
  PopoverRootProps,
  PopoverTriggerProps,
} from "@base-ui/react";
import { cn } from "cn";

export default function Popover({
  popoverTrigger,
  children,
  popupClassName,
  root,
}: {
  root?: PopoverRootProps;
  popoverTrigger: PopoverTriggerProps;
  children: React.ReactNode;
  popupClassName?: string;
}) {
  return (
    <PopoverPrimitive.Root {...root}>
      <PopoverPrimitive.Trigger {...popoverTrigger} />
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Positioner sideOffset={8}>
          <PopoverPrimitive.Popup
            className={cn(
              "relative flex h-(--popup-height,auto) w-(--popup-width,auto) max-w-125 min-w-40 origin-(--transform-origin) flex-col gap-px rounded-lg border bg-white p-1 shadow-lg transition-[scale,opacity] duration-100 ease-out outline-none data-ending-style:scale-[0.98] data-ending-style:opacity-0 data-starting-style:scale-[0.98] data-starting-style:opacity-0",
              popupClassName,
            )}
          >
            {children}
          </PopoverPrimitive.Popup>
        </PopoverPrimitive.Positioner>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
}
