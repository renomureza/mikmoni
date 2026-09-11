import { clientManager } from "~/lib/routeros-client";

export async function getRouterosSpecs({ routerosId }: { routerosId: number }) {
  const routerosClient = clientManager.getClient(routerosId);
  const [resource] = (await routerosClient.write("/system/resource/print")) as {
    uptime: string;
    version: string;
    "build-time": string;
  }[];

  return { resource };
}
