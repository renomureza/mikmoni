import { createServerFn } from "@tanstack/react-start";
import { db } from "~/lib/db";
import { getSession } from "~/lib/session";

export const $getActiveRouteros = createServerFn().handler(async () => {
  const session = await getSession();
  if (!session || !session.data.routerosId) return null;
  const routeros = await db.query.routeros.findFirst({
    where: { id: session.data.routerosId },
  });
  return routeros || null;
});
