import {
  CheckIcon,
  ChevronDownIcon,
  Loader2Icon,
  RouterIcon,
} from "lucide-react";
import Popover from "./popover";
import {
  useGetAllRouterosInfiniteQuery,
  useSetRouterosMutation,
} from "~/serverfns/routeros";
import { useState } from "react";
import useDebounceValue from "~/hooks/use-debounce-value";
import Input from "./input";
import { Trans, useLingui } from "@lingui/react/macro";
import { InfiniteQueryLoader } from "./infinite-query-loader";

function RouterosListItem({
  isActive,
  routeros,
}: {
  isActive: boolean;
  routeros: { id: number; name: string; host: string; port: number };
}) {
  const setActiveRouteros = useSetRouterosMutation();
  return (
    <button
      disabled={setActiveRouteros.isPending}
      onClick={() => {
        setActiveRouteros.mutate({ data: { id: routeros.id } });
      }}
      className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-xs transition-all hover:bg-neutral-100 disabled:pointer-events-none disabled:opacity-50"
    >
      {!setActiveRouteros.isPending ? (
        <RouterIcon className="size-5.5 text-neutral-500" />
      ) : (
        <Loader2Icon className="size-5.5 animate-spin text-neutral-500" />
      )}
      <div>
        <div className="font-medium">{routeros.name}</div>
        <div className="text-neutral-500">
          {routeros.host}:{routeros.port}
        </div>
      </div>

      {isActive && <CheckIcon className="ml-auto size-4" />}
    </button>
  );
}

function RouterosList({ activeRouterosId }: { activeRouterosId: number }) {
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedQuery = useDebounceValue(searchQuery);
  const routerosQuery = useGetAllRouterosInfiniteQuery({
    query: debouncedQuery,
  });

  const { t } = useLingui();

  return (
    <div className="flex max-w-60 flex-col">
      <div className="border-b p-2">
        <Input
          type="search"
          placeholder={t`Search routeros...`}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      <div className="max-h-60 w-full overflow-y-auto p-1.5">
        {!routerosQuery.data?.length ? (
          <div className="flex min-h-30 flex-col items-center justify-center gap-1 text-center">
            <div className="font-medium">
              <Trans>No Results Found</Trans>
            </div>
            {searchQuery && (
              <div className="text-xs text-neutral-500">
                <Trans>
                  Your search for &ldquo;{searchQuery}&rdquo; did not return any
                  results.
                </Trans>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-0.5">
            {routerosQuery.data.map((routeros) => (
              <RouterosListItem
                key={routeros.id}
                routeros={routeros}
                isActive={routeros.id === activeRouterosId}
              />
            ))}

            {routerosQuery.hasNextPage && (
              <InfiniteQueryLoader
                fetchNextPage={routerosQuery.fetchNextPage}
                hasNextPage={routerosQuery.hasNextPage}
                isFetchingNextPage={routerosQuery.isFetchingNextPage}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function RouterosPopover({
  routeros,
}: {
  routeros: { id: number; name: string; host: string; port: number };
}) {
  return (
    <Popover
      popupClassName="p-0"
      popoverTrigger={{
        className:
          "inline-flex max-w-56 items-center gap-2 rounded-lg bg-neutral-100 px-3 py-1.5 text-left text-xs transition-all hover:bg-neutral-200/60 data-popup-open:bg-neutral-200/60",
        children: (
          <>
            <RouterIcon className="size-6 shrink-0 text-neutral-500" />
            <div className="truncate">
              <div className="truncate font-semibold">{routeros.name}</div>
              <div className="truncate text-neutral-500">
                {routeros.host}:{routeros.port}
              </div>
            </div>
            <ChevronDownIcon className="ml-2 size-4 shrink-0 text-neutral-600" />
          </>
        ),
      }}
    >
      <RouterosList activeRouterosId={routeros.id} />
    </Popover>
  );
}
