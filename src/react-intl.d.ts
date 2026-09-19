import enMessages from "./locales/en.json";

type Messages = typeof enMessages;

declare global {
  namespace FormatjsIntl {
    interface Message {
      ids: keyof Messages;
    }
  }
}
