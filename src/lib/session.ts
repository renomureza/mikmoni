import { useSession as createSession } from "@tanstack/react-start/server";
import { getOrCreateAppSecret } from "~/utils/path";

type SessionUser = {
  userId: number;
  routerosId?: number;
};

export function getSession() {
  const password = getOrCreateAppSecret();
  return createSession<SessionUser>({
    password: password,
  });
}
