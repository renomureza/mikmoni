import { createMiddleware } from "@tanstack/react-start";
import { redirect } from "@tanstack/react-router";
import { $getSession } from "~/serverfns/auth";
import { $getActiveRouteros } from "~/serverfns/routeros";
import { clientManager } from "~/lib/routeros-client";

export const authMiddleware = createMiddleware().server(async ({ next }) => {
  const session = await $getSession();

  if (!session) {
    throw redirect({ to: "/login" });
  }

  return next({
    context: {
      user: session,
    },
  });
});

export const routerosMiddleware = createMiddleware().server(
  async ({ next }) => {
    const routeros = await $getActiveRouteros();

    if (!routeros) {
      throw redirect({ to: "/" });
    }

    const routerosClient = clientManager.getClient(routeros.id);
    return next({
      context: {
        routerosClient,
        routeros: {
          ...routeros,
          client: routerosClient,
        },
      },
    });
  },
);

export const authAndRouterosMiddleware = createMiddleware().middleware([
  authMiddleware,
  routerosMiddleware,
]);
