import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createServerFn, useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import * as z from "zod/v4";
import { compileVoucherTemplate } from "~/lib/handlebars";
import { authMiddleware } from "~/middlewares/auth";

const createHotspotTemplateInputSchema = z.object({
  name: z.string().min(1).trim(),
  source: z
    .string()
    .trim()
    .transform((source, ctx) => {
      try {
        compileVoucherTemplate({ source, users: [] });
        return source;
      } catch (e) {
        ctx.addIssue({
          code: "custom",
          path: ["source"],
          message: e instanceof Error ? e.message : "Source is invalid",
        });

        return z.NEVER;
      }
    }),
});

type CreateHotspotTemplateInputSchema = z.input<
  typeof createHotspotTemplateInputSchema
>;

const $createHotspotTemplate = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((d: CreateHotspotTemplateInputSchema) => d)
  .handler(async ({ context, data }) => {
    const validation = createHotspotTemplateInputSchema.safeParse(data);

    if (!validation.success) {
      return {
        success: false,
        errors: z.flattenError(validation.error).fieldErrors,
      };
    }

    return { success: true };
  });

export function useCreateHotspotTemplateMutation() {
  const mutate = useServerFn($createHotspotTemplate);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: mutate,
    onSuccess: async (data) => {
      if (data.success) {
        await queryClient.invalidateQueries({
          queryKey: ["voicher-templates"],
        });
        toast.success("Voucher template successfully created.");
      }
    },
  });
}
