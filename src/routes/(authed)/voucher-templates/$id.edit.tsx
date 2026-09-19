import { createFileRoute, notFound } from "@tanstack/react-router";
import {
  $getVoucherTemplate,
  useUpdateVoucherTemplateMutation,
} from "~/serverfns/vouer-templates";
import VoucherTemplateEditor from "./-components/voucher-template-editor";

export const Route = createFileRoute("/(authed)/voucher-templates/$id/edit")({
  component: RouteComponent,
  loader: async ({ params }) => {
    const voucherTemplate = await $getVoucherTemplate({
      data: { id: params.id },
    });

    if (!voucherTemplate) {
      throw notFound();
    }

    return voucherTemplate;
  },
});

function RouteComponent() {
  const voucherTemplate = Route.useLoaderData();
  const updateVoucherTemplate = useUpdateVoucherTemplateMutation();

  return (
    <VoucherTemplateEditor
      isUpdate
      isLoading={updateVoucherTemplate.isPending}
      voucher={voucherTemplate}
      onSubmit={(voucher) => {
        updateVoucherTemplate.mutate({
          data: { ...voucher, id: voucherTemplate.id },
        });
      }}
    />
  );
}
