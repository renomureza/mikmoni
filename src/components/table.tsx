import { Trans } from "@lingui/react/macro";
import { cn } from "cn";

function Table({ className, ...props }: React.ComponentProps<"table">) {
  return (
    <table
      {...props}
      className={cn(
        "w-full text-left whitespace-nowrap [&_tbody]:text-neutral-700 [&_tbody_tr:not(:last-child)]:border-b [&_td]:py-2 [&_th]:sticky [&_th]:top-0 [&_th]:bg-neutral-100 [&_th]:py-2 [&_th]:font-normal [&_th]:text-neutral-500 [&_th,&_td]:px-3 [&_thead_tr]:border-b",
        className,
      )}
    />
  );
}
function Thead(props: React.ComponentProps<"thead">) {
  return <thead {...props} />;
}
function Tr(props: React.ComponentProps<"tr">) {
  return <tr {...props} />;
}
function Th(props: React.ComponentProps<"th">) {
  return <th {...props} />;
}
function Tbody(props: React.ComponentProps<"tbody">) {
  return <tbody {...props} />;
}
function Td(props: React.ComponentProps<"td">) {
  return <td {...props} />;
}

function Empty({ query, className }: { query?: string; className?: string }) {
  return (
    <div
      className={cn(
        "flex min-h-60 flex-col items-center justify-center gap-1",
        className,
      )}
    >
      <div className="font-semibold">
        <Trans>No Results Found</Trans>
      </div>
      {query && (
        <div>
          <Trans>
            Your search for &ldquo;{query}&rdquo; did not return any results.
          </Trans>
        </div>
      )}
    </div>
  );
}

Table.Thead = Thead;
Table.Tr = Tr;
Table.Th = Th;
Table.Tbody = Tbody;
Table.Td = Td;
Table.Empty = Empty;

export default Table;
