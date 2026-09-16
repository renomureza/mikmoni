import { createFileRoute } from "@tanstack/react-router";
import Button from "~/components/button";
import {
  ensureGetPrebuiltVoucherTemplatesQuery,
  useGetPrebuiltVoucherTemplatesSuspenseQuery,
} from "~/serverfns/prebuilt-voucher-templates";

export const Route = createFileRoute("/(authed)/app/voucher-templates/")({
  component: RouteComponent,
  loader: async ({ context }) => {
    await ensureGetPrebuiltVoucherTemplatesQuery({
      queryClient: context.queryClient,
    });
  },
});

function RouteComponent() {
  const navigate = Route.useNavigate();
  const prebuiltTemplatesQuery = useGetPrebuiltVoucherTemplatesSuspenseQuery();

  return (
    <div className="w-full space-y-4">
      <div className="flex justify-between">
        <h1 className="text-xl font-semibold">Voucher Templates</h1>
        <div className="flex items-center gap-3">
          <Button
            onClick={() => {
              navigate({ to: "/app/voucher-templates/create" });
            }}
            type="button"
          >
            Create
          </Button>
        </div>
      </div>

      <div className="space-y-1">
        <h2 className="font-medium text-base">Pre-built Templates</h2>
        <div className="columns-5 gap-3">
          {prebuiltTemplatesQuery.data.map((template) => (
            <div
              key={template.name}
              className="border bg-white w-full px-4 py-4 rounded-xl"
            >
              <div>
                <h3 className="font-medium ">{template.name}</h3>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-1">
        <h2 className="font-medium text-base">Custom Templates</h2>
        <div className="grid grid-cols-5 gap-3">
          {prebuiltTemplatesQuery.data.map((template) => (
            <div
              key={template.name}
              className="border bg-white px-4 py-4 rounded-xl"
            >
              <h2 className="font-medium ">{template.name}</h2>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
