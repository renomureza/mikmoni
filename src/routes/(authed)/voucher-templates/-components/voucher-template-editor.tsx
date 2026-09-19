import { Editor } from "@monaco-editor/react";
import { useRouteContext } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import Button from "~/components/button";
import Input from "~/components/input";
import { userModeOptions, UserModeValue } from "~/contants/hotspot-user";
import {
  compileVoucherTemplate,
  getSampleVoucherTemplateContext,
} from "~/lib/handlebars";

type VoucherTemplateState = {
  source: string;
  name: string;
};

export default function VoucherTemplateEditor({
  onSubmit,
  voucher: initialVoucher,
  isUpdate,
  isLoading,
}: {
  voucher?: VoucherTemplateState;
  onSubmit: (voucher: VoucherTemplateState) => void;
  isUpdate?: boolean;
  isLoading?: boolean;
}) {
  const localization = useRouteContext({
    select: (s) => s.localization,
    from: "__root__",
  });
  const [voucher, setVoucher] = useState({
    name: initialVoucher?.name ?? "",
    source: initialVoucher?.source ?? "",
  });
  const [userMode, setUserMode] = useState<UserModeValue>("up");

  const context = useMemo(() => {
    return getSampleVoucherTemplateContext({
      mode: userMode,
      usersLength: 50,
      locale: localization.language,
      currency: localization.currency,
    });
  }, [userMode, localization]);

  const compiledHandlebars = compileVoucherTemplate({
    source: voucher.source,
    context: context,
  });

  return (
    <div className="space-y-4">
      <div className="flex w-full justify-between">
        <h1 className="text-xl font-semibold">
          {!isUpdate ? "Create Voucher Template" : "Update Voucher Template"}
        </h1>

        <div className="flex gap-3">
          <Input
            placeholder="My template"
            value={voucher.name}
            onChange={(e) => {
              setVoucher((prev) => ({ ...prev, name: e.target.value }));
            }}
          />
          <Button
            type="button"
            isLoading={isLoading}
            onClick={() => {
              onSubmit(voucher);
            }}
          >
            {!isUpdate ? "Create" : "Update"}
          </Button>
        </div>
      </div>

      <div className="flex gap-2 h-190 relative">
        <div className="border flex flex-col bg-white size-full">
          <div className="w-full border-b py-2 px-3">
            <h2 className="font-medium">Handlebars</h2>
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
          <div className="w-full border-b py-2 px-3 flex justify-between">
            <h2 className="font-medium">Preview</h2>
            <div className="inline-flex text-xs gap-1 items-center">
              <div className="text-neutral-500">User Mode:</div>
              <select
                className="outline-none font-medium"
                value={userMode}
                onChange={(e) => {
                  setUserMode(e.target.value as UserModeValue);
                }}
              >
                {userModeOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="overflow-y-auto bg-white min-h-0 h-full">
            {compiledHandlebars.ok ? (
              <iframe srcDoc={compiledHandlebars.html} className="size-full" />
            ) : (
              <div className="text-red-600 p-4">{compiledHandlebars.error}</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
