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
              "relative flex h-(--popup-height,auto) w-(--popup-width,auto) min-w-40 max-w-125 flex-col gap-px origin-(--transform-origin) bg-white p-1 outline-none border shadow-lg rounded-lg transition-[scale,opacity] duration-100 ease-out data-ending-style:scale-[0.98] data-ending-style:opacity-0 data-starting-style:scale-[0.98] data-starting-style:opacity-0",
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
