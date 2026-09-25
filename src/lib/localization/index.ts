import { Language } from "~/contants/locale";
import type { I18n } from "@lingui/core";

export async function loadAndActivateLocale(locale: Language, i18n: I18n) {
  const { messages } = await import(`../../locales/${locale}/messages.po`);
  i18n.loadAndActivate({ locale, messages });
}
