import {
  Tooltip as TooltipPrimitive,
  TooltipTriggerProps,
} from "@base-ui/react";

export default function Tooltip({
  trigger,
  children,
}: {
  trigger: TooltipTriggerProps;
  children: React.ReactNode;
}) {
  return (
    <TooltipPrimitive.Root>
      <TooltipPrimitive.Trigger delay={300} {...trigger} />
      <TooltipPrimitive.Portal>
        <TooltipPrimitive.Positioner sideOffset={7}>
          <TooltipPrimitive.Popup className="relative max-w-50  flex text-xs flex-col border rounded-lg bg-white px-2.5 py-1.5 origin-(--transform-origin) shadow-lg transition-[transform,opacity] duration-100 ease-out data-ending-style:opacity-0 data-ending-style:transform-[scale(0.98)] data-instant:transition-none data-starting-style:opacity-0 data-starting-style:transform-[scale(0.98)]">
            <TooltipPrimitive.Arrow className="relative block w-3 h-1.5 overflow-clip data-[side=bottom]:-top-1.5 data-[side=left]:-right-2.25 data-[side=left]:rotate-90 data-[side=right]:-left-2.25 data-[side=right]:-rotate-90 data-[side=top]:-bottom-1.5 data-[side=top]:rotate-180 before:content-[''] before:absolute before:bottom-0 before:left-1/2 before:w-[calc(6px*sqrt(2))] before:h-[calc(6px*sqrt(2))] before:bg-white before:border before:transform-[translate(-50%,50%)_rotate(45deg)]" />
            <div className="[&_code]:text-[0.625rem] [&_code]:bg-neutral-200/50 [&_code]:px-1 [&_code]:rounded-sm">
              {children}
            </div>
          </TooltipPrimitive.Popup>
        </TooltipPrimitive.Positioner>
      </TooltipPrimitive.Portal>
    </TooltipPrimitive.Root>
  );
}
