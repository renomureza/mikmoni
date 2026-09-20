import { createFileRoute } from "@tanstack/react-router";
import { Trash2Icon } from "lucide-react";
import {
  ensureGetHotspotCookiesQuery,
  useDeleteHotspotCookieMutation,
  useGetHotspotCookiesSuspenseQuery,
} from "~/serverfns/hotspot-cookies";
import { formatUptime } from "~/utils/routeros";

export const Route = createFileRoute("/(authed)/app/hotspot/cookies")({
  component: RouteComponent,
  loader: async ({ context }) => {
    await ensureGetHotspotCookiesQuery({ queryClient: context.queryClient });
  },
});

function CookieMenuItem({ cookie }: { cookie: { ".id": string } }) {
  const deleteMutation = useDeleteHotspotCookieMutation();

  return (
    <div className="flex items-center justify-end">
      <button
        disabled={deleteMutation.isPending}
        type="button"
        className="text-red-600 rounded-lg disabled:pointer-events-none disabled:opacity-50 transition-all hover:text-red-700 hover:bg-red-50 size-7 flex justify-center items-center"
        onClick={() => {
          if (window.confirm("Are you sure you want to delete it?")) {
            deleteMutation.mutate({ data: { id: cookie[".id"] } });
          }
        }}
      >
        <Trash2Icon className="size-4" />
      </button>
    </div>
  );
}

function RouteComponent() {
  const hotspotCookiesQuery = useGetHotspotCookiesSuspenseQuery();

  return (
    <div className="w-full space-y-4">
      <div className="flex justify-between">
        <h1 className="text-xl font-semibold">Cookies</h1>
      </div>

      <div className="bg-white border rounded-lg overflow-hidden">
        <table className="w-full text-left [&_thead]:bg-neutral-100 [&_th]:text-neutral-500 [&_tbody_tr:not(:last-child)]:border-b [&_thead]:border-b [&_th]:font-medium [&_th,&_td]:px-3 [&_th]:py-2 [&_td]:py-1.5">
          <thead>
            <tr>
              <th>User</th>
              <th>Mac Address</th>
              <th>Domain</th>
              <th>Expires In</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {hotspotCookiesQuery.data?.length ? (
              hotspotCookiesQuery.data.map((cookie) => (
                <tr key={cookie[".id"]}>
                  <td>{cookie.user}</td>
                  <td>{cookie["mac-address"]}</td>
                  <td>{cookie.domain}</td>
                  <td>{formatUptime(cookie["expires-in"] || "0s")}</td>
                  <td>
                    <CookieMenuItem cookie={cookie} />
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5}>
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
