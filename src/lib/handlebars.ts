import handlerbars from "handlebars";
import qrcode from "qrcode";

handlerbars.registerHelper("inc", function (value) {
  return parseInt(value) + 1;
});

handlerbars.registerHelper("qrcode", function (text) {
  let result = "";
  qrcode.toString(
    text,
    { errorCorrectionLevel: "H", margin: 0, type: "svg" },
    function (err, dataUrl) {
      if (!err) {
        result = dataUrl;
      }
    },
  );
  return new handlerbars.SafeString(result);
});

export function compileVoucherTemplate({
  source,
  users,
}: {
  source: string;
  users: {
    name: string;
    password: string;
    validity: string;
    timeLimit: string;
    dataLimit: string;
  }[];
}): { ok: true; html: string } | { ok: false; error: string } {
  try {
    const html = handlerbars.compile(source)({ users });
    return { ok: true, html };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Something went wrong",
    };
  }
}
