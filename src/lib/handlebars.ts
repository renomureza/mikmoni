import handlerbars from "handlebars";
import qrcode from "qrcode";
import { UserModeValue } from "~/contants/hotspot-user";
import { formatBytes, generateHotspotUserCredential } from "~/utils/routeros";

handlerbars.registerHelper("inc", function (value) {
  return parseInt(value) + 1;
});

handlerbars.registerHelper("eq", function (a, b) {
  return a === b;
});

handlerbars.registerHelper("concat", function (...args) {
  args.pop();
  // oxlint-disable-next-line typescript/no-base-to-string
  return args.join("");
});

handlerbars.registerHelper("qrcode", function (text) {
  let result = "";
  qrcode.toString(
    text,
    { errorCorrectionLevel: "M", margin: 0, type: "svg" },
    function (err, dataUrl) {
      if (!err) {
        result = dataUrl;
      }
    },
  );
  return new handlerbars.SafeString(result);
});

type VoucherTemplateContext = {
  hotspotName: string;
  dnsName: string;
  users: {
    username: string;
    password: string;
    validity: string;
    timeLimit?: string;
    dataLimit?: string;
    price?: string;
  }[];
};

export function getSampleVoucherTemplateContext({
  mode,
  usersLength,
  locale,
  currency,
}: {
  mode: UserModeValue;
  usersLength: number;
  locale: string;
  currency: string;
}): VoucherTemplateContext {
  const currencyFormatter = new Intl.NumberFormat(locale, {
    currency: currency,
    style: "currency",
    currencyDisplay: "narrowSymbol",
    maximumFractionDigits: 0,
  });

  return {
    hotspotName: "MyHotspot",
    dnsName: "myhotspot.net",
    users: Array.from({ length: usersLength }, () => {
      return {
        ...generateHotspotUserCredential({
          character: "mix2",
          length: 5,
          mode,
        }),
        validity: "1d",
        dataLimit: formatBytes(5.5 * 1024 ** 3, { locale, decimals: 2 }),
        timeLimit: "6h",
        price: currencyFormatter.format(5_000),
        sellingPrice: currencyFormatter.format(6_000),
      };
    }),
  };
}

export function compileVoucherTemplate({
  source,
  context,
}: {
  source: string;
  context: VoucherTemplateContext;
}): { ok: true; html: string } | { ok: false; error: string } {
  try {
    const html = handlerbars.compile(source)(context);
    return { ok: true, html };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Something went wrong",
    };
  }
}
