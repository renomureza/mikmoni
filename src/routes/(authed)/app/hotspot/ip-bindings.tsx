import { createFileRoute } from "@tanstack/react-router";
import { cn } from "cn";
import { LockIcon, LockOpenIcon, Trash2Icon } from "lucide-react";
import {
  ensureGetIpBindingQuery,
  useDeleteIpBindingMutation,
  useDisableIpBindingMutation,
  useGetIpBindingSuspenseQuery,
} from "~/serverfns/ip-binding";

export const Route = createFileRoute("/(authed)/app/hotspot/ip-bindings")({
  component: RouteComponent,
  loader: async ({ context }) => {
    await ensureGetIpBindingQuery({ queryClient: context.queryClient });
  },
});

function IpBindingIndicator({ type }: { type?: "bypassed" | "blocked" }) {
  switch (type) {
    case "bypassed":
      return <div title="P - bypassed">P</div>;
    case "blocked":
      return <div title="B - blocked">B</div>;
    default:
      return null;
  }
}

function IpBindingMenuItem({
  ipBinding,
}: {
  ipBinding: { ".id": string; disabled?: "true" | "false" };
}) {
  const deleteMutation = useDeleteIpBindingMutation();
  const disableMutation = useDisableIpBindingMutation();

  return (
    <div className="flex items-center justify-end gap-0.5">
      <button
        title={ipBinding.disabled === "true" ? "Enable" : "Disable"}
        disabled={deleteMutation.isPending}
        type="button"
        className={cn(
          " rounded-lg disabled:pointer-events-none disabled:opacity-50 transition-all size-7 flex justify-center items-center",
          ipBinding.disabled !== "true"
            ? "text-neutral-600 hover:text-neutral-700 hover:bg-neutral-50"
            : "text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50",
        )}
        onClick={() => {
          disableMutation.mutate({
            data: {
              id: ipBinding[".id"],
              disabled: ipBinding.disabled === "true" ? "false" : "true",
            },
          });
        }}
      >
        {ipBinding.disabled === "true" ? (
          <LockIcon className="size-4" />
        ) : (
          <LockOpenIcon className="size-4" />
        )}
      </button>
      <button
        disabled={deleteMutation.isPending}
        type="button"
        className="text-red-600 rounded-lg disabled:pointer-events-none disabled:opacity-50 transition-all hover:text-red-700 hover:bg-red-50 size-7 flex justify-center items-center"
        onClick={() => {
          if (window.confirm("Are you sure you want to delete it?")) {
            deleteMutation.mutate({ data: { id: ipBinding[".id"] } });
          }
        }}
      >
        <Trash2Icon className="size-4" />
      </button>
    </div>
  );
}

function RouteComponent() {
  const ipBindingsQuery = useGetIpBindingSuspenseQuery();

  return (
    <div className="w-full space-y-4">
      <div className="flex justify-between">
        <h1 className="text-xl font-semibold">IP Bindings</h1>
      </div>

      <div className="bg-white border rounded-lg overflow-hidden">
        <table className="w-full text-left [&_thead]:bg-neutral-100 [&_th]:text-neutral-500 [&_tbody_tr:not(:last-child)]:border-b [&_thead]:border-b [&_th]:font-medium [&_th,&_td]:px-3 [&_th]:py-2 [&_td]:py-1.5">
          <thead>
            <tr>
              <th></th>
              <th>Mac Address</th>
              <th>Address</th>
              <th>To Address</th>
              <th>Server</th>
              <th>Comment</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {ipBindingsQuery.data?.length ? (
              ipBindingsQuery.data.map((ipBinding) => (
                <tr key={ipBinding[".id"]}>
                  <td>
                    <IpBindingIndicator type={ipBinding.type} />
                  </td>
                  <td>{ipBinding["mac-address"]}</td>
                  <td>{ipBinding.address}</td>
                  <td>{ipBinding["to-address"]}</td>
                  <td>{ipBinding["server"]}</td>
                  <td>{ipBinding["comment"]}</td>
                  <td>
                    <IpBindingMenuItem ipBinding={ipBinding} />
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7}>
                  <div className="flex justify-center items-center min-h-60">
                    <div>No Results Found</div>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
