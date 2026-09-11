import { createServerFn, useServerFn } from "@tanstack/react-start";
import { redirect } from "@tanstack/react-router";
import * as z from "zod/v4-mini";
import { db } from "~/lib/db";
import { getSession } from "~/lib/session";
import { verifyPasswordHash } from "~/utils/encryption";
import { useMutation } from "@tanstack/react-query";

export const $getSession = createServerFn().handler(async () => {
  const session = await getSession();
  if (!session.data) return null;
  const user = await db.query.users.findFirst({
    where: { id: session.data.userId },
    columns: {
      password: false,
    },
  });
  if (!user) return null;
  return user;
});

const loginInputSchema = z.object({
  email: z.email(),
  password: z.string().check(z.minLength(1)),
});

type LoginInputSchema = z.input<typeof loginInputSchema>;

const $login = createServerFn({ method: "POST" })
  .validator((d: LoginInputSchema) => d)
  .handler(async ({ data }) => {
    const validation = loginInputSchema.safeParse(data);

    if (!validation.success) {
      return {
        success: false,
        errors: z.flattenError(validation.error).fieldErrors,
      };
    }

    const user = await db.query.users.findFirst({
      where: { email: validation.data.email },
      columns: { id: true, password: true },
    });

    const genericErrorMessage = "Email/password is incorrect";

    if (!user) {
      return { success: false, error: genericErrorMessage };
    }

    const isPasswordMatch = await verifyPasswordHash(
      validation.data.password,
      user.password,
    );

    if (!isPasswordMatch) {
      return {
        success: false,
        error: genericErrorMessage,
      };
    }

    const session = await getSession();

    await session.update({ userId: user.id });

    throw redirect({ to: "/", reloadDocument: true });
  });

export function useLoginMutation() {
  const mutate = useServerFn($login);

  return useMutation({
    mutationFn: mutate,
  });
}
