export async function tryCatch<TData>(
  promiseOrFn: Promise<TData> | (() => Promise<TData>),
): Promise<{ ok: true; data: TData } | { ok: false; error: string }> {
  try {
    const promise =
      typeof promiseOrFn === "function" ? promiseOrFn() : promiseOrFn;
    const data = await promise;
    return { ok: true, data };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Something went wrong",
    };
  }
}
