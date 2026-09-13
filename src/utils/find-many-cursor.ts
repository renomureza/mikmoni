import * as z from "zod/v4";

type Primitive = string | number | boolean | null;

type Jsonify<T> = T extends Date
  ? string
  : T extends bigint
    ? string
    : T extends Buffer | Uint8Array
      ? string
      : T extends Primitive
        ? T
        : T extends readonly (infer U)[]
          ? Jsonify<U>[]
          : T extends object
            ? {
                [K in keyof T]: Jsonify<T[K]>;
              }
            : never;

export function getFindManyCursorInputSchema(limit = 10) {
  return z.object({
    cursor: z.optional(z.string()),
    limit: z.optional(z.number().min(1).max(50).catch(limit).default(limit)),
  });
}

function encodeCursor(payload: Record<string, unknown>) {
  return Buffer.from(JSON.stringify(payload)).toString("base64");
}

function decodeCursor(base64: string) {
  try {
    return JSON.parse(Buffer.from(base64, "base64").toString("utf8"));
  } catch {
    return undefined;
  }
}

export async function findManyCursor<
  TRecord,
  TCursorFields extends (keyof TRecord)[],
>({
  cursorFields,
  query,
  findMany,
}: {
  cursorFields: TCursorFields;
  query?: { limit?: number; cursor?: string };
  findMany: (args: {
    limit: number;
    cursor?: { [K in TCursorFields[number]]: Jsonify<TRecord[K]> };
  }) => Promise<TRecord[]>;
}): Promise<{
  items: TRecord[];
  pageInfo: {
    nextCursor?: string | undefined;
  };
}> {
  const limit = query?.limit || 10;

  const decodedCursor = query?.cursor ? decodeCursor(query.cursor) : undefined;

  const items = await findMany({ limit: limit + 1, cursor: decodedCursor });

  let nextCursor: string | undefined = undefined;
  const hasNextPage = items.length > limit;

  if (hasNextPage) {
    items.pop();
    nextCursor = encodeCursor(
      Object.fromEntries(
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        cursorFields.map((field) => [field, items[items.length - 1][field]]),
      ),
    );
  }

  return {
    items: items,
    pageInfo: { nextCursor },
  };
}
