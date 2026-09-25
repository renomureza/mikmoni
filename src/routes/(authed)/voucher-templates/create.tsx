import { createFileRoute } from "@tanstack/react-router";
import { useCreateVoucherTemplateMutation } from "~/serverfns/vouer-templates";
import VoucherTemplateEditor from "./-components/voucher-template-editor";

export const Route = createFileRoute("/(authed)/voucher-templates/create")({
  component: RouteComponent,
});

function RouteComponent() {
  const createHotspotTemplateMutation = useCreateVoucherTemplateMutation();

  return (
    <VoucherTemplateEditor
      isLoading={createHotspotTemplateMutation.isPending}
      onSubmit={(voucher) => {
        createHotspotTemplateMutation.mutate({ data: voucher });
      }}
    />
  );
}
