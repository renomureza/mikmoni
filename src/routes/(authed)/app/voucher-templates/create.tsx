import { createFileRoute } from "@tanstack/react-router";
import Editor from "@monaco-editor/react";
import { useRef, useState } from "react";
import { compileVoucherTemplate } from "~/lib/handlebars";
import Input from "~/components/input";
import Button from "~/components/button";
import { useCreateHotspotTemplateMutation } from "~/serverfns/vouer-templates";

export const Route = createFileRoute("/(authed)/app/voucher-templates/create")({
  component: RouteComponent,
});

const users = Array.from({ length: 30 }, (_, i) => ({
  name: `user${i}`,
  password: `password${i}`,
  validity: "1d",
  timeLimit: "",
  dataLimit: "",
}));

const initialSource = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  </head>
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
</html>`;

function RouteComponent() {
  const [voucher, setVoucher] = useState({ source: initialSource, name: "" });

  const compiledHandlebars = compileVoucherTemplate({
    source: voucher.source,
    users,
  });
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const createHotspotTemplateMutation = useCreateHotspotTemplateMutation();

  return (
    <div className="space-y-4">
      <div className="flex w-full justify-between">
        <h1 className="text-xl font-semibold">Create Voucher Template</h1>

        <div className="flex gap-3">
          <Input
            placeholder="My template"
            value={voucher.name}
            onChange={(e) => {
              setVoucher((prev) => ({ ...prev, name: e.target.value }));
            }}
            error={createHotspotTemplateMutation.data?.errors?.name?.[0]}
          />
          <Button
            type="button"
            onClick={() => {
              createHotspotTemplateMutation.mutate({ data: voucher });
            }}
          >
            Create
          </Button>
        </div>
        {/* <button
          type="button"
          onClick={() => {
            if (iframeRef.current) {
              iframeRef.current.contentWindow?.focus();
              iframeRef.current.contentWindow?.print();
            }
          }}
        >
          Print
        </button> */}
      </div>

      <div className="flex gap-2 h-190 relative">
        <div className="border flex flex-col bg-white size-full">
          <div className="w-full border-b text-neutral-500 py-2 px-3 font-mono">
            handlebars
          </div>
          <div className="grow flex flex-col">
            <Editor
              height="100%"
              language="handlebars"
              options={{
                padding: { top: 4, bottom: 4 },
                tabSize: 2,
                minimap: { enabled: false },
                fontFamily: '"Geist Mono", monospace',
                fontSize: 13,
              }}
              value={voucher.source}
              onChange={(value) => {
                setVoucher((prev) => ({ ...prev, source: value || "" }));
              }}
            />
          </div>
        </div>
        <div className="size-full bg-white border flex flex-col">
          <div className="w-full border-b text-neutral-500 py-2 px-3 font-mono">
            Preview
          </div>
          <div className="overflow-y-auto min-h-0 h-full bg-neutral-100">
            {compiledHandlebars.ok ? (
              <iframe
                ref={iframeRef}
                srcDoc={compiledHandlebars.html ?? ""}
                className="size-full p-6"
              />
            ) : (
              <div className="text-red-600 p-4">{compiledHandlebars.error}</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
