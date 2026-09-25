import { createMiddleware } from "@tanstack/react-start";
import { redirect } from "@tanstack/react-router";
import { $getSession } from "~/serverfns/auth";
import { clientManager } from "~/lib/routeros-client";

export const authMiddleware = createMiddleware().server(async ({ next }) => {
  const session = await $getSession();

  if (!session) {
    throw redirect({ to: "/login" });
  }

  return next({
    context: session,
  });
});

export const routerosMiddleware = createMiddleware()
  .middleware([authMiddleware])
  .server(async ({ next, context }) => {
    const routerosId = context.routeros?.id;

    if (!routerosId) {
      throw redirect({ to: "/" });
    }

    const routerosClient = clientManager.getClient(routerosId);

    return next({
      context: {
        routerosClient,
      },
    });
  });
