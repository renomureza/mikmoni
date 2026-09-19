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
        .insert(schema.options)
        .values({
          key,
          value: normalizedValue,
        })
        .onConflictDoUpdate({
          target: [schema.options.key],
          set: {
            value: normalizedValue,
          },
        });
    },
    async get() {
      const option = await db.query.options.findFirst({
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

export const installedOption = createKeyValue<boolean>({
  defaultValue: false,
  key: "installed",
  encode: (value) => String(value),
  decode: (value) => value === "true",
});
