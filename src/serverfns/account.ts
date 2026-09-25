import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { createServerFn, useServerFn } from "@tanstack/react-start";
import { eq } from "drizzle-orm";
import { toast } from "sonner";
import * as z from "zod/v4";
import { db, schema } from "~/lib/db";
import { authMiddleware } from "~/middlewares/auth";
import { hashPassword, verifyPasswordHash } from "~/utils/encryption";

const updateAccountInputSchema = z
  .object({
    name: z.string().trim().min(1),
    username: z
      .string()
      .min(3)
      .regex(
        /^[a-zA-Z0-9]+$/,
        "Username can only contain letters and numbers.",
      ),

    currentPasswod: z.string().min(8),
    newPasswod: z.string().min(8),
  })
  .partial();

type InstallInputSchema = z.input<typeof updateAccountInputSchema>;

const $updateAccount = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((d: InstallInputSchema) => d)
  .handler(async ({ data, context }) => {
    const validation = updateAccountInputSchema.safeParse(data);

    if (!validation.success) {
      return {
        success: false,
        errors: z.flattenError(validation.error).fieldErrors,
      };
    }

    let newPassword;

    if (validation.data.newPasswod && validation.data.currentPasswod) {
      const user = await db.query.users.findFirst({
        where: { id: context.user.id },
        columns: {
          password: true,
        },
      });

      if (!user) {
        return { success: false, error: "User not found" };
      }

      const isCurrentPasswordMatch = await verifyPasswordHash(
        validation.data.currentPasswod,
        user.password,
      );

      if (!isCurrentPasswordMatch) {
        return {
          success: false,
          errors: { currentPasswod: ["The current password is incorrect."] },
        };
      }

      newPassword = await hashPassword(validation.data.newPasswod);
    }

    await db
      .update(schema.users)
      .set({
        name: validation.data.name,
        username: validation.data.username,
        password: newPassword,
      })
      .where(eq(schema.users.id, context.user.id));

    return { success: true };
  });

export function useUpdateAccountMutation() {
  const mutate = useServerFn($updateAccount);
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: mutate,
    onSuccess: async (data) => {
      if (data.success) {
        await queryClient.invalidateQueries();
        await router.invalidate();
        toast.success("Account successfully updated");
      } else if (data.error) {
        toast.error(data.error);
      }
    },
  });
}
