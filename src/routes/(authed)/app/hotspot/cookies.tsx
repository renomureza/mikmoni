import { createFileRoute } from "@tanstack/react-router";
import { Trash2Icon } from "lucide-react";
import {
  ensureGetHotspotCookiesQuery,
  useDeleteHotspotCookieMutation,
  useGetHotspotCookiesSuspenseQuery,
} from "~/serverfns/hotspot-cookies";
import { prettifyDuration } from "~/utils/routeros";

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
        className="flex size-7 items-center justify-center rounded-lg text-red-600 transition-all hover:bg-red-50 hover:text-red-700 disabled:pointer-events-none disabled:opacity-50"
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

      <div className="overflow-hidden rounded-lg border bg-white">
        <table className="w-full text-left [&_tbody_tr:not(:last-child)]:border-b [&_td]:py-1.5 [&_th]:py-2 [&_th]:font-medium [&_th]:text-neutral-500 [&_th,&_td]:px-3 [&_thead]:border-b [&_thead]:bg-neutral-100">
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
                  <td>{prettifyDuration(cookie["expires-in"] || "0s")}</td>
                  <td>
                    <CookieMenuItem cookie={cookie} />
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5}>
                  <div className="flex min-h-60 items-center justify-center">
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
