import { Currency, Language } from "~/contants/locale";
import { db, schema } from "~/lib/db";

function createKeyValue<TValue>({
  key,
  defaultValue,
  decode,
  encode,
}: {
  key: string;
  defaultValue: TValue;
  encode: (value: TValue) => string;
  decode: (value: string) => TValue;
}) {
  return {
    async upsert(value: TValue) {
      const normalizedValue = encode(value);

      await db
        .insert(schema.settings)
        .values({
          key,
          value: normalizedValue,
        })
        .onConflictDoUpdate({
          target: [schema.settings.key],
          set: {
            value: normalizedValue,
          },
        });
    },
    async get() {
      const option = await db.query.settings.findFirst({
        where: { key },
        columns: {
          value: true,
        },
      });

      if (!option) return defaultValue;

      return decode(option.value);
    },
  };
}

export const languageSetting = createKeyValue<Language>({
  key: "language",
  defaultValue: "en",
  decode: (d) => d as Language,
  encode: (v) => v,
});

export const currencySetting = createKeyValue<Currency>({
  key: "currency",
  defaultValue: "IDR",
  decode: (d) => d as Currency,
  encode: (v) => v,
});
