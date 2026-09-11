import { useQuery } from "@tanstack/react-query";
import { createServerFn, useServerFn } from "@tanstack/react-start";
import * as z from "zod/v4-mini";
import { clientManager } from "~/lib/routeros-client";

const $getRouterosInfo = createServerFn()
  .validator(z.object({ id: z.coerce.number().check(z.int()) }))
  .handler(async ({ data }) => {
    const resource = (await clientManager
      .getClient(data.id)
      .write("/system/resource/print")
      .then((d) => d[0])) as
      | {
          uptime: string;
          version: string;
          "build-time": string;
        }
      | undefined;

    return { resource };
  });

export function usegetRouterosInfoQuery(id: number) {
  const query = useServerFn($getRouterosInfo);

  return useQuery({
    queryKey: ["routeros", id, "info"],
    queryFn: () => query({ data: { id } }),
  });
}
