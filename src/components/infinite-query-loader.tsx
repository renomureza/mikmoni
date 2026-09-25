import { Trans } from "@lingui/react/macro";
import { cn } from "cn";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { useOnInView } from "react-intersection-observer";

export function InfiniteQueryLoader({
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage,
  className,
  stopEveryPage,
}: {
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  fetchNextPage: () => void;
  className?: string;
  stopEveryPage?: number;
}) {
  const [stopEvery, setStopEvery] = useState(stopEveryPage);

  const trackingRef = useOnInView(
    (inView) => {
      if (
        inView &&
        !isFetchingNextPage &&
        (typeof stopEvery === "undefined" || stopEvery > 0)
      ) {
        fetchNextPage();
        if (stopEveryPage) {
          setStopEvery((prev) => (prev ?? 0) - 1);
        }
      }
    },
    {
      threshold: 0.5,
      skip: !hasNextPage,
    },
  );

  return (
    <button
      ref={trackingRef}
      type="button"
      disabled={!hasNextPage || isFetchingNextPage}
      className={cn(
        "mx-auto flex w-full items-center justify-center font-medium text-neutral-600 hover:underline disabled:opacity-50",
        className,
      )}
      onClick={() => {
        if (stopEveryPage) {
          setStopEvery(stopEveryPage - 1);
        }
        fetchNextPage();
      }}
    >
      {isFetchingNextPage ? (
        <Loader2 className="text-neutral-700" />
      ) : hasNextPage ? (
        <Trans>Load more</Trans>
      ) : null}
    </button>
  );
}
