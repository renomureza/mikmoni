import { useMutation } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { createServerFn, useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import * as z from "zod/v4";
import { currencies, currencyValues, languageValues } from "~/contants/locale";
import { authMiddleware } from "~/middlewares/auth";
import { currencySetting, languageSetting } from "~/services/settings";

export const $getLocalization = createServerFn().handler(async () => {
  const [language, currency] = await Promise.all([
    languageSetting.get(),
    currencySetting.get(),
  ]);
  return { language, currency };
});

//

const updateLanguageInputSchema = z.object({
  language: z.enum(languageValues),
});

type UpdateLanguageInputSchema = z.input<typeof updateLanguageInputSchema>;

const $updateLanguage = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((d: UpdateLanguageInputSchema) => d)
  .handler(async ({ data }) => {
    const validation = updateLanguageInputSchema.safeParse(data);

    if (!validation.success) {
      return { success: false, error: validation.error.issues[0].message };
    }

    await languageSetting.upsert(validation.data.language);

    return { success: true };
  });

export function useUpdateLanguageMutation() {
  const mutate = useServerFn($updateLanguage);
  const router = useRouter();

  return useMutation({
    mutationFn: mutate,
    onSuccess: async (data) => {
      if (data?.success) {
        await router.invalidate();
        toast.success("Language successfully updated");
      }
    },
  });
}

//

const updateCurrencyInputSchema = z.object({
  currency: z.enum(currencyValues),
});

type UpdateCurrencyInputSchema = z.input<typeof updateCurrencyInputSchema>;

const $updateCurrency = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((d: UpdateCurrencyInputSchema) => d)
  .handler(async ({ data }) => {
    const validation = updateCurrencyInputSchema.safeParse(data);

    if (!validation.success) {
      return { success: false, error: validation.error.issues[0].message };
    }

    await currencySetting.upsert(validation.data.currency);

    return { success: true };
  });

export function useUpdateCurrencyMutation() {
  const mutate = useServerFn($updateCurrency);
  const router = useRouter();

  return useMutation({
    mutationFn: mutate,
    onSuccess: async (data) => {
      if (data?.success) {
        await router.invalidate();
        toast.success("Language successfully updated");
      }
    },
  });
}
