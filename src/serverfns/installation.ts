import { useMutation } from "@tanstack/react-query";
import { redirect } from "@tanstack/react-router";
import { createServerFn, useServerFn } from "@tanstack/react-start";
import * as z from "zod/v4";
import { currencyValues, languageValues } from "~/contants/locale";
import { db, schema } from "~/lib/db";
import { installedOption } from "~/services/options";
import { currencySetting, languageSetting } from "~/services/settings";
import { hashPassword } from "~/utils/encryption";

const installInputSchema = z.object({
  language: z.enum(languageValues),
  currency: z.enum(currencyValues),
  username: z
    .string()
    .min(3)
    .regex(/^[a-zA-Z0-9]+$/, "Username can only contain letters and numbers."),
  password: z.string().min(8),
});

type InstallInputSchema = z.input<typeof installInputSchema>;

const $install = createServerFn({ method: "POST" })
  .validator((d: InstallInputSchema) => d)
  .handler(async ({ data }) => {
    const isInstalled = await installedOption.get();

    if (isInstalled) {
      throw redirect({ to: "/" });
    }

    const validation = installInputSchema.safeParse(data);

    if (!validation.success) {
      return {
        success: false,
        errors: z.flattenError(validation.error).fieldErrors,
      };
    }

    await Promise.all([
      db.insert(schema.users).values({
        name: validation.data.username,
        username: validation.data.username,
        password: await hashPassword(validation.data.password),
      }),
      languageSetting.upsert(validation.data.language),
      currencySetting.upsert(validation.data.currency),
      installedOption.upsert(true),
    ]);

    throw redirect({ to: "/login", reloadDocument: true });
  });

export function useInstallMutation() {
  const mutate = useServerFn($install);
  return useMutation({ mutationFn: mutate });
}

//

export const $getIsInstalled = createServerFn().handler(() =>
  installedOption.get(),
);
