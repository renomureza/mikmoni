import { Trans } from "@lingui/react/macro";
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
    <div className="@container space-y-4">
      <div className="flex w-full flex-col justify-between gap-2 @xl:flex-row">
        <h1 className="text-2xl font-semibold">
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

      <div className="relative flex h-190 flex-col gap-2 @3xl:flex-row">
        <div className="flex size-full flex-col border bg-white">
          <div className="w-full border-b px-3 py-2">
            <h2 className="font-medium">Handlebars</h2>
          </div>
          <div className="flex grow flex-col">
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
        <div className="flex size-full flex-col border bg-white">
          <div className="flex w-full justify-between border-b px-3 py-2">
            <h2 className="font-medium">
              <Trans>Preview</Trans>
            </h2>
            <div className="inline-flex items-center gap-1 text-xs">
              <div className="hidden text-neutral-500 sm:block">
                <Trans>User Mode</Trans>:
              </div>
              <select
                className="font-medium outline-none"
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
          <div className="h-full min-h-0 overflow-y-auto bg-white">
            {compiledHandlebars.ok ? (
              <iframe srcDoc={compiledHandlebars.html} className="size-full" />
            ) : (
              <div className="p-4 text-red-600">{compiledHandlebars.error}</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
