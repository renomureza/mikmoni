import {
  keepPreviousData,
  QueryClient,
  queryOptions,
  useQuery,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { createServerFn } from "@tanstack/react-start";
import { compileVoucherTemplate } from "~/lib/handlebars";
import { authMiddleware } from "~/middlewares/auth";

const templates = [
  {
    name: "Minimal",
    handlebars: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    * {
      padding: 0;
      margin: 0;
    }
    *, 
    *::before, 
    *::after {
      box-sizing: border-box;
    }
    body {
      font-size: 14px;
      font-family: Helvetica, arial, sans-serif;
      display: flex;
      flex-wrap: wrap;
      gap: 4px;
      background-color: white;
    }
    .voucher {
      border: 1px solid black;
      width: 220px;
      display: flex;
      flex-direction: column;
    }
    .header {
      padding: 3px 10px;
      display: flex;
      justify-content: space-between;
      border-bottom: 1px solid black;
    }
    .body {
      padding: 10px;
      display: flex;
      gap: 10px;
    }
    .credential {
      display: flex;
      flex-direction: column;
      gap: 4px;
      width: 100%;
    }
    .credential__value,
    .credential__label {
      text-align: center;
      font-size: 12px;
    }
    .credential__label {
      color: rgb(31, 31, 31);
    }
    .credential__value {
      border: 1px solid black;
      font-weight: 600;
    }
    .qrcode {
      width: 100%;
      background-color: rgb(223, 223, 223);
    }
    .footer {
      border-top: 1px solid black;
      padding: 3px 10px;
      text-align: center;
    }

    @media print {
      .voucher {
        break-inside: avoid;
        page-break-inside: avoid;
      }
    }
  </style>
</head>
<body>
  {{#each users}}
    <div class="voucher">
      <div class="header">
        <div>Routeros</div>
        <div>{{inc @index}}</div>
      </div>
      <div class="body">
        <div class="credential">
          <div class="credential__item">
            <div class="credential__label">
              Username
            </div>
            <div class="credential__value">
              {{ name }}
            </div>
          </div>
          <div class="credential__item">
            <div class="credential__label">
              Password
            </div>
            <div class="credential__value">
              {{ password }}
            </div>
          </div>
        </div>
        <div class="qrcode">
          {{qrcode "hello"}}
        </div>
      </div>
      <div class="footer">
        <div>dsa</div>
        <div>dsa</div>
      </div>
    </div>
  {{/each}}
</body>
</html>`,
  },
  { name: "QR Code", handlebars: "" },
  { name: "Small", handlebars: "" },
];

const $getPrebuiltVoucherTemplates = createServerFn()
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const users = [
      {
        name: "user",
        password: "password",
        validity: "1d",
        timeLimit: "",
        dataLimit: "",
      },
    ];

    return templates.map(({ handlebars, ...template }) => {
      const compileRes = compileVoucherTemplate({
        source: handlebars,
        users: users,
      });
      return { ...template, html: compileRes.ok ? compileRes.html : "" };
    });
  });

function getPrebuiltVoucherTemplatesQueryOptions({
  queryFn,
}: {
  queryFn: (
    ...args: Parameters<typeof $getPrebuiltVoucherTemplates>
  ) => ReturnType<typeof $getPrebuiltVoucherTemplates>;
}) {
  return queryOptions({
    queryKey: ["prebuilt-voucher-templates"],
    queryFn: () => queryFn(),
    placeholderData: keepPreviousData,
  });
}

export function useGetPrebuiltVoucherTemplatesQuery() {
  const query = useServerFn($getPrebuiltVoucherTemplates);
  return useQuery(getPrebuiltVoucherTemplatesQueryOptions({ queryFn: query }));
}

export function ensureGetPrebuiltVoucherTemplatesQuery({
  queryClient,
}: {
  queryClient: QueryClient;
}) {
  return queryClient.query(
    getPrebuiltVoucherTemplatesQueryOptions({
      queryFn: $getPrebuiltVoucherTemplates,
    }),
  );
}

export function useGetPrebuiltVoucherTemplatesSuspenseQuery() {
  const getter = useServerFn($getPrebuiltVoucherTemplates);
  return useSuspenseQuery(
    getPrebuiltVoucherTemplatesQueryOptions({ queryFn: getter }),
  );
}
