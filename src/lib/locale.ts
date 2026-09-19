import { Language } from "~/contants/locale";

export async function getLocale(language: Language) {
  return (await import(`../locales/${language}.json`)).default;
}
