import { createFileRoute } from "@tanstack/react-router";
import { db } from "~/lib/db";
import { compileVoucherTemplate } from "~/lib/handlebars";
import { clientManager } from "~/lib/routeros-client";
import { getSession } from "~/lib/session";
import { currencySetting, languageSetting } from "~/services/settings";
import { formatCurrency } from "~/utils/number";
import { extractOnLoginScriptPutFields, formatBytes } from "~/utils/routeros";

export const Route = createFileRoute("/(authed)/app/print/$templateId/")({
  validateSearch: (search?: { comment: string } | { id: string }) => search,
  server: {
    handlers: {
      GET: async ({ request, params }) => {
        const session = await getSession();
        const routerosId = session.data.routerosId;
        const userId = session.data.userId;

        if (!userId) {
          return new Response("Unauthorized", { status: 401 });
        }

        if (!routerosId) {
          return new Response("Please use routeros first.", { status: 400 });
        }

        const url = new URL(request.url);
        const comment = url.searchParams.get("comment");
        const hotspotUserId = url.searchParams.get("id");

        const routeros = await db.query.routeros.findFirst({
          where: {
            id: routerosId,
          },
        });

        if (!routeros) {
          return new Response("Routeros not found.", { status: 404 });
        }

        const template = await db.query.voucherTemplates.findFirst({
          where: {
            id: Number(params.templateId),
          },
        });

        if (!template) {
          return new Response("Template not found", { status: 404 });
        }

        const routerosClient = clientManager.getClient(routeros.id);

        const users = (await routerosClient.write(
          "/ip/hotspot/user/print",
          {},
          [
            ...(comment ? [`comment=${comment}`] : []),
            ...(hotspotUserId ? [`.id=${hotspotUserId}`] : []),
          ],
        )) as {
          name: string;
          password: string;
          profile: string;
          "limit-bytes-total"?: string;
          "limit-uptime"?: string;
        }[];

        if (!users.length) {
          return new Response("Users not found", { status: 404 });
        }

        const profile = (await routerosClient
          .write("/ip/hotspot/user/profile/print", {}, [
            `name=${users[0].profile}`,
          ])
          .then((d) => d[0])) as { "on-login"?: string } | undefined;

        const { validity, price, sellingPrice } = extractOnLoginScriptPutFields(
          profile?.["on-login"] || "",
        );

        const [currency, language] = await Promise.all([
          currencySetting.get(),
          languageSetting.get(),
        ]);

        const finalPrice = Number(sellingPrice || price);

        const compileRes = compileVoucherTemplate({
          source: template.source,
          context: {
            dnsName: routeros.dnsName,
            hotspotName: routeros.hotspotName,
            users: users.map((user) => ({
              username: user.name,
              password: user.password,
              validity,
              price: finalPrice
                ? formatCurrency(finalPrice, {
                    currency,
                    locale: language,
                  })
                : undefined,
              dataLimit:
                user["limit-bytes-total"] && user["limit-bytes-total"] !== "0"
                  ? formatBytes(user["limit-bytes-total"], {
                      decimals: 2,
                      locale: language,
                    })
                  : undefined,
              timeLimit: user["limit-uptime"],
            })),
          },
        });

        if (!compileRes.ok) {
          return new Response("Failed to compile template", { status: 400 });
        }

        return new Response(
          compileRes.html +
            `<script>
              window.addEventListener("load", (event) => {
                window.print();
              });
            </script>`,
          {
            headers: {
              "Content-Type": "text/html; charset=UTF-8",
            },
          },
        );
      },
    },
  },
});
